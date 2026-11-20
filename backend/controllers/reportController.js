const { getCollection } = require('../config/db');

async function getAnalyticsSummary(req, res) {
  try {
    const candidatesCol = getCollection('candidates');
    const resultsCol = getCollection('assessment_results');
    const collegesCol = getCollection('colleges');
    const drivesCol = getCollection('recruitment_drives');

    const candidates = await candidatesCol.find({});
    const results = await resultsCol.find({});
    const colleges = await collegesCol.find({});
    const drives = await drivesCol.find({});

    const totalRegistered = candidates.length;
    const completedAssessments = results.length;
    const shortlistedCount = candidates.filter(c => c.recruitmentStage === 'Shortlisted' || c.recruitmentStage === 'Interview Scheduled' || c.recruitmentStage === 'Selected').length;
    const underReviewCount = candidates.filter(c => c.recruitmentStage === 'Under Review').length;
    const pendingAssessmentCount = candidates.filter(c => c.assessmentStatus === 'Ready' || c.assessmentStatus === 'In Progress').length;

    // Average Score
    const totalScoreSum = results.reduce((acc, r) => acc + (r.totalScore || 0), 0);
    const avgScore = results.length > 0 ? (totalScoreSum / results.length).toFixed(1) : 0;
    const avgPercentage = results.length > 0
      ? (results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length).toFixed(1)
      : 0;

    // College-wise aggregation
    const collegeMap = {};
    for (const c of candidates) {
      const cName = c.collegeName || 'Other College';
      if (!collegeMap[cName]) {
        collegeMap[cName] = { name: cName, registered: 0, completed: 0, scoreSum: 0 };
      }
      collegeMap[cName].registered++;
      if (c.assessmentStatus === 'Completed') {
        collegeMap[cName].completed++;
        collegeMap[cName].scoreSum += (c.totalScore || 0);
      }
    }
    const collegeAnalytics = Object.values(collegeMap).map(col => ({
      name: col.name,
      registered: col.registered,
      completed: col.completed,
      avgScore: col.completed > 0 ? (col.scoreSum / col.completed).toFixed(1) : 'N/A'
    }));

    // Domain-wise distribution
    const domainMap = {};
    for (const c of candidates) {
      const dName = c.domainName || 'Software Development';
      domainMap[dName] = (domainMap[dName] || 0) + 1;
    }
    const domainDistribution = Object.keys(domainMap).map(name => ({
      name,
      value: domainMap[name]
    }));

    // Performance Category Breakdown
    const categoryCounts = {
      Outstanding: 0,
      Excellent: 0,
      Good: 0,
      'Needs Improvement': 0,
      'Requires Further Evaluation': 0
    };
    for (const r of results) {
      const cat = r.performanceCategory || 'Good';
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts[cat] = 1;
      }
    }
    const categoryBreakdown = Object.keys(categoryCounts).map(cat => ({
      category: cat,
      count: categoryCounts[cat]
    }));

    // Recruitment Funnel
    const funnel = [
      { stage: '1. Registered', count: totalRegistered },
      { stage: '2. Assessment Taken', count: completedAssessments },
      { stage: '3. Shortlisted', count: shortlistedCount },
      { stage: '4. Interview Scheduled', count: candidates.filter(c => c.recruitmentStage === 'Interview Scheduled').length },
      { stage: '5. Final Selected', count: candidates.filter(c => c.recruitmentStage === 'Selected').length }
    ];

    res.json({
      success: true,
      metrics: {
        totalRegistered,
        completedAssessments,
        shortlistedCount,
        underReviewCount,
        pendingAssessmentCount,
        totalColleges: colleges.length,
        totalDrives: drives.length,
        avgScore,
        avgPercentage
      },
      collegeAnalytics,
      domainDistribution,
      categoryBreakdown,
      funnel
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Public Certificate Verification
async function verifyCertificate(req, res) {
  try {
    const { certificateId } = req.params;
    const resultsCol = getCollection('assessment_results');
    const result = await resultsCol.findOne({ certificateId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Certificate ID. No verified assessment record found.'
      });
    }

    res.json({
      success: true,
      verified: true,
      certificate: {
        certificateId: result.certificateId,
        candidateName: result.candidateName,
        candidateDisplayId: result.candidateDisplayId,
        jobRoleTitle: result.jobRoleTitle,
        collegeName: result.collegeName,
        assessmentDate: result.assessmentDate,
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        percentage: result.percentage,
        performanceCategory: result.performanceCategory,
        verificationHash: result.verificationHash,
        issuingOrganization: 'INZOVATE TECHNOLOGIES PRIVATE LIMITED',
        status: 'Authentic Official Credential'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAnalyticsSummary,
  verifyCertificate
};
