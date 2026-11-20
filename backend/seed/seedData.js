const bcrypt = require('bcryptjs');
const { getCollection } = require('../config/db');

const DOMAINS_DATA = [
  {
    _id: 'dom-01',
    name: 'Software Development',
    code: 'SOFT-DEV',
    description: 'Core software engineering, full stack, frontend, backend and language-specific engineering roles.',
    icon: 'Code2',
    color: '#0066FF',
    status: 'active'
  },
  {
    _id: 'dom-02',
    name: 'Data & Analytics',
    code: 'DATA-ANA',
    description: 'Business intelligence, data visualization, statistical analysis, and data engineering.',
    icon: 'BarChart3',
    color: '#0EA5E9',
    status: 'active'
  },
  {
    _id: 'dom-03',
    name: 'Artificial Intelligence',
    code: 'AI-ML',
    description: 'Machine learning, deep learning, NLP, computer vision, and AI system engineering.',
    icon: 'Cpu',
    color: '#8B5CF6',
    status: 'active'
  },
  {
    _id: 'dom-04',
    name: 'UI/UX & Design',
    code: 'UI-UX',
    description: 'User experience research, interaction design, visual design, wireframing and design systems.',
    icon: 'Palette',
    color: '#EC4899',
    status: 'active'
  },
  {
    _id: 'dom-05',
    name: 'Cloud Computing',
    code: 'CLOUD',
    description: 'AWS, Azure, Google Cloud infrastructure, virtualization, VPC and cloud security.',
    icon: 'Cloud',
    color: '#0284C7',
    status: 'active'
  },
  {
    _id: 'dom-06',
    name: 'DevOps & Infrastructure',
    code: 'DEVOPS',
    description: 'CI/CD pipelines, Docker, Kubernetes, Terraform, Linux systems and monitoring.',
    icon: 'Terminal',
    color: '#10B981',
    status: 'active'
  },
  {
    _id: 'dom-07',
    name: 'Cybersecurity',
    code: 'SEC',
    description: 'Vulnerability assessment, network defense, threat intelligence and SOC operations.',
    icon: 'ShieldAlert',
    color: '#EF4444',
    status: 'active'
  },
  {
    _id: 'dom-08',
    name: 'Software Testing & QA',
    code: 'QA-TEST',
    description: 'Manual testing, Selenium/Playwright automation, test life cycle and performance testing.',
    icon: 'CheckCircle2',
    color: '#14B8A6',
    status: 'active'
  },
  {
    _id: 'dom-09',
    name: 'Mobile Development',
    code: 'MOBILE',
    description: 'Android (Kotlin), iOS (Swift), Flutter and React Native cross-platform mobile apps.',
    icon: 'Smartphone',
    color: '#6366F1',
    status: 'active'
  },
  {
    _id: 'dom-10',
    name: 'Digital Marketing & SEO',
    code: 'DIGI-MKT',
    description: 'Search engine optimization, Google Ads, Meta Ads, social media strategy and analytics.',
    icon: 'Megaphone',
    color: '#F59E0B',
    status: 'active'
  },
  {
    _id: 'dom-11',
    name: 'Business & Sales',
    code: 'BIZ-SALES',
    description: 'Lead generation, sales pipeline, client relationship management, negotiation and BD strategy.',
    icon: 'Briefcase',
    color: '#3B82F6',
    status: 'active'
  },
  {
    _id: 'dom-12',
    name: 'HR & Operations',
    code: 'HR-OPS',
    description: 'Talent acquisition, screening, interview coordination, process compliance and operations.',
    icon: 'Users2',
    color: '#059669',
    status: 'active'
  },
  {
    _id: 'dom-13',
    name: 'Process Associate',
    code: 'PROC-ASSOC',
    description: 'Business process management, customer support, data verification, back-office operations, voice & non-voice workflow handling.',
    icon: 'Headphones',
    color: '#0284C7',
    status: 'active'
  }
];

