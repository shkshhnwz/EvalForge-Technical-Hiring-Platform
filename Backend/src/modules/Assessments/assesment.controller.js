const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Questions = require('../../models/Question');
const { sendAssesmentInvite } = require('../Notifications/email.service');
const Assessment = require('../../models/Assessment');
const AssessmentAttempt = require('../../models/AssesmentAttempts');
const User = require('../../models/Users');
const { generateToken } = require('../Authentication&Roles/auth.controller');

//Creation of Assesment
exports.createAssesment = async (req, res) => {
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

        const newAssesment = await Assessment.create({
            title,
            description,
            timeLimit,
            allowedLanguages: allowedLanguages || ['JavaScript', 'python', 'cpp', 'java'],
            questions: questions || [],
            orgId,
            status: 'draft'
        });
        return res.status(201).json({
            message: "Assessment created successfully",
            assessment: newAssessment
        });

    } catch (err) {
        console.error("Create assessment error:", err);
        return res.status(500).json({ message: "Server error while creating assessment." });
    }
}

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
        const { orgId } = req.user.orgId;
        const assessment = await Assessment.findOne({ _id: id, orgId });
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found." });
        }
        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            return res.status(400).json({ message: "Candidates array is required." });
        }
        const invitePromises = candidates.map(candidate => {
            const inviteLink = `${process.env.FRONTEND_URL}/candidate/join/${assessment.inviteToken}`;
            return sendAssessmentInvite(candidate.email, candidate.name, assessment.title, inviteLink)
                .catch(err => {
                    console.error(`Failed to invite ${candidate.email}`, err);
                })
        });
        await Promise.all(invitePromises);
        return res.status(200).json({ message: "Candidates invited successfully" });


    } catch (err) {
        console.error("Bulk invite error:", err);
        return res.status(500).json({ message: "Server error." });
    }
}

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
                if (email) {
                    candidates.push({ name: name ? name.trim() : '', email: email.trim() });
                }
            })
            .on('end', async () => {
                // Delete temp file after streaming
                fs.unlinkSync(req.file.path);
                if (candidates.length === 0) {
                    return res.status(400).json({ message: "No valid emails found in the CSV." });
                }
                // Send Emails
                const invitePromises = candidates.map(candidate => {
                    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${assessment.inviteToken}`;
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
