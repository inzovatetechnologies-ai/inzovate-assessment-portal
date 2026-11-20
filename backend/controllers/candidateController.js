const bcrypt = require('bcryptjs');
const { getCollection } = require('../config/db');

async function registerCandidate(req, res) {
  try {
    const payload = req.body;
    const candidatesCol = getCollection('candidates');
    const usersCol = getCollection('users');

    // Mandatory Validation
    if (!payload.email || !payload.fullName || !payload.mobileNumber || !payload.jobRoleId) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: Full Name, Email, Mobile, and Applied Job Role are mandatory.'
      });
    }

    if (!payload.password || payload.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a secure password of at least 6 characters.'
      });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanMobile = payload.mobileNumber.trim();

    // STRICT ONE-TIME REGISTRATION CHECK:
    // Once registered, candidate cannot register again with same email or mobile!
    const existingByEmail = await candidatesCol.findOne({ email: cleanEmail });
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: `You have already registered with email '${cleanEmail}' (Candidate ID: ${existingByEmail.candidateId}). Re-registration is strictly prohibited. Please log in using your Username/Email and Password.`
      });
    }

    const existingByMobile = await candidatesCol.findOne({ mobileNumber: cleanMobile });
    if (existingByMobile) {
      return res.status(409).json({
        success: false,
        message: `You have already registered with mobile number '${cleanMobile}' (Candidate ID: ${existingByMobile.candidateId}). Re-registration is strictly prohibited. Please log in using your Username/Email and Password.`
      });
    }

    // Generate Sequential Unique Candidate ID: INZ-CAND-2026-XXXXX
    const totalCount = await candidatesCol.countDocuments();
    const sequenceNum = String(totalCount + 1).padStart(5, '0');
    const candidateId = `INZ-CAND-2026-${sequenceNum}`;

    // Resolve Job Role and Domain
    const rolesCol = getCollection('job_roles');
    const domainsCol = getCollection('domains');
    const jobRole = await rolesCol.findById(payload.jobRoleId);
    let domainName = 'Technology';
    if (jobRole) {
      const domain = await domainsCol.findById(jobRole.domainId);
      if (domain) domainName = domain.name;
    }

    // Resolve College Name (Typeable or Selected)
    let collegeName = (payload.collegeName || '').trim();
    const collegesCol = getCollection('colleges');
    if (!collegeName && payload.collegeId) {
      const colRecord = await collegesCol.findById(payload.collegeId);
      if (colRecord) collegeName = colRecord.name;
    }
    if (!collegeName) collegeName = 'Affiliated Institution';

    // Auto-register college in database if candidate typed a new institution
    if (collegeName && collegeName !== 'Affiliated Institution') {
      const existingCol = await collegesCol.findOne({
        name: { $regex: `^${collegeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      });
      if (!existingCol) {
        await collegesCol.create({
          name: collegeName,
          code: `COL-${Date.now().toString().slice(-4)}`,
          university: 'Affiliated / Autonomous',
          district: payload.district || 'Tamil Nadu',
          address: payload.district ? `${payload.district}, Tamil Nadu` : 'Tamil Nadu',
          status: 'active'
        });
      }
    }

    const candidateDoc = {
      candidateId,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      mobileNumber: cleanMobile,
      altMobileNumber: payload.altMobileNumber || '',
      dateOfBirth: payload.dateOfBirth || '',
      gender: payload.gender || 'Not Specified',
      residentialAddress: payload.residentialAddress || '',
      district: payload.district || '',
      state: payload.state || '',
      pinCode: payload.pinCode || '',
      profilePhotoUrl: payload.profilePhotoUrl || '',

      // Parent Details
      fatherName: payload.fatherName || '',
      fatherMobile: payload.fatherMobile || '',
      motherName: payload.motherName || '',
      emergencyContact: payload.emergencyContact || payload.fatherMobile || '',
      relationship: payload.relationship || 'Parent',

      // Academic Details
      collegeId: payload.collegeId || '',
      collegeName,
      collegeRegNumber: payload.collegeRegNumber || '',
      universityRegNumber: payload.universityRegNumber || '',
      degree: payload.degree || '',
      department: payload.department || '',
      specialization: payload.specialization || '',
      currentYear: payload.currentYear || 'Final Year',
      graduationYear: payload.graduationYear || '2026',
      cgpa: payload.cgpa || '',
      tenthPercentage: payload.tenthPercentage || '',
      twelfthPercentage: payload.twelfthPercentage || '',
      arrearStatus: payload.arrearStatus || 'No Active Backlogs',
      backlogCount: Number(payload.backlogCount) || 0,
      resumeFileName: payload.resumeFileName || 'Resume.pdf',
      linkedinUrl: payload.linkedinUrl || '',
      githubUrl: payload.githubUrl || '',
      portfolioUrl: payload.portfolioUrl || '',

      // Recruitment Details
      driveId: payload.driveId || 'INZ-DRIVE-2026-01',
      jobRoleId: payload.jobRoleId,
      jobRoleTitle: jobRole ? jobRole.title : 'Software Developer',
      domainId: jobRole ? jobRole.domainId : 'dom-01',
      domainName,
      technicalSkills: Array.isArray(payload.technicalSkills) ? payload.technicalSkills : (payload.technicalSkills ? payload.technicalSkills.split(',').map(s=>s.trim()) : []),
      programmingLanguages: Array.isArray(payload.programmingLanguages) ? payload.programmingLanguages : [],
      preferredLocation: payload.preferredLocation || 'Pan-India / Hybrid',
      employmentType: payload.employmentType || 'Full-Time',

      // Consents & Verifications
      isEmailVerified: Boolean(payload.isEmailVerified),
      isMobileVerified: Boolean(payload.isMobileVerified),
      candidateDeclaration: true,
      privacyAccepted: true,
      termsAccepted: true,
      webcamConsent: true,
      recordingConsent: true,

      // Initial Pipeline Status
      recruitmentStage: 'Assessment Pending',
      assessmentStatus: 'Ready',
      totalScore: null,
      maxScore: 45,
      percentage: null,
      performanceCategory: null,
      createdAt: new Date().toISOString()
    };

    const savedCandidate = await candidatesCol.create(candidateDoc);

    // Create Candidate User Account for Login
    const passwordHash = await bcrypt.hash(payload.password, 10);

    await usersCol.create({
      fullName: candidateDoc.fullName,
      email: candidateDoc.email,
      password: passwordHash,
      role: 'Candidate',
      candidateId: candidateDoc.candidateId,
      collegeId: candidateDoc.collegeId,
      department: candidateDoc.department,
      phone: candidateDoc.mobileNumber,
      status: 'active'
    });

    // Audit Log
    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: candidateDoc.email,
      actorRole: 'Candidate',
      action: 'CANDIDATE_REGISTRATION',
      target: candidateDoc.candidateId,
      details: `New candidate registered with ID ${candidateDoc.candidateId} for ${candidateDoc.jobRoleTitle} at ${candidateDoc.collegeName}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    // Return Registration Result with Username & Candidate ID
    res.status(201).json({
      success: true,
      message: `Registration successful! Your Login Username / Candidate ID is: ${candidateDoc.candidateId}. Please login to access your assessment.`,
      candidate: savedCandidate,
      candidateId: candidateDoc.candidateId,
      username: candidateDoc.candidateId,
      email: candidateDoc.email
    });
  } catch (err) {
    console.error('Candidate registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listCandidates(req, res) {
  try {
    const candidatesCol = getCollection('candidates');
    const { search, collegeId, jobRoleId, stage, assessmentStatus } = req.query;

    let candidates = await candidatesCol.find({});

    if (search) {
      const q = search.toLowerCase();
      candidates = candidates.filter(c =>
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.candidateId && c.candidateId.toLowerCase().includes(q)) ||
        (c.collegeName && c.collegeName.toLowerCase().includes(q))
      );
    }

    if (collegeId) {
      candidates = candidates.filter(c => c.collegeId === collegeId);
    }

    if (jobRoleId) {
      candidates = candidates.filter(c => c.jobRoleId === jobRoleId);
    }

    if (stage) {
      candidates = candidates.filter(c => c.recruitmentStage === stage);
    }

    if (assessmentStatus) {
      candidates = candidates.filter(c => c.assessmentStatus === assessmentStatus);
    }

    // Attach exam results if completed
    const resultsCol = getCollection('assessment_results');
    const results = await resultsCol.find({});
    const resultMap = new Map(results.map(r => [r.candidateDisplayId, r]));

    const enriched = candidates.map(c => {
      const r = resultMap.get(c.candidateId);
      return {
        ...c,
        assessmentResult: r || null
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      count: enriched.length,
      candidates: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getCandidateById(req, res) {
  try {
    const { id } = req.params;
    const candidatesCol = getCollection('candidates');
    let candidate = await candidatesCol.findById(id);

    if (!candidate) {
      candidate = await candidatesCol.findOne({ candidateId: id });
    }

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const resultsCol = getCollection('assessment_results');
    const result = await resultsCol.findOne({
      $or: [{ candidateId: candidate._id }, { candidateDisplayId: candidate.candidateId }]
    }) || await resultsCol.findOne({ candidateDisplayId: candidate.candidateId });

    const proctorCol = getCollection('proctoring_events');
    const events = await proctorCol.find({ candidateId: candidate._id });

    res.json({
      success: true,
      candidate,
      assessmentResult: result,
      proctoringEvents: events
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateRecruitmentStage(req, res) {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const candidatesCol = getCollection('candidates');
    let candidate = await candidatesCol.findById(id);
    if (!candidate) {
      candidate = await candidatesCol.findOne({ candidateId: id });
    }

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const updated = await candidatesCol.updateOne(
      { _id: candidate._id },
      {
        recruitmentStage: stage,
        hrReviewNotes: notes || candidate.hrReviewNotes || '',
        stageUpdatedAt: new Date().toISOString()
      }
    );

    const auditCol = getCollection('audit_logs');
    await auditCol.create({
      actorEmail: req.user ? req.user.email : 'admin@inzovate.com',
      actorRole: req.user ? req.user.role : 'Admin',
      action: 'RECRUITMENT_STAGE_UPDATED',
      target: candidate.candidateId,
      details: `Updated stage for ${candidate.fullName} to: ${stage}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Candidate stage updated to ${stage}.`,
      candidate: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  registerCandidate,
  listCandidates,
  getCandidateById,
  updateRecruitmentStage
};
