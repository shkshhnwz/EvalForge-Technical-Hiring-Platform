require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT;

//Imports
const authMiddleware = require('./src/modules/Authentication&Roles/auth.middleware');
const UserRouter = require('./src/modules/Authentication&Roles/auth.routes');
const OrgRouter = require('./src/modules/Organizations/org.routes');
const AssessmentRouter = require('./src/modules/Assessments/assesment.routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Routes
app.use('/api/users',UserRouter);
app.use('/api/organization',OrgRouter);
app.use('/api/assessments',AssessmentRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});