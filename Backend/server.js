require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

//Imports
const authMiddleware = require('./middleware/auth');
const UserRouter = require('./routes/UserRoutes');

// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/users',UserRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});