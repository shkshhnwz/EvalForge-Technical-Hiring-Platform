const express = require('express');
const AssessmentRouter = express.Router();
const { joinAssessment } = require('./assesment.controller');

AssessmentRouter.post('/join/:inviteToken', joinAssessment);

module.exports = AssessmentRouter;
