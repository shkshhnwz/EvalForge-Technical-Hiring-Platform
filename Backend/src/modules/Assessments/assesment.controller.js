const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Question = require('../../models/Question');
const { 
    sendAssessmentInvite, 
    sendClosingSoonReminder, 
    sendCandidateCompletedNotification 
} = require('../Notifications/email.service');
const Assessment = require('../../models/Assessment');
const AssessmentAttempt = require('../../models/AssesmentAttempts');
const Submission = require('../../models/Submissions');
const User = require('../../models/Users');
const { generateToken } = require('../Authentication&Roles/auth.controller');

// Creation of Assessment
exports.createAssessment = async (req, res) => {
    try {
        const { title, description, timeLimit, allowedLanguages, questions } = req.body;
        const orgId = req.user.orgId;
        if (!title || !timeLimit) {
            return res.status(400).json({ message: "Title and time limit are required." });
        }
        if (questions && questions.length > 0) {
            const count = await Question.countDocuments({ _id: { $in: questions } });
            if (count !== questions.length) {
                return res.status(400).json({ message: "One or more question IDs are invalid." });
            }
        }

        const newAssessment = await Assessment.create({
            title,
            description,
            timeLimit,
            allowedLanguages: allowedLanguages || ['JavaScript', 'python', 'cpp', 'java'],
            questions: questions || [],
            orgId,
            status: 'active'
        });
        return res.status(201).json({
            message: "Assessment created successfully",
            assessment: newAssessment
        });

    } catch (err) {
        console.error("Create assessment error:", err);
        return res.status(500).json({ message: "Server error while creating assessment." });
    }
};
exports.createAssesment = exports.createAssessment;