const JOB_ROLES_DATA = [
  // Software Development
  {
    _id: 'role-soft-dev',
    domainId: 'dom-01',
    title: 'Software Developer',
    code: 'SD-01',
    description: 'Develop robust, scalable enterprise software solutions using modern programming languages and data structures.',
    skills: ['Data Structures', 'OOP', 'SQL', 'Algorithms', 'Debugging', 'SDLC'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-fullstack',
    domainId: 'dom-01',
    title: 'Full Stack Developer',
    code: 'FSD-01',
    description: 'Build end-to-end web applications with modern frontend frameworks and backend REST APIs.',
    skills: ['React', 'Node.js', 'REST APIs', 'PostgreSQL', 'TypeScript'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-frontend',
    domainId: 'dom-01',
    title: 'Frontend Developer',
    code: 'FED-01',
    description: 'Craft responsive, pixel-perfect user interfaces with modern JavaScript, React, and CSS.',
    skills: ['JavaScript ES6+', 'React', 'HTML5/CSS3', 'Performance', 'State Management'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-backend',
    domainId: 'dom-01',
    title: 'Backend Developer',
    code: 'BED-01',
    description: 'Architect scalable server applications, database schemas, and microservices.',
    skills: ['Node.js/Express', 'Database Optimization', 'Microservices', 'Authentication', 'Caching'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-java-dev',
    domainId: 'dom-01',
    title: 'Java Developer',
    code: 'JAVA-01',
    description: 'Enterprise backend development using Core Java, Spring Boot, Hibernate and SQL.',
    skills: ['Core Java', 'Spring Boot', 'Hibernate', 'Multithreading', 'Collections Framework'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-python-dev',
    domainId: 'dom-01',
    title: 'Python Developer',
    code: 'PY-01',
    description: 'Build clean, high-performance Python services with Django/FastAPI and data processing.',
    skills: ['Python 3', 'FastAPI/Django', 'OOP', 'Data Wrangling', 'Asyncio'],
    passingThreshold: 60,
    status: 'active'
  },

  // Data & Analytics
  {
    _id: 'role-data-analyst',
    domainId: 'dom-02',
    title: 'Data Analyst',
    code: 'DA-01',
    description: 'Analyze complex datasets, build executive dashboards in Power BI/Excel, and write analytical SQL.',
    skills: ['Advanced Excel', 'SQL', 'Python Pandas', 'Power BI', 'Statistics'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-data-scientist',
    domainId: 'dom-02',
    title: 'Data Scientist',
    code: 'DS-01',
    description: 'Develop predictive models, perform statistical hypothesis testing, and extract machine learning insights.',
    skills: ['Statistics', 'Python Scikit-Learn', 'Feature Engineering', 'SQL', 'Hypothesis Testing'],
    passingThreshold: 65,
    status: 'active'
  },

  // AI & ML
  {
    _id: 'role-ai-ml',
    domainId: 'dom-03',
    title: 'AI/ML Engineer',
    code: 'AIML-01',
    description: 'Design and deploy deep learning, neural networks, computer vision, and NLP models.',
    skills: ['PyTorch/TensorFlow', 'Deep Learning', 'Transformers', 'Model Deployment', 'Data Pipelines'],
    passingThreshold: 65,
    status: 'active'
  },

  // UI/UX Design
  {
    _id: 'role-uiux',
    domainId: 'dom-04',
    title: 'UI/UX Designer',
    code: 'UIUX-01',
    description: 'Design intuitive digital experiences, conduct usability studies, and build Figma design systems.',
    skills: ['Figma', 'Wireframing', 'User Research', 'Design Systems', 'Usability Testing'],
    passingThreshold: 60,
    status: 'active'
  },

  // Cloud Computing
  {
    _id: 'role-cloud-eng',
    domainId: 'dom-05',
    title: 'Cloud Engineer',
    code: 'CLOUD-01',
    description: 'Provision and maintain resilient, cost-effective infrastructure on AWS/Azure with VPC and IAM.',
    skills: ['AWS (EC2, S3, IAM, VPC)', 'Cloud Security', 'Networking', 'Serverless', 'Monitoring'],
    passingThreshold: 60,
    status: 'active'
  },

  // DevOps & Infrastructure
  {
    _id: 'role-devops',
    domainId: 'dom-06',
    title: 'DevOps Engineer',
    code: 'DO-01',
    description: 'Automate build, test, and release cycles using CI/CD pipelines, Docker, Kubernetes and Linux.',
    skills: ['Linux Administration', 'Git', 'Docker', 'Kubernetes', 'CI/CD Pipelines'],
    passingThreshold: 60,
    status: 'active'
  },

  // Cybersecurity
  {
    _id: 'role-cyber-analyst',
    domainId: 'dom-07',
    title: 'Cybersecurity Analyst',
    code: 'SEC-01',
    description: 'Detect, analyze, and mitigate security threats, vulnerabilities, and unauthorized network intrusions.',
    skills: ['Network Security', 'SOC Operations', 'OWASP Top 10', 'Vulnerability Assessment', 'Incident Response'],
    passingThreshold: 65,
    status: 'active'
  },

  // Testing & QA
  {
    _id: 'role-qa-eng',
    domainId: 'dom-08',
    title: 'QA Engineer',
    code: 'QA-01',
    description: 'Design test scenarios, execute test cases, report bugs, and write automated test scripts.',
    skills: ['STLC & SDLC', 'Manual Testing', 'Selenium/Automation', 'API Testing', 'Bug Tracking'],
    passingThreshold: 60,
    status: 'active'
  },

  // Mobile Development
  {
    _id: 'role-mobile-dev',
    domainId: 'dom-09',
    title: 'Mobile Developer',
    code: 'MOB-01',
    description: 'Develop smooth native and hybrid mobile applications for Android and iOS using Flutter/React Native.',
    skills: ['Mobile UI/UX', 'Flutter/React Native', 'API Integration', 'App Lifecycle', 'State Management'],
    passingThreshold: 60,
    status: 'active'
  },

  // Digital Marketing
  {
    _id: 'role-seo-exec',
    domainId: 'dom-10',
    title: 'SEO Executive',
    code: 'SEO-01',
    description: 'Optimize web properties for search visibility, technical crawlability, and organic conversions.',
    skills: ['On-Page SEO', 'Technical SEO', 'Google Search Console', 'Keyword Research', 'Link Building'],
    passingThreshold: 60,
    status: 'active'
  },

  // Business & Sales
  {
    _id: 'role-bde',
    domainId: 'dom-11',
    title: 'Business Development Executive',
    code: 'BDE-01',
    description: 'Generate qualified B2B leads, execute sales discovery calls, negotiate proposals, and close clients.',
    skills: ['Lead Generation', 'CRM Management', 'Sales Funnel', 'Client Communication', 'Negotiation'],
    passingThreshold: 60,
    status: 'active'
  },

  // HR & Operations
  {
    _id: 'role-hr-exec',
    domainId: 'dom-12',
    title: 'HR Executive / Recruiter',
    code: 'HR-01',
    description: 'Source top talent, screen candidates, coordinate interview panels, and manage employee onboarding.',
    skills: ['Recruitment Lifecycle', 'Candidate Screening', 'ATS Software', 'HR Policies', 'Communication'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-process-assoc',
    domainId: 'dom-12',
    title: 'Process Associate',
    code: 'OPS-01',
    description: 'Ensure operational accuracy, process documentation compliance, and client service delivery.',
    skills: ['Data Accuracy', 'Excel Reporting', 'Process Compliance', 'Email Etiquette', 'Quality Control'],
    passingThreshold: 60,
    status: 'active'
  },
  {
    _id: 'role-proc-assoc-direct',
    domainId: 'dom-13',
    title: 'Process Associate',
    code: 'ROLE-PA-2026',
    description: 'Ensure operational accuracy, process documentation compliance, customer correspondence, and service level delivery.',
    skills: ['Process Management', 'Customer Communication', 'Email Etiquette', 'SLA Tracking', 'Data Verification'],
    passingThreshold: 55,
    status: 'active'
  }
];

let COLLEGES_DATA = [];
try {
  const fs = require('fs');
  const path = require('path');
  const colFile = path.join(__dirname, '..', 'data', 'colleges.json');
  if (fs.existsSync(colFile)) {
    COLLEGES_DATA = JSON.parse(fs.readFileSync(colFile, 'utf8'));
  }
} catch (e) {}

if (!COLLEGES_DATA || COLLEGES_DATA.length === 0) {
  COLLEGES_DATA = [
    {
      _id: 'col-01',
      name: 'National Institute of Technology (NIT)',
      code: 'NIT-01',
      university: 'Autonomous / Deemed',
      address: 'Tiruchirappalli, Tamil Nadu, 620015',
      placementOfficer: 'Dr. R. Ramanathan',
      contactEmail: 'placements@nitt.edu',
      phoneNumber: '+91 94431 82910',
      departments: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical', 'Electrical'],
      graduationYears: ['2025', '2026', '2027'],
      status: 'active'
    }
  ];
}

const RECRUITMENT_DRIVES_DATA = [
  {
    _id: 'drive-01',
    driveId: 'INZ-DRIVE-2026-01',
    name: 'Inzovate Pan-India Campus Recruitment 2026 – Phase 1',
    collegeId: 'col-01',
    collegeName: 'National Institute of Technology (NIT)',
    recruitmentDate: '2026-11-25',
    registrationDeadline: '2026-11-23',
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
    eligibleGraduationYears: ['2026'],
    availableJobRoles: ['role-soft-dev', 'role-fullstack', 'role-data-analyst', 'role-cloud-eng', 'role-devops', 'role-uiux'],
    maxCandidates: 500,
    status: 'active',
    instructions: 'Please bring college ID, ensure desktop/laptop with working webcam and audio. Assessment duration: 60 minutes.'
  },
  {
    _id: 'drive-02',
    driveId: 'INZ-DRIVE-2026-02',
    name: 'PSG Tech Technical & Business Hiring Drive 2026',
    collegeId: 'col-02',
    collegeName: 'PSG College of Technology',
    recruitmentDate: '2026-12-02',
    registrationDeadline: '2026-11-30',
    eligibleDepartments: ['Computer Science', 'Information Tech', 'ECE', 'EEE'],
    eligibleGraduationYears: ['2026'],
    availableJobRoles: ['role-soft-dev', 'role-java-dev', 'role-python-dev', 'role-qa-eng', 'role-bde', 'role-hr-exec'],
    maxCandidates: 400,
    status: 'active',
    instructions: 'Desktop/laptop mandatory. Ensure camera is clear and uninterrupted network connectivity.'
  },
  {
    _id: 'drive-03',
    driveId: 'INZ-DRIVE-2026-03',
    name: 'Anna University Tech Fresher Drive 2026',
    collegeId: 'col-03',
    collegeName: 'College of Engineering, Guindy (Anna University)',
    recruitmentDate: '2026-12-10',
    registrationDeadline: '2026-12-08',
    eligibleDepartments: ['CSE', 'IT', 'ECE'],
    eligibleGraduationYears: ['2026'],
    availableJobRoles: ['role-soft-dev', 'role-frontend', 'role-backend', 'role-cyber-analyst', 'role-data-analyst'],
    maxCandidates: 350,
    status: 'active',
    instructions: 'Online examination portal access link will be active 15 minutes before the scheduled time.'
  }
];

module.exports = {
  DOMAINS_DATA,
  JOB_ROLES_DATA,
  COLLEGES_DATA,
  RECRUITMENT_DRIVES_DATA
};
