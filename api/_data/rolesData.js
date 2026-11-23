export const DOMAINS = [
  { _id: 'dom-01', name: 'Software Development', code: 'SOFT-DEV' },
  { _id: 'dom-02', name: 'Data & Analytics', code: 'DATA-ANA' },
  { _id: 'dom-03', name: 'Artificial Intelligence', code: 'AI-ML' },
  { _id: 'dom-04', name: 'UI/UX & Design', code: 'UI-UX' },
  { _id: 'dom-05', name: 'Cloud Computing', code: 'CLOUD' },
  { _id: 'dom-06', name: 'DevOps & Infrastructure', code: 'DEVOPS' },
  { _id: 'dom-07', name: 'Cybersecurity', code: 'SEC' },
  { _id: 'dom-08', name: 'Software Testing & QA', code: 'QA-TEST' },
  { _id: 'dom-09', name: 'Mobile Development', code: 'MOBILE' },
  { _id: 'dom-10', name: 'Digital Marketing & SEO', code: 'DIGI-MKT' },
  { _id: 'dom-11', name: 'Business & Sales', code: 'BIZ-SALES' },
  { _id: 'dom-12', name: 'HR & Operations', code: 'HR-OPS' },
  { _id: 'dom-13', name: 'Process Associate', code: 'PROC-ASSOC' }
];

export const JOB_ROLES = [
  { _id: 'role-soft-dev', domainId: 'dom-01', title: 'Software Developer', code: 'SD-01' },
  { _id: 'role-fullstack', domainId: 'dom-01', title: 'Full Stack Developer', code: 'FSD-01' },
  { _id: 'role-frontend', domainId: 'dom-01', title: 'Frontend Developer', code: 'FED-01' },
  { _id: 'role-backend', domainId: 'dom-01', title: 'Backend Developer', code: 'BED-01' },
  { _id: 'role-java-dev', domainId: 'dom-01', title: 'Java Developer', code: 'JAVA-01' },
  { _id: 'role-python-dev', domainId: 'dom-01', title: 'Python Developer', code: 'PY-01' },
  { _id: 'role-data-analyst', domainId: 'dom-02', title: 'Data Analyst', code: 'DA-01' },
  { _id: 'role-data-scientist', domainId: 'dom-02', title: 'Data Scientist', code: 'DS-01' },
  { _id: 'role-ai-ml', domainId: 'dom-03', title: 'AI/ML Engineer', code: 'AIML-01' },
  { _id: 'role-uiux', domainId: 'dom-04', title: 'UI/UX Designer', code: 'UIUX-01' },
  { _id: 'role-cloud-eng', domainId: 'dom-05', title: 'Cloud Engineer', code: 'CE-01' },
  { _id: 'role-devops', domainId: 'dom-06', title: 'DevOps Engineer', code: 'DO-01' },
  { _id: 'role-cyber-analyst', domainId: 'dom-07', title: 'Cybersecurity Analyst', code: 'SEC-01' },
  { _id: 'role-qa-eng', domainId: 'dom-08', title: 'QA Engineer', code: 'QA-01' },
  { _id: 'role-mobile-dev', domainId: 'dom-09', title: 'Mobile Developer', code: 'MOB-01' },
  { _id: 'role-seo-exec', domainId: 'dom-10', title: 'SEO Executive', code: 'SEO-01' },
  { _id: 'role-bde', domainId: 'dom-11', title: 'Business Development Executive', code: 'BDE-01' },
  { _id: 'role-hr-exec', domainId: 'dom-12', title: 'HR Executive / Recruiter', code: 'HR-01' },
  { _id: 'role-process-assoc', domainId: 'dom-12', title: 'Process Associate', code: 'OPS-01' },
  { _id: 'role-proc-assoc-direct', domainId: 'dom-13', title: 'Process Associate', code: 'ROLE-PA-2026' }
];

export function getRoleTitleById(roleId) {
  if (!roleId) return '';
  const r = JOB_ROLES.find(item => item._id === roleId);
  return r ? r.title : '';
}

export function getDomainNameById(domainId) {
  if (!domainId) return '';
  const d = DOMAINS.find(item => item._id === domainId);
  return d ? d.name : '';
}

export function getDomainByRoleId(roleId) {
  if (!roleId) return '';
  const r = JOB_ROLES.find(item => item._id === roleId);
  if (!r) return '';
  const d = DOMAINS.find(item => item._id === r.domainId);
  return d ? d.name : '';
}