exports.getRecruiterAssessments = async (req, res) => {
    try {
        const orgId = req.user.orgId;
        const assessments = await Assessment.find({ orgId }).populate('questions', 'title difficulty scoreWeight');
        return res.status(200).json(assessments);
    } catch (err) {
        console.error("Get assessments error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

exports.updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.orgId;
        const { title, description, timeLimit, allowedLanguages, status, questions } = req.body;
        const assessment = await Assessment.findOne({ _id: id, orgId });
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found or unauthorized." });
        }
        if (title) assessment.title = title;
        if (description !== undefined) assessment.description = description;
        if (timeLimit) assessment.timeLimit = timeLimit;
        if (allowedLanguages) assessment.allowedLanguages = allowedLanguages;
        if (status) assessment.status = status;
        if (questions) assessment.questions = questions;
        await assessment.save();
        return res.status(200).json({ message: "Assessment updated successfully", assessment });
    } catch (err) {
        console.error("Update assessment error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

exports.bulkEmailInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const { candidates } = req.body;
        const orgId = req.user.orgId;
        const assessment = await Assessment.findOne({ _id: id, orgId });
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found." });
        }
        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            return res.status(400).json({ message: "Candidates array is required." });
        }

        // Filter and sanitize valid candidate emails
        const validCandidates = candidates
            .map(c => ({
                name: (c.name || '').trim(),
                email: (c.email || '').trim().toLowerCase()
            }))
            .filter(c => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));

        if (validCandidates.length === 0) {
            return res.status(400).json({ message: "No valid candidate email addresses found." });
        }

        // Store invited candidates in assessment
        if (!assessment.invitedCandidates) {
            assessment.invitedCandidates = [];
        }
        const existingEmails = new Set(assessment.invitedCandidates.map(c => c.email.toLowerCase()));
        for (const cand of validCandidates) {
            if (!existingEmails.has(cand.email)) {
                assessment.invitedCandidates.push({
                    name: cand.name,
                    email: cand.email,
                    invitedAt: new Date()
                });
                existingEmails.add(cand.email);
            }
        }
        await assessment.save();

        const baseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${baseUrl.replace(/\/$/, '')}/join/${assessment.inviteToken}`;

        let sentCount = 0;
        const failedErrors = [];

        await Promise.all(
            validCandidates.map(async (candidate) => {
                try {
                    await sendAssessmentInvite(candidate.email, candidate.name, assessment.title, inviteLink);
                    sentCount++;
                } catch (err) {
                    console.error(`Failed to invite ${candidate.email}:`, err.message);
                    failedErrors.push({ email: candidate.email, error: err.message });
                }
            })
        );

        if (sentCount === 0 && failedErrors.length > 0) {
            const firstErr = failedErrors[0].error || '';
            let detail = firstErr;
            if (firstErr.includes('only send testing emails to your own email address')) {
                detail = 'Resend sandbox requires verifying a custom domain at resend.com/domains to send to external candidates. Alternatively, copy and share the link from the Direct Link tab!';
            }
            return res.status(502).json({ 
                message: `Failed to dispatch emails: ${detail}`,
                failedErrors 
            });
        }

        let responseMsg = `Successfully sent ${sentCount} invitation(s).`;
        if (failedErrors.length > 0) {
            responseMsg += ` (${failedErrors.length} failed to send).`;
        }

        return res.status(200).json({ 
            message: responseMsg,
            sentCount,
            failedCount: failedErrors.length
        });

    } catch (err) {
        console.error("Bulk invite error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

exports.csvInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.orgId;
        if (!req.file) {
            return res.status(400).json({ message: "CSV file is required." });
        }
        const assessment = await Assessment.findOne({ _id: id, orgId });
        if (!assessment) {
            // Cleanup uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Assessment not found." });
        }
        const candidates = [];
        // Read CSV stream and parse rows
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Expects headers "name" and "email" (case-insensitive checking)
                const name = row.name || row.Name || row.NAME;
                const email = row.email || row.Email || row.EMAIL;
                if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                    candidates.push({ name: name ? name.trim() : '', email: email.trim().toLowerCase() });
                }
            })
            .on('end', async () => {
                // Delete temp file after streaming
                fs.unlinkSync(req.file.path);
                if (candidates.length === 0) {
                    return res.status(400).json({ message: "No valid emails found in the CSV." });
                }

                // Store invited candidates in assessment
                if (!assessment.invitedCandidates) {
                    assessment.invitedCandidates = [];
                }
                const existingEmails = new Set(assessment.invitedCandidates.map(c => c.email.toLowerCase()));
                for (const cand of candidates) {
                    if (!existingEmails.has(cand.email.toLowerCase())) {
                        assessment.invitedCandidates.push({
                            name: cand.name,
                            email: cand.email.toLowerCase(),
                            invitedAt: new Date()
                        });
                        existingEmails.add(cand.email.toLowerCase());
                    }
                }
                await assessment.save();

                const baseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
                // Send Emails
                const invitePromises = candidates.map(candidate => {
                    const inviteLink = `${baseUrl.replace(/\/$/, '')}/join/${assessment.inviteToken}`;
                    return sendAssessmentInvite(candidate.email, candidate.name, assessment.title, inviteLink)
                        .catch(err => console.error(`Failed to send CSV email to ${candidate.email}:`, err));
                });
                await Promise.all(invitePromises);
                return res.status(200).json({ message: `Successfully invited ${candidates.length} candidates from CSV.` });
            })
            .on('error', (err) => {
                console.error("Error reading CSV stream:", err);
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(500).json({ message: "Failed parsing the CSV file." });
            });
    } catch (err) {
        console.error("CSV invite error:", err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: "Server error." });
    }
};



exports.joinAssessment = async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const { name, email } = req.body;

        // 1. Validate request body
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required to join the assessment." });
        }

        // 2. Find active assessment by invite token
        const assessment = await Assessment.findOne({ inviteToken });
        if (!assessment || assessment.status === 'archived') {
            return res.status(404).json({ message: "Assessment not found or is currently inactive." });
        }
        if (assessment.status === 'draft') {
            assessment.status = 'active';
            await assessment.save();
        }

        // 3. Find or auto-register candidate
        let candidate = await User.findOne({ email });

        if (candidate) {
            // Ensure existing user has the correct role
            if (candidate.role !== 'candidate') {
                return res.status(403).json({ message: "Unauthorized: Only candidate accounts can join assessments." });
            }
        } else {
            // Auto-register candidate with a secure random password
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, 10);

            candidate = await User.create({
                name,
                email,
                passwordHash,
                role: 'candidate',
                orgId: null
            });
        }

        // 4. Find or create assessment attempt
        let attempt = await AssessmentAttempt.findOne({
            candidateId: candidate._id,
            assessmentId: assessment._id
        });

        if (attempt) {
            // If the attempt exists but has already been submitted or has expired, block the user
            if (attempt.status !== 'started') {
                return res.status(400).json({ message: "You have already submitted or expired this assessment." });
            }
        } else {
            // Start a new attempt
            attempt = await AssessmentAttempt.create({
                candidateId: candidate._id,
                assessmentId: assessment._id,
                status: 'started',
                startedAt: new Date()
            });
        }

        // 5. Generate session tokens
        const { accessToken, refreshToken } = await generateToken(candidate);

        // 6. Set HttpOnly Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // 7. Return successful session & config details to candidate (excluding questions to prevent scraping)
        return res.status(200).json({
            message: "Joined assessment successfully",
            accessToken,
            refreshToken,
            attempt,
            assessment: {
                title: assessment.title,
                description: assessment.description,
                timeLimit: assessment.timeLimit,
                allowedLanguages: assessment.allowedLanguages
            }
        });

    } catch (err) {
        console.error("Join assessment error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


exports.startCandidateAssessment = async (req, res) => {
  try {
    const candidateId = req.user.id; // From requireAuth

    // 1. Find the active attempt
    const attempt = await AssessmentAttempt.findOne({
      candidateId,
      status: 'started'
    }).populate({
      path: 'assessmentId',
      populate: {
        path: 'questions',
        select: 'title description constraints difficulty starterCode testCases scoreWeight'
      }
    });

    if (!attempt) {
      return res.status(400).json({ message: "No active assessment attempt found." });
    }

    const assessment = attempt.assessmentId;

    // 2. Filter hidden test cases from each question before sending
    const sanitizedQuestions = assessment.questions.map(q => {
      const sanitizedTestCases = q.testCases.filter(tc => !tc.isHidden);
      return {
        _id: q._id,
        title: q.title,
        description: q.description,
        constraints: q.constraints,
        difficulty: q.difficulty,
        starterCode: q.starterCode,
        scoreWeight: q.scoreWeight,
        testCases: sanitizedTestCases // only contains visible sample cases
      };
    });

    return res.status(200).json({
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        timeLimit: assessment.timeLimit,
        questions: sanitizedQuestions
      },
      startedAt: attempt.startedAt
    });

  } catch (err) {
    console.error("Start assessment error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.submitCandidateAssessment = async (req, res) => {
  try {
    const candidateId = req.user.id;
    // 1. Find active attempt and populate assessment and its questions
    const attempt = await AssessmentAttempt.findOne({
      candidateId,
      status: 'started'
    }).populate({
      path: 'assessmentId',
      populate: {
        path: 'questions',
        select: 'title difficulty scoreWeight testCases'
      }
    });
    if (!attempt) {
      return res.status(400).json({ message: "No active attempt found to submit." });
    }
    const assessment = attempt.assessmentId;
    const questions = assessment.questions || [];
    // 2. Fetch all submissions by this candidate for this assessment
    const candidateSubmissions = await Submission.find({
      candidateId,
      assessmentId: assessment._id
    });
    // 3. Calculate score per question (taking the highest score achieved for each question)
    let totalScore = 0;
    let maxPossibleScore = 0;
    const questionBreakdown = [];
    for (const question of questions) {
      maxPossibleScore += question.scoreWeight || 0;
      // Find all submissions for this question
      const qSubmissions = candidateSubmissions.filter(
        s => s.questionId.toString() === question._id.toString()
      );
      // Pick highest scoring submission
      let bestScore = 0;
      let bestSubmission = null;
      let passedTestCases = 0;
      const totalTestCases = question.testCases ? question.testCases.length : 0;
      if (qSubmissions.length > 0) {
        // Sort descending by score
        qSubmissions.sort((a, b) => (b.score || 0) - (a.score || 0));
        bestSubmission = qSubmissions[0];
        bestScore = bestSubmission.score || 0;
        passedTestCases = bestSubmission.testCaseResults 
          ? bestSubmission.testCaseResults.filter(tc => tc.passed).length 
          : 0;
      }
      totalScore += bestScore;
      questionBreakdown.push({
        questionId: question._id,
        title: question.title,
        difficulty: question.difficulty,
        maxScore: question.scoreWeight,
        scoreObtained: bestScore,
        totalTestCases,
        passedTestCases,
        status: bestSubmission ? bestSubmission.status : 'unattempted'
      });
    }
    // 4. Update the attempt record
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.totalScore = totalScore;
    await attempt.save();
    const percentage = maxPossibleScore > 0 
      ? Number(((totalScore / maxPossibleScore) * 100).toFixed(2)) 
      : 0;

    // Asynchronously notify recruiter of the completed submission
    (async () => {
      try {
        const candidate = await User.findById(candidateId);
        let recruiterEmail = null;
        if (assessment.orgId) {
          const recruiter = await User.findOne({ orgId: assessment.orgId, role: 'recruiter' });
          if (recruiter) recruiterEmail = recruiter.email;
        }
        if (recruiterEmail) {
          await sendCandidateCompletedNotification({
            recruiterEmail,
            candidateName: candidate ? candidate.name : 'Candidate',
            candidateEmail: candidate ? candidate.email : '',
            assessmentTitle: assessment.title,
            score: totalScore,
            totalScore: maxPossibleScore,
            reportUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/assessments/${assessment._id}/candidate/${candidateId}`
          });
        }
      } catch (notifyErr) {
        console.error("Recruiter completion notification email error:", notifyErr);
      }
    })();

    // 5. Configurable Result Feedback: Check if recruiter allowed immediate results
    if (!assessment.showResultsImmediately) {
      return res.status(200).json({
        message: "Assessment submitted successfully.",
        resultsHidden: true,
        feedbackMessage: "Your answers have been recorded. Results will be made available once the recruiter closes the assessment.",
        submittedAt: attempt.submittedAt
      });
    }
    // Return immediate score feedback
    return res.status(200).json({
      message: "Assessment submitted and auto-graded successfully.",
      resultsHidden: false,
      summary: {
        totalScore,
        maxPossibleScore,
        percentage,
        submittedAt: attempt.submittedAt,
        timeTakenMinutes: Math.round((attempt.submittedAt - attempt.startedAt) / 60000)
      },
      questionBreakdown
    });
  } catch (err) {
    console.error("Submit and grading assessment error:", err);
    return res.status(500).json({ message: "Server error during grading." });
  }
};

