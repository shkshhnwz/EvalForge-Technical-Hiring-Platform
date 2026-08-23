const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Assessment = require('../../models/Assessment');
const AssessmentAttempt = require('../../models/AssesmentAttempts');
const User = require('../../models/Users');
const { generateToken } = require('../Authentication&Roles/auth.controller');

const joinAssessment = async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const { name, email } = req.body;

        // 1. Validate request body
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required to join the assessment." });
        }

        // 2. Find active assessment by invite token
        const assessment = await Assessment.findOne({ inviteToken });
        if (!assessment || assessment.status !== 'active') {
            return res.status(404).json({ message: "Assessment not found or is currently inactive." });
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
            sameSite: 'strict',
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

exports.joinAssessment = joinAssessment;
exports.joinAssesment = joinAssessment; // Alias for single-s spelling compatibility