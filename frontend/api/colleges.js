import fs from 'fs';
import path from 'path';

let colleges = [];
try {
  const filePath = path.join(process.cwd(), 'api', 'data', 'colleges.json');
  if (fs.existsSync(filePath)) {
    colleges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
} catch (e) {
  colleges = [];
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(colleges));
}
