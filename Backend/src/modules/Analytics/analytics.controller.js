const Assessment = require('../../models/Assessment');
const AssessmentAttempt = require('../../models/AssesmentAttempts');
const Submission = require('../../models/Submissions');
const Question = require('../../models/Question');
const User = require('../../models/Users');

/**
 * 1. Get Comprehensive Assessment Analytics
 */
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const orgId = req.user.orgId;

    // Verify assessment belongs to recruiter's organization
    const assessment = await Assessment.findOne({ _id: assessmentId, orgId }).populate('questions');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found or unauthorized' });
    }

    const questions = assessment.questions || [];
    const maxScore = questions.reduce((sum, q) => sum + (q.scoreWeight || 0), 0);

    // Fetch all attempts for this assessment
    const attempts = await AssessmentAttempt.find({ assessmentId })
      .populate('candidateId', 'name email')
      .sort({ totalScore: -1, submittedAt: 1 });

    // Fetch all submissions for this assessment
    const submissions = await Submission.find({ assessmentId });

    // --- A. LEADERBOARD COMPUTATION ---
    const leaderboard = attempts.map((attempt, index) => {
      const candidateSubmissions = submissions.filter(
        s => s.candidateId.toString() === attempt.candidateId?._id.toString()
      );

      // Extract unique languages used
      const languagesUsed = [...new Set(candidateSubmissions.map(s => s.language))];

      // Compute time taken in minutes
      const timeTakenMinutes = attempt.submittedAt && attempt.startedAt
        ? Math.max(1, Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000))
        : null;

      const percentage = maxScore > 0 
        ? Number(((attempt.totalScore / maxScore) * 100).toFixed(1)) 
        : 0;

      return {
        rank: index + 1,
        attemptId: attempt._id,
        candidateId: attempt.candidateId?._id,
        name: attempt.candidateId?.name || 'Unknown Candidate',
        email: attempt.candidateId?.email || 'N/A',
        status: attempt.status,
        totalScore: attempt.totalScore,
        maxScore,
        percentage,
        timeTakenMinutes,
        languagesUsed,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        passed: percentage >= 60 // Configurable 60% passing benchmark
      };
    });

    // --- B. OVERVIEW STATS ---
    const totalCandidates = attempts.length;
    const submittedAttempts = attempts.filter(a => a.status === 'submitted');
    const completedCount = submittedAttempts.length;
    
    const avgScore = completedCount > 0
      ? Number((submittedAttempts.reduce((acc, a) => acc + (a.totalScore || 0), 0) / completedCount).toFixed(1))
      : 0;

    const avgPercentage = maxScore > 0 ? Number(((avgScore / maxScore) * 100).toFixed(1)) : 0;

    const avgTimeMinutes = completedCount > 0
      ? Math.round(
          submittedAttempts.reduce((acc, a) => {
            const time = a.submittedAt && a.startedAt ? (new Date(a.submittedAt) - new Date(a.startedAt)) / 60000 : 0;
            return acc + time;
          }, 0) / completedCount
        )
      : 0;

    const passRate = completedCount > 0
      ? Number(((leaderboard.filter(c => c.status === 'submitted' && c.passed).length / completedCount) * 100).toFixed(1))
      : 0;

    // --- C. PER-QUESTION ANALYTICS ---
    let hardestQuestion = null;
    let lowestPassRate = 101;

    const questionAnalytics = questions.map(q => {
      const qSubmissions = submissions.filter(s => s.questionId.toString() === q._id.toString());
      const uniqueCandidates = [...new Set(qSubmissions.map(s => s.candidateId.toString()))];

      // Group highest score achieved per candidate for this question
      const candidateHighestScores = uniqueCandidates.map(cId => {
        const userSubs = qSubmissions.filter(s => s.candidateId.toString() === cId);
        return Math.max(...userSubs.map(s => s.score || 0));
      });

      const qAvgScore = candidateHighestScores.length > 0
        ? Number((candidateHighestScores.reduce((a, b) => a + b, 0) / candidateHighestScores.length).toFixed(1))
        : 0;

      const fullScorePasses = candidateHighestScores.filter(score => score >= q.scoreWeight).length;
      const qPassRate = candidateHighestScores.length > 0
        ? Number(((fullScorePasses / candidateHighestScores.length) * 100).toFixed(1))
        : 0;

      const avgAttempts = uniqueCandidates.length > 0
        ? Number((qSubmissions.length / uniqueCandidates.length).toFixed(1))
        : 0;

      if (candidateHighestScores.length > 0 && qPassRate < lowestPassRate) {
        lowestPassRate = qPassRate;
        hardestQuestion = { title: q.title, passRate: qPassRate, difficulty: q.difficulty };
      }

      return {
        questionId: q._id,
        title: q.title,
        difficulty: q.difficulty,
        maxScore: q.scoreWeight,
        averageScore: qAvgScore,
        passRate: qPassRate,
        totalAttemptsCount: qSubmissions.length,
        averageAttemptsPerCandidate: avgAttempts
      };
    });

    // --- D. CHARTS DATA ---
    // 1. Score Distribution Histogram (Buckets: 0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
    const scoreBuckets = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 }
    ];

    submittedAttempts.forEach(a => {
      const pct = maxScore > 0 ? (a.totalScore / maxScore) * 100 : 0;
      if (pct <= 20) scoreBuckets[0].count++;
      else if (pct <= 40) scoreBuckets[1].count++;
      else if (pct <= 60) scoreBuckets[2].count++;
      else if (pct <= 80) scoreBuckets[3].count++;
      else scoreBuckets[4].count++;
    });

    // 2. Completion Funnel
    const funnel = [
      { stage: 'Started', count: totalCandidates },
      { stage: 'Submitted', count: completedCount },
      { stage: 'Passed (>=60%)', count: leaderboard.filter(c => c.status === 'submitted' && c.passed).length }
    ];

    // 3. Time vs Score Plot
    const timeVsScore = leaderboard
      .filter(c => c.status === 'submitted' && c.timeTakenMinutes !== null)
      .map(c => ({
        candidateName: c.name,
        timeMinutes: c.timeTakenMinutes,
        score: c.totalScore,
        percentage: c.percentage
      }));

    return res.status(200).json({
      assessment: {
        id: assessment._id,
        title: assessment.title,
        timeLimit: assessment.timeLimit,
        totalQuestions: questions.length,
        maxScore
      },
      overview: {
        totalCandidates,
        completedCount,
        passRate,
        avgScore,
        avgPercentage,
        avgTimeMinutes,
        hardestQuestion
      },
      charts: {
        scoreDistribution: scoreBuckets,
        funnel,
        timeVsScore
      },
      questionAnalytics,
      leaderboard
    });

  } catch (error) {
    console.error('Error computing assessment analytics:', error);
    return res.status(500).json({ message: 'Server error computing analytics' });
  }
};

