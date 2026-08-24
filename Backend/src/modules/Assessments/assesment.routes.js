const express = require('express');
const AssessmentRouter = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // temporary file storage config

const { 
    joinAssessment, 
    createAssessment, 
    getRecruiterAssessments, 
    updateAssessment,
    bulkEmailInvite,
    csvInvite
} = require('./assesment.controller');

const { requireAuth, authorizeRoles } = require('../Authentication&Roles/auth.middleware');

// Public endpoint for candidates to join via token link
AssessmentRouter.post('/join/:inviteToken', joinAssessment);

// Recruiter-protected endpoints
AssessmentRouter.post('/', requireAuth, authorizeRoles('recruiter'), createAssessment);
AssessmentRouter.get('/', requireAuth, authorizeRoles('recruiter'), getRecruiterAssessments);
AssessmentRouter.put('/:id', requireAuth, authorizeRoles('recruiter'), updateAssessment);

// Inviting candidates
AssessmentRouter.post('/:id/invite/email', requireAuth, authorizeRoles('recruiter'), bulkEmailInvite);
AssessmentRouter.post('/:id/invite/csv', requireAuth, authorizeRoles('recruiter'), upload.single('file'), csvInvite);

module.exports = AssessmentRouter;
