const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Organization = require('../../models/Organizations');
const User = require('../../models/Users');
const { generateToken } = require('../Authentication&Roles/auth.controller');

exports.registerOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, domain, password, Orgname } = req.body;

        // 1. Validation check
        if (!name || !email || !password || !Orgname) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Required fields are missing: name, email, password, and Orgname must be provided." });
        }

        // 2. Check duplicate recruiter email
        const userExists = await User.findOne({ email }).session(session);
        if (userExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "User with this email already exists." });
        }

        // 3. Check duplicate org name or domain
        const orgQuery = { Orgname };
        if (domain) {
            orgQuery.$or = [{ Orgname }, { domain }];
        }
        const orgExists = await Organization.findOne(orgQuery).session(session);
        if (orgExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Organization with this name or domain already exists." });
        }

        // 4. Create Organization
        const [org] = await Organization.create([{ Orgname, domain, plan: 'free' }], { session });

        // 5. Hash Recruiter Password
        const passwordHash = await bcrypt.hash(password, 10);

        // 6. Create Recruiter User
        const [recruiter] = await User.create([{
            name,
            email,
            passwordHash,
            role: 'recruiter',
            orgId: org._id
        }], { session });

        // 7. Add Recruiter to Organization Members array
        org.members.push(recruiter._id);
        await org.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // 8. Generate auth tokens (Login immediately)
        const { accessToken, refreshToken } = await generateToken(recruiter);

        // 9. Set HttpOnly Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const userResponse = recruiter.toObject();
        delete userResponse.passwordHash;

        return res.status(201).json({
            message: 'Organization and recruiter registered successfully',
            accessToken,
            refreshToken,
            user: userResponse,
            organization: org
        });

    } catch (err) {
        // Abort transaction in case of error
        await session.abortTransaction();
        session.endSession();
        console.error("Organization registration error:", err);
        return res.status(500).json({ message: 'Server error' });
    }
}