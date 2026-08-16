const express = require('express');
const UserRouter = express.Router();
const {register,login} = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');

UserRouter.post('/register',register);
UserRouter.post('/login',login);

module.exports = UserRouter;