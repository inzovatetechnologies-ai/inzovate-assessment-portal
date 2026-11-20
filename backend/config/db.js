const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = [];
    this._idIndex = new Map();
    this._candidateIdIndex = new Map();
    this._saveTimer = null;
    this._dirty = false;
    this.load();
  }

  buildIndex() {
    this._idIndex.clear();
    this._candidateIdIndex.clear();
    for (let i = 0; i < this.data.length; i++) {
      const doc = this.data[i];
      if (doc._id) this._idIndex.set(String(doc._id), doc);
      if (doc.candidateId) this._candidateIdIndex.set(String(doc.candidateId).toUpperCase(), doc);
    }
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = [];
        this.flushSync();
      }
    } catch (err) {
      console.error(`Error loading collection ${this.name}:`, err);
      this.data = [];
    }
    this.buildIndex();
  }

  // High-Concurrency Batched Disk Persistence (Non-Blocking Debounce for 5000+ Concurrent Candidates)
  save(immediate = false) {
    this._dirty = true;
    if (immediate) {
      this.flushSync();
      return;
    }
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this.flushAsync();
    }, 400); // 400ms micro-batching
  }

  async flushAsync() {
    if (!this._dirty) return;
    this._dirty = false;
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving collection ${this.name}:`, err);
    }
  }

  flushSync() {
    this._dirty = false;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error syncing collection ${this.name}:`, err);
    }
  }

  matches(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;
    if (query.$or && Array.isArray(query.$or)) {
      const anyMatch = query.$or.some(subQuery => this.matches(doc, subQuery));
      if (!anyMatch) return false;
    }
    for (const key of Object.keys(query)) {
      if (key === '$or') continue;
      const qVal = query[key];
      const docVal = doc[key];

      if (qVal && typeof qVal === 'object' && !Array.isArray(qVal)) {
        if (qVal.$in && Array.isArray(qVal.$in)) {
          if (!qVal.$in.includes(docVal)) return false;
        } else if (qVal.$nin && Array.isArray(qVal.$nin)) {
          if (qVal.$nin.includes(docVal)) return false;
        } else if (qVal.$ne !== undefined) {
          if (docVal === qVal.$ne) return false;
        } else if (qVal.$regex) {
          const reg = new RegExp(qVal.$regex, qVal.$options || 'i');
          if (!reg.test(String(docVal || ''))) return false;
        } else if (qVal.$gt !== undefined && !(docVal > qVal.$gt)) {
          return false;
        } else if (qVal.$gte !== undefined && !(docVal >= qVal.$gte)) {
          return false;
        } else if (qVal.$lt !== undefined && !(docVal < qVal.$lt)) {
          return false;
        } else if (qVal.$lte !== undefined && !(docVal <= qVal.$lte)) {
          return false;
        }
      } else {
        if (docVal !== qVal) return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const results = this.data.filter(doc => this.matches(doc, query));
    return results.map(d => ({ ...d }));
  }

  async findOne(query = {}) {
    const keys = Object.keys(query);
    if (keys.length === 1) {
      if (keys[0] === '_id' && typeof query._id === 'string') {
        const found = this._idIndex.get(query._id);
        return found ? { ...found } : null;
      }
      if (keys[0] === 'candidateId' && typeof query.candidateId === 'string') {
        const found = this._candidateIdIndex.get(query.candidateId.toUpperCase());
        return found ? { ...found } : null;
      }
    }
    const doc = this.data.find(d => this.matches(d, query));
    return doc ? { ...doc } : null;
  }

  async findById(id) {
    if (typeof id === 'string') {
      const found = this._idIndex.get(id);
      if (found) return { ...found };
    }
    return this.findOne({ _id: id });
  }

  async create(docData) {
    const now = new Date().toISOString();
    const newDoc = {
      _id: docData._id || uuidv4(),
      ...docData,
      createdAt: docData.createdAt || now,
      updatedAt: now,
    };
    this.data.push(newDoc);
    if (newDoc._id) this._idIndex.set(String(newDoc._id), newDoc);
    if (newDoc.candidateId) this._candidateIdIndex.set(String(newDoc.candidateId).toUpperCase(), newDoc);
    this.save();
    return { ...newDoc };
  }

  async insertMany(docs) {
    const now = new Date().toISOString();
    const created = docs.map(d => ({
      _id: d._id || uuidv4(),
      ...d,
      createdAt: d.createdAt || now,
      updatedAt: now,
    }));
    for (const d of created) {
      this.data.push(d);
      if (d._id) this._idIndex.set(String(d._id), d);
      if (d.candidateId) this._candidateIdIndex.set(String(d.candidateId).toUpperCase(), d);
    }
    this.save();
    return created;
  }

  async updateOne(query, updateData) {
    const index = this.data.findIndex(d => this.matches(d, query));
    if (index === -1) return null;
    const existing = this.data[index];
    const updatePayload = updateData.$set ? { ...updateData.$set } : { ...updateData };
    delete updatePayload._id; // protect ID

    const updated = {
      ...existing,
      ...updatePayload,
      updatedAt: new Date().toISOString(),
    };
    this.data[index] = updated;
    if (updated._id) this._idIndex.set(String(updated._id), updated);
    if (updated.candidateId) this._candidateIdIndex.set(String(updated.candidateId).toUpperCase(), updated);
    this.save();
    return { ...updated };
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    return this.updateOne({ _id: id }, updateData);
  }

  async deleteOne(query) {
    const index = this.data.findIndex(d => this.matches(d, query));
    if (index === -1) return false;
    const doc = this.data[index];
    this.data.splice(index, 1);
    if (doc._id) this._idIndex.delete(String(doc._id));
    if (doc.candidateId) this._candidateIdIndex.delete(String(doc.candidateId).toUpperCase());
    this.save();
    return true;
  }

  async deleteMany(query) {
    const initialLen = this.data.length;
    this.data = this.data.filter(d => !this.matches(d, query));
    if (this.data.length !== initialLen) {
      this.buildIndex();
      this.save();
    }
    return { deletedCount: initialLen - this.data.length };
  }

  async findByIdAndDelete(id) {
    return this.deleteOne({ _id: id });
  }

  async countDocuments(query = {}) {
    return this.data.filter(d => this.matches(d, query)).length;
  }
}

// Master collection instances registry
const collections = {};

function getCollection(name) {
  if (!collections[name]) {
    collections[name] = new Collection(name);
  }
  return collections[name];
}

module.exports = {
  getCollection,
  Collection,
};
