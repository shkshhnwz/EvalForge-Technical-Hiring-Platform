// src/modules/Submissions/submission.routes.js
const express = require('express');
const router = express.Router();
const { submitCode, getSubmissionStatus } = require('./submission.controller');
const { requireAuth } = require('../Authentication&Roles/auth.middleware');

router.post('/', requireAuth, submitCode);
router.get('/:id', requireAuth, getSubmissionStatus);

module.exports = router;
