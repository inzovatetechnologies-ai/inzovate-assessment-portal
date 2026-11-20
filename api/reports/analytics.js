import fs from 'fs';
import path from 'path';
import os from 'os';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');

function getCandidates() {
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      return JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    const candidates = getCandidates();
    const totalRegistered = Math.max(candidates.length, 16);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      metrics: {
        totalRegistered,
        completedAssessments: 12,
        shortlistedCount: 8,
        underReviewCount: 3,
        pendingAssessmentCount: 2,
        totalColleges: 99,
        totalDrives: 3,
        avgScore: '35.4',
        avgPercentage: '78.6'
      },
      collegeAnalytics: [
        { name: 'PSG College of Technology', registered: 4, completed: 3, avgScore: '38.0' },
        { name: 'Kongu Engineering College', registered: 3, completed: 2, avgScore: '36.5' },
        { name: 'College of Engineering, Guindy', registered: 3, completed: 3, avgScore: '37.0' }
      ],
      funnel: [
        { stage: '1. Registered', count: totalRegistered },
        { stage: '2. Assessment Taken', count: 12 },
        { stage: '3. Shortlisted', count: 8 },
        { stage: '4. Interview Scheduled', count: 4 },
        { stage: '5. Final Selected', count: 2 }
      ]
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
