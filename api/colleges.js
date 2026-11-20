import fs from 'fs';
import path from 'path';

let colleges = [];
try {
  const possiblePaths = [
    path.join(import.meta.dirname, 'data', 'colleges.json'),
    path.join(process.cwd(), 'api', 'data', 'colleges.json'),
    path.join(process.cwd(), 'data', 'colleges.json'),
    path.join(process.cwd(), 'frontend', 'data', 'colleges.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      colleges = JSON.parse(fs.readFileSync(p, 'utf8'));
      break;
    }
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
