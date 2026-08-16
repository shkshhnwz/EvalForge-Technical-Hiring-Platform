const User = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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

