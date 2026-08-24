const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io', // or smtp.gmail.com
    port: process.env.EMAIL_PORT || 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email invite to a candidate
 * @param {string} toEmail 
 * @param {string} candidateName 
 * @param {string} assessmentTitle 
 * @param {string} inviteLink 
 */
exports.sendAssessmentInvite = async (toEmail, candidateName, assessmentTitle, inviteLink) => {
    const mailOptions = {
        from: `"EvalForge Admin" <no-reply@evalforge.com>`,
        to: toEmail,
        subject: `Invitation to complete assessment: ${assessmentTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Hello ${candidateName || 'Candidate'},</h2>
                <p>You have been invited to attempt the technical assessment: <strong>${assessmentTitle}</strong>.</p>
                <p>Click the button below to join the assessment and begin when you are ready:</p>
                <div style="margin: 25px 0;">
                    <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Start Assessment
                    </a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="${inviteLink}">${inviteLink}</a></p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                <p style="font-size: 12px; color: #777;">This invite is automated. Please do not reply directly to this email.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

