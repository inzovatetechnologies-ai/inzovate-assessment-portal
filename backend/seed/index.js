const bcrypt = require('bcryptjs');
const { getCollection } = require('../config/db');
const { DOMAINS_DATA, JOB_ROLES_DATA, COLLEGES_DATA, RECRUITMENT_DRIVES_DATA } = require('./seedData');
const { APTITUDE_LOGICAL_QUESTIONS, COMMUNICATION_QUESTIONS, TECHNICAL_QUESTIONS_BY_ROLE, getTechnicalQuestionsForRole } = require('./questionsData');

async function seedDatabase() {
  console.log('--- Initializing Inzovate Talent Assessment Database ---');

  // 1. Domains
  const domainsCol = getCollection('domains');
  for (const d of DOMAINS_DATA) {
    const existing = await domainsCol.findById(d._id);
    if (!existing) await domainsCol.create(d);
  }
  console.log(`✓ Seeded ${DOMAINS_DATA.length} Domains`);

  // 2. Job Roles
  const rolesCol = getCollection('job_roles');
  for (const r of JOB_ROLES_DATA) {
    const existing = await rolesCol.findById(r._id);
    if (!existing) await rolesCol.create(r);
  }
  console.log(`✓ Seeded ${JOB_ROLES_DATA.length} Job Roles`);

  // 3. Colleges
  const collegesCol = getCollection('colleges');
  for (const c of COLLEGES_DATA) {
    const existing = await collegesCol.findById(c._id);
    if (!existing) await collegesCol.create(c);
  }
  console.log(`✓ Seeded ${COLLEGES_DATA.length} Colleges`);

  // 4. Recruitment Drives
  const drivesCol = getCollection('recruitment_drives');
  for (const dr of RECRUITMENT_DRIVES_DATA) {
    const existing = await drivesCol.findById(dr._id);
    if (!existing) await drivesCol.create(dr);
  }
  console.log(`✓ Seeded ${RECRUITMENT_DRIVES_DATA.length} Recruitment Drives`);

  // 5. Questions Master Pool
  const questionsCol = getCollection('questions');
  let qCount = 0;

  // Section 1
  for (const q of APTITUDE_LOGICAL_QUESTIONS) {
    const existing = await questionsCol.findById(q._id);
    if (!existing) {
      await questionsCol.create(q);
      qCount++;
    }
  }

  // Section 2
  for (const q of COMMUNICATION_QUESTIONS) {
    const existing = await questionsCol.findById(q._id);
    if (!existing) {
      await questionsCol.create(q);
      qCount++;
    }
  }

  // Section 3 (All roles)
  for (const role of JOB_ROLES_DATA) {
    const domain = DOMAINS_DATA.find(d => d._id === role.domainId);
    const techQuestions = getTechnicalQuestionsForRole(role._id, role.title, domain ? domain.name : 'Technical', role.skills);
    for (const q of techQuestions) {
      const existing = await questionsCol.findById(q._id);
      if (!existing) {
        await questionsCol.create(q);
        qCount++;
      }
    }
  }
  console.log(`✓ Seeded Master Question Bank (New inserted: ${qCount})`);

  // 6. Users (Role-based access control)
  const usersCol = getCollection('users');
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const USERS_SEED = [
    {
      _id: 'usr-superadmin',
      fullName: 'Dr. Vikram Malhotra',
      email: 'superadmin@inzovate.com',
      password: passwordHash,
      role: 'Super Admin',
      department: 'Executive Leadership',
      phone: '+91 98840 12345',
      status: 'active'
    },
    {
      _id: 'usr-admin',
      fullName: 'Aravind Swaminathan',
      email: 'admin@inzovate-technologies.com',
      password: await bcrypt.hash('Admin@2026', 10),
      role: 'Admin',
      department: 'Talent Acquisition & Assessment',
      phone: '+91 98410 54321',
      status: 'active'
    },
    {
      _id: 'usr-hrmanager',
      fullName: 'Pooja Sundaram',
      email: 'hr@inzovate.com',
      password: passwordHash,
      role: 'HR Manager',
      department: 'Human Resources',
      phone: '+91 98401 98765',
      status: 'active'
    },
    {
      _id: 'usr-hrexec',
      fullName: 'Karthik Raja',
      email: 'hrexec@inzovate.com',
      password: passwordHash,
      role: 'HR Executive',
      department: 'Campus Recruitment',
      phone: '+91 97910 11223',
      status: 'active'
    },
    {
      _id: 'usr-coordinator',
      fullName: 'Prof. K. Venkatesh',
      email: 'coordinator@psgtech.edu',
      password: passwordHash,
      role: 'College Coordinator',
      collegeId: 'col-02',
      department: 'Placement Cell',
      phone: '+91 98422 10923',
      status: 'active'
    },
    {
      _id: 'usr-candidate',
      fullName: 'Rohit Sharma',
      email: 'candidate@inzovate.com',
      password: passwordHash,
      role: 'Candidate',
      candidateId: 'INZ-CAND-2026-00001',
      status: 'active'
    }
  ];

  for (const u of USERS_SEED) {
    const existing = await usersCol.findOne({ email: u.email });
    if (!existing) await usersCol.create(u);
  }
  console.log(`✓ Seeded ${USERS_SEED.length} System Users with Role-Based Access`);

  // 7. Seed Sample Candidates in Different Pipeline Stages
  const candidatesCol = getCollection('candidates');
  const SAMPLE_CANDIDATES = [
    {
      _id: 'cand-00001',
      candidateId: 'INZ-CAND-2026-00001',
      fullName: 'Rohit Sharma',
      email: 'candidate@inzovate.com',
      mobileNumber: '+91 98765 43210',
      dateOfBirth: '2004-05-15',
      gender: 'Male',
      residentialAddress: '14, Green Park Avenue, Peelamedu',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pinCode: '641004',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',

      fatherName: 'S. K. Sharma',
      fatherMobile: '+91 98765 43219',
      motherName: 'Sunita Sharma',
      emergencyContact: '+91 98765 43219',
      relationship: 'Father',

      collegeId: 'col-02',
      collegeName: 'PSG College of Technology',
      collegeRegNumber: '22CS104',
      universityRegNumber: '710022104052',
      degree: 'B.E. Computer Science and Engineering',
      department: 'Computer Science',
      currentYear: 'Final Year',
      graduationYear: '2026',
      cgpa: '8.85',
      tenthPercentage: '94.2',
      twelfthPercentage: '92.5',
      arrearStatus: 'No History',
      backlogCount: 0,
      resumeFileName: 'Rohit_Sharma_Resume_2026.pdf',
      linkedinUrl: 'https://linkedin.com/in/rohit-sharma-tech',
      githubUrl: 'https://github.com/rohit-inzovate',

      driveId: 'INZ-DRIVE-2026-01',
      jobRoleId: 'role-soft-dev',
      jobRoleTitle: 'Software Developer',
      domainId: 'dom-01',
      domainName: 'Software Development',
      technicalSkills: ['Data Structures', 'Java', 'SQL', 'Algorithms', 'Spring Boot'],
      programmingLanguages: ['Java', 'C++', 'Python'],
      preferredLocation: 'Chennai / Bengaluru / Hybrid',
      employmentType: 'Full-Time (Direct Fresher)',

      isEmailVerified: true,
      isMobileVerified: true,
      termsAccepted: true,
      privacyAccepted: true,
      webcamConsent: true,
      recordingConsent: true,

      recruitmentStage: 'Shortlisted',
      assessmentStatus: 'Completed',
      totalScore: 41,
      maxScore: 45,
      percentage: 91.1,
      performanceCategory: 'Outstanding',
      createdAt: '2026-11-10T10:00:00Z'
    },
    {
      _id: 'cand-00002',
      candidateId: 'INZ-CAND-2026-00002',
      fullName: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@gmail.com',
      mobileNumber: '+91 98450 12345',
      dateOfBirth: '2004-08-22',
      gender: 'Female',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pinCode: '560059',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',

      collegeId: 'col-04',
      collegeName: 'RV College of Engineering',
      collegeRegNumber: '1RV22IS045',
      degree: 'B.E. Information Science',
      graduationYear: '2026',
      cgpa: '9.12',
      resumeFileName: 'Ananya_DataAnalyst_Resume.pdf',

      driveId: 'INZ-DRIVE-2026-01',
      jobRoleId: 'role-data-analyst',
      jobRoleTitle: 'Data Analyst',
      domainId: 'dom-02',
      domainName: 'Data & Analytics',
      technicalSkills: ['SQL', 'Power BI', 'Python', 'Excel', 'Statistics'],
      preferredLocation: 'Bengaluru',
      employmentType: 'Full-Time',

      isEmailVerified: true,
      isMobileVerified: true,
      termsAccepted: true,
      webcamConsent: true,
      recordingConsent: true,

      recruitmentStage: 'Interview Scheduled',
      assessmentStatus: 'Completed',
      totalScore: 39,
      maxScore: 45,
      percentage: 86.7,
      performanceCategory: 'Excellent',
      createdAt: '2026-11-12T14:30:00Z'
    },
    {
      _id: 'cand-00003',
      candidateId: 'INZ-CAND-2026-00003',
      fullName: 'Siddharth Menon',
      email: 'siddharth.m@nitt.edu',
      mobileNumber: '+91 94431 55667',
      dateOfBirth: '2003-12-05',
      gender: 'Male',
      district: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      pinCode: '620015',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',

      collegeId: 'col-01',
      collegeName: 'National Institute of Technology (NIT)',
      collegeRegNumber: '106122088',
      degree: 'B.Tech Computer Science',
      graduationYear: '2026',
      cgpa: '8.40',

      driveId: 'INZ-DRIVE-2026-01',
      jobRoleId: 'role-cloud-eng',
      jobRoleTitle: 'Cloud Engineer',
      domainId: 'dom-05',
      domainName: 'Cloud Computing',
      technicalSkills: ['AWS', 'Docker', 'Linux', 'Networking', 'Terraform'],
      preferredLocation: 'Bengaluru / Hyderabad',
      employmentType: 'Full-Time',

      isEmailVerified: true,
      isMobileVerified: true,
      termsAccepted: true,
      webcamConsent: true,
      recordingConsent: true,

      recruitmentStage: 'Under Review',
      assessmentStatus: 'Completed',
      totalScore: 34,
      maxScore: 45,
      percentage: 75.5,
      performanceCategory: 'Excellent',
      createdAt: '2026-11-14T09:15:00Z'
    },
    {
      _id: 'cand-00004',
      candidateId: 'INZ-CAND-2026-00004',
      fullName: 'Meera Krishnan',
      email: 'meera.krishnan@annauniv.edu',
      mobileNumber: '+91 98402 77889',
      dateOfBirth: '2004-03-18',
      gender: 'Female',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '600025',

      collegeId: 'col-03',
      collegeName: 'College of Engineering, Guindy (Anna University)',
      degree: 'B.E. Computer Science',
      graduationYear: '2026',
      cgpa: '8.95',

      driveId: 'INZ-DRIVE-2026-03',
      jobRoleId: 'role-uiux',
      jobRoleTitle: 'UI/UX Designer',
      domainId: 'dom-04',
      domainName: 'UI/UX & Design',
      technicalSkills: ['Figma', 'Wireframing', 'User Research', 'Design Systems'],
      preferredLocation: 'Chennai',
      employmentType: 'Full-Time',

      isEmailVerified: true,
      isMobileVerified: true,
      termsAccepted: true,
      webcamConsent: true,
      recordingConsent: true,

      recruitmentStage: 'Assessment Pending',
      assessmentStatus: 'Ready',
      createdAt: '2026-11-15T11:00:00Z'
    }
  ];

  for (const c of SAMPLE_CANDIDATES) {
    const existing = await candidatesCol.findById(c._id);
    if (!existing) await candidatesCol.create(c);
  }
  console.log(`✓ Seeded ${SAMPLE_CANDIDATES.length} Candidates across Recruitment Stages`);

  // 8. Seed Result Records & Completed Sessions for Sample Candidates
  const resultsCol = getCollection('assessment_results');
  const SAMPLE_RESULTS = [
    {
      _id: 'res-00001',
      candidateId: 'cand-00001',
      candidateDisplayId: 'INZ-CAND-2026-00001',
      candidateName: 'Rohit Sharma',
      jobRoleTitle: 'Software Developer',
      collegeName: 'PSG College of Technology',
      assessmentDate: '2026-11-16',
      totalScore: 41,
      maxScore: 45,
      percentage: 91.1,
      performanceCategory: 'Outstanding',
      sectionScores: {
        section1: { title: 'Aptitude & Logical Reasoning', score: 14, max: 15, percentage: 93.3 },
        section2: { title: 'Communication Assessment', score: 14, max: 15, percentage: 93.3 },
        section3: { title: 'Software Developer Technical Assessment', score: 13, max: 15, percentage: 86.7 }
      },
      timeTakenMinutes: 48,
      violationsCount: 0,
      certificateId: 'INZ-CERT-2026-89412',
      verificationHash: '9a8f27b3d4e1c50821',
      isPublished: true,
      createdAt: '2026-11-16T11:50:00Z'
    },
    {
      _id: 'res-00002',
      candidateId: 'cand-00002',
      candidateDisplayId: 'INZ-CAND-2026-00002',
      candidateName: 'Ananya Deshmukh',
      jobRoleTitle: 'Data Analyst',
      collegeName: 'RV College of Engineering',
      assessmentDate: '2026-11-16',
      totalScore: 39,
      maxScore: 45,
      percentage: 86.7,
      performanceCategory: 'Excellent',
      sectionScores: {
        section1: { title: 'Aptitude & Logical Reasoning', score: 13, max: 15, percentage: 86.7 },
        section2: { title: 'Communication Assessment', score: 15, max: 15, percentage: 100.0 },
        section3: { title: 'Data Analyst Technical Assessment', score: 11, max: 15, percentage: 73.3 }
      },
      timeTakenMinutes: 52,
      violationsCount: 1,
      certificateId: 'INZ-CERT-2026-78301',
      verificationHash: '4b1e89f02c63a75912',
      isPublished: true,
      createdAt: '2026-11-16T15:25:00Z'
    }
  ];

  for (const r of SAMPLE_RESULTS) {
    const existing = await resultsCol.findById(r._id);
    if (!existing) await resultsCol.create(r);
  }
  console.log(`✓ Seeded ${SAMPLE_RESULTS.length} Assessment Results with Verification Certificates`);

  // 9. Seed System Configurations
  const configsCol = getCollection('system_configurations');
  const SYS_CONFIG = {
    _id: 'global-sys-config',
    orgName: 'INZOVATE TECHNOLOGIES PRIVATE LIMITED',
    portalTitle: 'INZOVATE TALENT ASSESSMENT PORTAL',
    supportEmail: 'careers@inzovate.com',
    supportPhone: '+91 93420 08797',
    desktopOnlyEnforced: true,
    minResolutionWidth: 1280,
    minResolutionHeight: 720,
    webcamMandatory: true,
    maxViolationWarnings: 3,
    autoSubmitOnTimerExpiry: true,
    examDurationMinutes: 60,
    deploymentTarget: 'Hostinger VPS + Cloudflare + MongoDB Atlas',
    domain: 'assessment.inzovate-technologies.com',
    updatedAt: new Date().toISOString()
  };
  const existingConfig = await configsCol.findById(SYS_CONFIG._id);
  if (!existingConfig) await configsCol.create(SYS_CONFIG);
  console.log('✓ Seeded Global Enterprise System Configurations');

  // 10. Audit Logs
  const auditCol = getCollection('audit_logs');
  const AUDIT_SEED = [
    {
      _id: 'audit-001',
      actorEmail: 'admin@inzovate.com',
      actorRole: 'Admin',
      action: 'SYSTEM_INITIALIZATION',
      target: 'Question Bank & Domains',
      details: 'Initialized 12 enterprise domains, 35+ job roles, and master 45-question banks with verified answer keys.',
      ipAddress: '103.21.244.18',
      timestamp: new Date().toISOString()
    },
    {
      _id: 'audit-002',
      actorEmail: 'hr@inzovate.com',
      actorRole: 'HR Manager',
      action: 'RECRUITMENT_DRIVE_PUBLISHED',
      target: 'INZ-DRIVE-2026-01',
      details: 'Published Pan-India Campus Recruitment Drive 2026 for NIT Trichy, RV College, and PSG Tech.',
      ipAddress: '103.21.244.18',
      timestamp: new Date().toISOString()
    }
  ];
  for (const a of AUDIT_SEED) {
    const existing = await auditCol.findById(a._id);
    if (!existing) await auditCol.create(a);
  }
  console.log('✓ Seeded Initial Enterprise Audit Trail');

  console.log('--- Database Seeding Complete & Verified ---');
}

module.exports = {
  seedDatabase
};
