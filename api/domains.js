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
  res.end(JSON.stringify({
    success: true,
    domains: DOMAINS
  }));
}
