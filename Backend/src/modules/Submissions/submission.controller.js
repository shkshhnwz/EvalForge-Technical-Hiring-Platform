// src/modules/Submissions/submission.controller.js
const Submission = require('../../models/Submissions');
const Question = require('../../models/Question');
const Assessment = require('../../models/Assessment');
const { enqueueSubmission } = require('../CodeExecution/queue');

exports.submitCode = async (req, res) => {
  try {
    const { assessmentId, questionId, language, code } = req.body;
    const candidateId = req.user.id; // From requireAuth middleware

    // 1. Validate inputs
    if (!assessmentId || !questionId || !language || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. Verify assessment and question exist
    const [assessment, question] = await Promise.all([
      Assessment.findById(assessmentId),
      Question.findById(questionId)
    ]);

    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // 3. Optional: Verify question belongs to this assessment
    if (!assessment.questions.includes(questionId)) {
      return res.status(400).json({ message: 'Question does not belong to this assessment' });
    }

    // 4. Create database entry in 'pending' status
    const submission = new Submission({
      candidateId,
      assessmentId,
      questionId,
      language,
      code,
      status: 'pending',
    });
    await submission.save();

    // 5. Enqueue submission to BullMQ
    await enqueueSubmission(submission._id.toString());

    return res.status(202).json({
      message: 'Submission received and queued for grading',
      submissionId: submission._id,
      status: submission.status,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ message: 'Failed to process submission' });
  }
};

exports.getSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id)
      .populate('questionId', 'title difficulty')
      .exec();

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Secure checking: Only the candidate who submitted it or a recruiter can view
    if (submission.candidateId.toString() !== req.user.id && req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
