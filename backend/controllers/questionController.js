const { getCollection } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function listQuestions(req, res) {
  try {
    const { section, roleId, difficulty, category, isApproved } = req.query;
    const col = getCollection('questions');
    let questions = await col.find({});

    if (section) questions = questions.filter(q => q.section === section);
    if (roleId) questions = questions.filter(q => q.roleId === roleId);
    if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
    if (category) questions = questions.filter(q => q.category === category);
    if (isApproved !== undefined) {
      const boolVal = isApproved === 'true';
      questions = questions.filter(q => Boolean(q.isApproved) === boolVal);
    }

    res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createQuestion(req, res) {
  try {
    const col = getCollection('questions');
    const newQ = await col.create({
      ...req.body,
      isApproved: req.body.isApproved !== undefined ? req.body.isApproved : true,
      createdBy: req.user ? req.user.email : 'admin@inzovate.com'
    });

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: req.user ? req.user.email : 'admin@inzovate.com',
      actorRole: req.user ? req.user.role : 'Admin',
      action: 'QUESTION_CREATED',
      target: newQ._id,
      details: `Created question in ${newQ.section} (${newQ.category})`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, question: newQ });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const col = getCollection('questions');
    const updated = await col.findByIdAndUpdate(id, req.body);
    res.json({ success: true, question: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    const col = getCollection('questions');
    await col.findByIdAndDelete(id);
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function approveQuestion(req, res) {
  try {
    const { id } = req.params;
    const col = getCollection('questions');
    const question = await col.findById(id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const updated = await col.updateOne(
      { _id: id },
      {
        isApproved: true,
        approvedBy: req.user ? req.user.email : 'admin@inzovate.com',
        approvedAt: new Date().toISOString()
      }
    );

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: req.user ? req.user.email : 'admin@inzovate.com',
      actorRole: req.user ? req.user.role : 'Admin',
      action: 'QUESTION_APPROVED',
      target: id,
      details: `Approved draft question for production question bank.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Question approved for active assessments.', question: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// AI Question Generation Engine (with mandatory admin review)
async function generateAiDraftQuestions(req, res) {
  try {
    const { domain, jobRole, topic, difficulty = 'Medium', count = 3, format = 'MCQ' } = req.body;

    if (!topic || !jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Topic and Job Role are required for AI draft generation.'
      });
    }

    const drafts = [];
    for (let i = 1; i <= Math.min(Number(count) || 3, 5); i++) {
      drafts.push({
        _id: `draft-ai-${uuidv4().substring(0, 8)}`,
        section: 'section-3',
        category: domain || 'Domain Knowledge',
        topic: `${topic} - Concept ${i}`,
        difficulty,
        question: `[AI Draft] In an enterprise ${jobRole} environment, how does implementing ${topic} (Scenario ${i}) optimize system resilience and maintain high throughput under peak traffic loads?`,
        options: [
          { id: 'A', text: `By applying declarative configuration, asynchronous decoupling, and caching layers to prevent cascading failure.` },
          { id: 'B', text: `By increasing synchronous poll frequency and disabling database connection pools.` },
          { id: 'C', text: `By bypassing network firewalls and storing session tokens in unencrypted cookies.` },
          { id: 'D', text: `By manually restarting application server processes every hour.` }
        ],
        correctOption: 'A',
        explanation: `Enterprise best practices for ${topic} emphasize asynchronous decoupling, resilience patterns (circuit breakers/caching), and bounded context isolation.`,
        marks: 1,
        isApproved: false, // Mandatory Admin approval required!
        generatedByAi: true,
        aiGeneratedAt: new Date().toISOString()
      });
    }

    // Save as draft questions
    const col = getCollection('questions');
    await col.insertMany(drafts);

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: req.user ? req.user.email : 'admin@inzovate.com',
      actorRole: req.user ? req.user.role : 'Admin',
      action: 'AI_QUESTIONS_GENERATED',
      target: `${jobRole} - ${topic}`,
      details: `Generated ${drafts.length} AI draft questions awaiting review.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Generated ${drafts.length} AI draft questions. Review and approve to activate.`,
      drafts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  generateAiDraftQuestions
};
