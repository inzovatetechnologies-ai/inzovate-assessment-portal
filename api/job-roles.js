const DOMAINS = [
  { "_id": "dom-01", "name": "Software Development", "code": "SOFT-DEV", "description": "Core software engineering, full stack, frontend, backend and language-specific engineering roles.", "icon": "Code2", "color": "#0066FF", "status": "active" },
  { "_id": "dom-02", "name": "Data & Analytics", "code": "DATA-ANA", "description": "Business intelligence, data visualization, statistical analysis, and data engineering.", "icon": "BarChart3", "color": "#0EA5E9", "status": "active" },
  { "_id": "dom-03", "name": "Artificial Intelligence", "code": "AI-ML", "description": "Machine learning, deep learning, NLP, computer vision, and AI system engineering.", "icon": "Cpu", "color": "#8B5CF6", "status": "active" },
  { "_id": "dom-04", "name": "UI/UX & Design", "code": "UI-UX", "description": "User experience research, interaction design, visual design, wireframing and design systems.", "icon": "Palette", "color": "#EC4899", "status": "active" },
  { "_id": "dom-05", "name": "Cloud Computing", "code": "CLOUD", "description": "AWS, Azure, Google Cloud infrastructure, virtualization, VPC and cloud security.", "icon": "Cloud", "color": "#0284C7", "status": "active" },
  { "_id": "dom-06", "name": "DevOps & Infrastructure", "code": "DEVOPS", "description": "CI/CD pipelines, Docker, Kubernetes, Terraform, Linux systems and monitoring.", "icon": "Terminal", "color": "#10B981", "status": "active" },
  { "_id": "dom-07", "name": "Cybersecurity", "code": "SEC", "description": "Vulnerability assessment, network defense, threat intelligence and SOC operations.", "icon": "ShieldAlert", "color": "#EF4444", "status": "active" },
  { "_id": "dom-08", "name": "Software Testing & QA", "code": "QA-TEST", "description": "Manual testing, Selenium/Playwright automation, test life cycle and performance testing.", "icon": "CheckCircle2", "color": "#14B8A6", "status": "active" },
  { "_id": "dom-09", "name": "Mobile Development", "code": "MOBILE", "description": "Android (Kotlin), iOS (Swift), Flutter and React Native cross-platform mobile apps.", "icon": "Smartphone", "color": "#6366F1", "status": "active" },
  { "_id": "dom-10", "name": "Digital Marketing & SEO", "code": "DIGI-MKT", "description": "Search engine optimization, Google Ads, Meta Ads, social media strategy and analytics.", "icon": "Megaphone", "color": "#F59E0B", "status": "active" },
  { "_id": "dom-11", "name": "Business & Sales", "code": "BIZ-SALES", "description": "Lead generation, sales pipeline, client relationship management, negotiation and BD strategy.", "icon": "Briefcase", "color": "#3B82F6", "status": "active" },
  { "_id": "dom-12", "name": "HR & Operations", "code": "HR-OPS", "description": "Talent acquisition, screening, interview coordination, process compliance and operations.", "icon": "Users2", "color": "#059669", "status": "active" },
  { "_id": "dom-13", "name": "Process Associate", "code": "PROC-ASSOC", "description": "Business process management, customer support, data verification, back-office operations, voice & non-voice workflow handling.", "icon": "Headphones", "color": "#0284C7", "status": "active" }
];

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
  const isDomains = urlObj.pathname.includes('domains') || urlObj.searchParams.get('type') === 'domains';

  if (isDomains) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      domains: DOMAINS
    }));
  }

  const domainId = urlObj.searchParams.get('domainId');
  const filtered = domainId ? JOB_ROLES.filter(r => r.domainId === domainId) : JOB_ROLES;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    roles: filtered
  }));
}
