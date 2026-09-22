const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.EMAIL_PORT) || 2525,
    auth: {
        user: process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : undefined,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : undefined
    }
});

const DEFAULT_FROM = process.env.EMAIL_FROM || '"EvalForge" <no-reply@evalforge.com>';

/**
 * Send an email invite to a candidate
 * @param {string} toEmail 
 * @param {string} candidateName 
 * @param {string} assessmentTitle 
 * @param {string} inviteLink 
 */
const sendAssessmentInvite = async (toEmail, candidateName, assessmentTitle, inviteLink) => {
    const mailOptions = {
        from: DEFAULT_FROM,
        to: toEmail,
        subject: `Invitation to complete assessment: ${assessmentTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #4F46E5;">Hello ${candidateName || 'Candidate'},</h2>
                <p>You have been invited to attempt the technical assessment: <strong>${assessmentTitle}</strong>.</p>
                <p>Click the button below to join the assessment and begin when you are ready:</p>
                <div style="margin: 25px 0;">
                    <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
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

/**
 * Send an 'assessment closing soon' reminder to a candidate
 */
const sendClosingSoonReminder = async ({ toEmail, candidateName, assessmentTitle, deadlineDate, inviteLink }) => {
    const mailOptions = {
        from: DEFAULT_FROM,
        to: toEmail,
        subject: `⏳ Reminder: Assessment closing soon - ${assessmentTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #fde68a; background-color: #fffbeb; border-radius: 8px;">
                <h2 style="color: #d97706;">Assessment Closing Soon</h2>
                <p>Hello <strong>${candidateName || 'Candidate'}</strong>,</p>
                <p>This is a reminder that the assessment <strong>${assessmentTitle}</strong> is closing soon.</p>
                ${deadlineDate ? `<p><strong>Deadline:</strong> ${deadlineDate}</p>` : ''}
                <div style="margin: 25px 0;">
                    <a href="${inviteLink}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Complete Assessment Now
                    </a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="${inviteLink}">${inviteLink}</a></p>
                <hr style="border: none; border-top: 1px solid #fed7aa; margin-top: 30px;" />
                <p style="font-size: 12px; color: #777;">This is an automated notification from EvalForge.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Send a notification to the recruiter when a candidate completes an assessment
 */
const sendCandidateCompletedNotification = async ({
    recruiterEmail,
    candidateName,
    candidateEmail,
    assessmentTitle,
    score,
    totalScore,
    reportUrl
}) => {
    const percentage = totalScore > 0 ? ((score / totalScore) * 100).toFixed(1) : 0;
    const mailOptions = {
        from: DEFAULT_FROM,
        to: recruiterEmail,
        subject: `New Submission: ${candidateName || 'Candidate'} completed ${assessmentTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #10B981;">Assessment Completed</h2>
                <p>A candidate has submitted their assessment for <strong>${assessmentTitle}</strong>.</p>
                
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background: #f9fafb; border-radius: 6px; overflow: hidden;">
                    <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;"><strong>Candidate:</strong></td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;">${candidateName || 'N/A'} (${candidateEmail})</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;"><strong>Score:</strong></td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;"><strong>${score}</strong> / ${totalScore} (${percentage}%)</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px;"><strong>Submitted At:</strong></td>
                        <td style="padding: 10px 14px;">${new Date().toLocaleString()}</td>
                    </tr>
                </table>

                ${reportUrl ? `
                <div style="margin: 25px 0;">
                    <a href="${reportUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        View Candidate Report
                    </a>
                </div>` : ''}
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                <p style="font-size: 12px; color: #777;">This is an automated recruiter notification from EvalForge.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendAssessmentInvite,
    sendAssesmentInvite: sendAssessmentInvite, // Alias for backward compatibility
    sendClosingSoonReminder,
    sendCandidateCompletedNotification
};

