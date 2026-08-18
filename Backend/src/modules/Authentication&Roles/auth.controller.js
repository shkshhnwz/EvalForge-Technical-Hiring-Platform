const User = require('../../models/Users');
const Organization = require('../../models/Organizations');
const RefreshToken = require('../../models/RefreshToken');
const Assessment = require('../../models/Assessment');
const AssessmentAttempt = require('../../models/AssesmentAttempts');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = async (user) => {
    const accessToken = jwt.sign({ id: user._id, role: user.role, orgId: user.orgId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
        userId:user._id,
        token:refreshToken,
        expiresAt:expiresAt
    });

    return {accessToken,refreshToken};

};

//Register user
exports.register = async (req, res) => {
    try {
        const { name, email, passwordHash, role, orgId } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedpassword = await bcrypt.hash(passwordHash, 10);


        const user = new User({ name, email, passwordHash: hashedpassword, role, orgId });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

//Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        res.json({ token, user: userResponse });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

