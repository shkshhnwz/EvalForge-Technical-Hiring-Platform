const express = require('express');
const OrgRouter = express.Router();
const { registerOrganization } = require('./org.controller');

OrgRouter.post('/signup', registerOrganization);

module.exports = OrgRouter;
