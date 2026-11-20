const JOB_ROLES = [
  { "_id": "role-soft-dev", "domainId": "dom-01", "title": "Software Developer", "code": "SD-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-fullstack", "domainId": "dom-01", "title": "Full Stack Developer", "code": "FSD-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-frontend", "domainId": "dom-01", "title": "Frontend Developer", "code": "FED-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-backend", "domainId": "dom-01", "title": "Backend Developer", "code": "BED-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-java-dev", "domainId": "dom-01", "title": "Java Developer", "code": "JAVA-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-python-dev", "domainId": "dom-01", "title": "Python Developer", "code": "PY-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-data-analyst", "domainId": "dom-02", "title": "Data Analyst", "code": "DA-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-data-scientist", "domainId": "dom-02", "title": "Data Scientist", "code": "DS-01", "passingThreshold": 65, "status": "active" },
  { "_id": "role-ai-ml", "domainId": "dom-03", "title": "AI/ML Engineer", "code": "AIML-01", "passingThreshold": 65, "status": "active" },
  { "_id": "role-uiux", "domainId": "dom-04", "title": "UI/UX Designer", "code": "UIUX-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-cloud-eng", "domainId": "dom-05", "title": "Cloud Engineer", "code": "CE-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-devops", "domainId": "dom-06", "title": "DevOps Engineer", "code": "DO-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-cyber-analyst", "domainId": "dom-07", "title": "Cybersecurity Analyst", "code": "SEC-01", "passingThreshold": 65, "status": "active" },
  { "_id": "role-qa-eng", "domainId": "dom-08", "title": "QA Engineer", "code": "QA-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-mobile-dev", "domainId": "dom-09", "title": "Mobile Developer", "code": "MOB-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-seo-exec", "domainId": "dom-10", "title": "SEO Executive", "code": "SEO-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-bde", "domainId": "dom-11", "title": "Business Development Executive", "code": "BDE-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-hr-exec", "domainId": "dom-12", "title": "HR Executive / Recruiter", "code": "HR-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-process-assoc", "domainId": "dom-12", "title": "Process Associate", "code": "OPS-01", "passingThreshold": 60, "status": "active" },
  { "_id": "role-proc-assoc-direct", "domainId": "dom-13", "title": "Process Associate", "code": "ROLE-PA-2026", "passingThreshold": 55, "status": "active" }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const domainId = urlObj.searchParams.get('domainId');
  const filtered = domainId ? JOB_ROLES.filter(r => r.domainId === domainId) : JOB_ROLES;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(filtered));
}
