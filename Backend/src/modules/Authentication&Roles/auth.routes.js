const express = require('express');
const UserRouter = express.Router();
const {register,login} = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

UserRouter.post('/register',register);
UserRouter.post('/login',login);

module.exports = UserRouter;