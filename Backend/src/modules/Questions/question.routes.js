const express = require('express');
const QuestionRouter = express.Router();
const { createQuestion, getQuestionBank, getQuestionDetails } = require('./question.controller');
const { requireAuth, authorizeRoles } = require('../Authentication&Roles/auth.middleware');

QuestionRouter.post('/',requireAuth, authorizeRoles('recruiter'),createQuestion);
QuestionRouter.get('/', requireAuth, authorizeRoles('recruiter'), getQuestionBank);
QuestionRouter.get('/:id', requireAuth, authorizeRoles('recruiter'), getQuestionDetails);

module.exports = QuestionRouter;