/**
 * Send 'Assessment closing soon' reminder to uncompleted candidates
 */
exports.sendAssessmentReminders = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidates, deadlineDate } = req.body || {};
    const orgId = req.user.orgId;

    const assessment = await Assessment.findOne({ _id: id, orgId });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found." });
    }

    let targetCandidates = [];

    // 1. If explicitly provided in body
    if (candidates && Array.isArray(candidates) && candidates.length > 0) {
      targetCandidates = candidates.filter(c => c && c.email);
    } else {
      // 2. Auto-discover candidates who have not completed the assessment
      const completedAttempts = await AssessmentAttempt.find({
        assessmentId: id,
        status: { $in: ['submitted'] }
      }).populate('candidateId', 'email');

      const completedEmails = new Set(
        completedAttempts
          .map(a => a.candidateId?.email?.toLowerCase())
          .filter(Boolean)
      );

      // A: Candidates who started an attempt but haven't submitted
      const inProgressAttempts = await AssessmentAttempt.find({
        assessmentId: id,
        status: 'started'
      }).populate('candidateId', 'name email');

      inProgressAttempts.forEach(att => {
        const email = att.candidateId?.email?.toLowerCase();
        if (email && !completedEmails.has(email)) {
          targetCandidates.push({
            name: att.candidateId.name || '',
            email: att.candidateId.email
          });
        }
      });

      // B: Candidates from invitedCandidates roster who haven't completed
      if (assessment.invitedCandidates && assessment.invitedCandidates.length > 0) {
        for (const inv of assessment.invitedCandidates) {
          const emailLower = inv.email.toLowerCase();
          if (!completedEmails.has(emailLower) && !targetCandidates.some(c => c.email.toLowerCase() === emailLower)) {
            targetCandidates.push({
              name: inv.name || '',
              email: inv.email
            });
          }
        }
      }
    }

    if (targetCandidates.length === 0) {
      return res.status(200).json({ 
        message: "No pending or uncompleted candidates found to remind.",
        count: 0
      });
    }

    const baseUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl.replace(/\/$/, '')}/join/${assessment.inviteToken}`;

    let sentCount = 0;
    const failedErrors = [];

    await Promise.all(
      targetCandidates.map(async (candidate) => {
        try {
          await sendClosingSoonReminder({
            toEmail: candidate.email,
            candidateName: candidate.name,
            assessmentTitle: assessment.title,
            deadlineDate: deadlineDate || 'Soon',
            inviteLink
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send reminder to ${candidate.email}:`, err.message);
          failedErrors.push({ email: candidate.email, error: err.message });
        }
      })
    );

    if (sentCount === 0 && failedErrors.length > 0) {
      const firstErr = failedErrors[0].error || '';
      return res.status(502).json({
        message: `Failed to dispatch reminder emails: ${firstErr}`,
        failedErrors
      });
    }

    return res.status(200).json({ 
      message: `Closing soon reminders sent successfully to ${sentCount} candidate(s).`,
      count: sentCount
    });
  } catch (err) {
    console.error("Send assessment reminders error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
