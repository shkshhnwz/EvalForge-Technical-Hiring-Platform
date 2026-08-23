const User = require('../../models/Users');

const RefreshToken = require('../../models/RefreshToken');
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
        userId: user._id,
        token: refreshToken,
        expiresAt: expiresAt
    });

    return { accessToken, refreshToken };

};

//Register user
exports.register = async (req, res) => {
    try {
        const { name, email, passwordHash } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedpassword = await bcrypt.hash(passwordHash, 10);

        // Force 'candidate' and orgId: null at the controller boundary
        const user = new User({ 
            name, 
            email, 
            passwordHash: hashedpassword, 
            role: 'candidate', 
            orgId: null 
        });
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
        
        // Generate access and refresh tokens
        const { accessToken, refreshToken } = await generateToken(user);
        
        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        
        return res.json({ accessToken, refreshToken, user: userResponse });

    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

// Refresh Token Rotation Handler
exports.refresh = async (req, res) => { 
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No refresh token provided" });
    }
    try {
        // Find the token in DB
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return res.status(401).json({ message: "Unauthorized: Invalid refresh token" });
        }

        // Verify expiration
        if (tokenDoc.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: tokenDoc._id });
            return res.status(401).json({ message: "Unauthorized: Refresh token expired" });
        }

        // Verify JWT signature
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (jwtErr) {
            await RefreshToken.deleteOne({ _id: tokenDoc._id });
            return res.status(401).json({ message: "Unauthorized: Invalid token signature" });
        }

        // Find the user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Generate a new access and refresh token pair (Rotation)
        const newTokens = await generateToken(user);

        // Delete the old refresh token
        await RefreshToken.deleteOne({ _id: tokenDoc._id });

        // Set the new refresh token in the cookie
        res.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({ 
            accessToken: newTokens.accessToken, 
            refreshToken: newTokens.refreshToken 
        });

    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// Logout Handler
exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: 'Server error' });
    }
}

exports.generateToken = generateToken;

