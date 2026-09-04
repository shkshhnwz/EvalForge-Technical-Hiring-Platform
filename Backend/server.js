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
const QuestionRouter = require('./src/modules/Questions/question.routes');
const AnalyticsRouter = require('./src/modules/Analytics/analytics.routes');
const { startWorker } = require('./src/modules/CodeExecution/worker');
const SubmissionRouter = require('./src/modules/Submissions/submission.routes');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

//Routes
app.use('/api/users', UserRouter);
app.use('/api/organization', OrgRouter);
app.use('/api/assessments', AssessmentRouter);
app.use('/api/questions', QuestionRouter);
app.use('/api/submissions', SubmissionRouter);
app.use('/api/analytics', AnalyticsRouter);

// Start Worker after DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    // Start background code execution worker
    startWorker().catch(err => console.error('Failed to start worker:', err));
  })
  .catch(err => console.log(err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});