const express = require('express');
const router = express.Router();
const { 
  getAssessmentAnalytics, 
  getCandidateDetail, 
  exportResultsCSV 
} = require('./analytics.controller');
const { requireAuth, authorizeRoles } = require('../Authentication&Roles/auth.middleware');

// All analytics endpoints require Recruiter role
router.get('/assessment/:assessmentId', requireAuth, authorizeRoles('recruiter'), getAssessmentAnalytics);
router.get('/assessment/:assessmentId/candidate/:candidateId', requireAuth, authorizeRoles('recruiter'), getCandidateDetail);
router.get('/assessment/:assessmentId/export-csv', requireAuth, authorizeRoles('recruiter'), exportResultsCSV);

module.exports = router;