/**
 * 2. Get Deep-Dive Candidate Detail History
 */
exports.getCandidateDetail = async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;

    const candidate = await User.findById(candidateId).select('name email');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const attempt = await AssessmentAttempt.findOne({ assessmentId, candidateId });
    const submissions = await Submission.find({ assessmentId, candidateId })
      .populate('questionId', 'title difficulty scoreWeight')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      candidate,
      attempt,
      submissions
    });
  } catch (error) {
    console.error('Candidate detail error:', error);
    return res.status(500).json({ message: 'Server error fetching candidate detail' });
  }
};

/**
 * 3. Export Leaderboard Results as CSV
 */
exports.exportResultsCSV = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const orgId = req.user.orgId;

    const assessment = await Assessment.findOne({ _id: assessmentId, orgId });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    const attempts = await AssessmentAttempt.find({ assessmentId })
      .populate('candidateId', 'name email')
      .sort({ totalScore: -1 });

    // Build CSV Content
    let csv = 'Rank,Candidate Name,Email,Status,Score,Time Taken (Mins),Started At,Submitted At\n';

    attempts.forEach((a, idx) => {
      const timeSpent = a.submittedAt && a.startedAt
        ? Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
        : 'N/A';

      const row = [
        idx + 1,
        `"${a.candidateId?.name || 'Unknown'}"`,
        `"${a.candidateId?.email || 'N/A'}"`,
        a.status,
        a.totalScore || 0,
        timeSpent,
        a.startedAt ? new Date(a.startedAt).toISOString() : 'N/A',
        a.submittedAt ? new Date(a.submittedAt).toISOString() : 'N/A'
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${assessment.title.replace(/\s+/g, '_')}_Results.csv"`);
    return res.status(200).send(csv);

  } catch (error) {
    console.error('CSV Export error:', error);
    return res.status(500).json({ message: 'Server error exporting CSV' });
  }
};
