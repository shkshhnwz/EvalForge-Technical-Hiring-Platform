const express = require('express');
const UserRouter = express.Router();
const {register,login,refresh,logout} = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

UserRouter.post('/register',register);
UserRouter.post('/login',login);

UserRouter.post('/refresh',refresh);
UserRouter.post('/logout',logout);

module.exports = UserRouter;