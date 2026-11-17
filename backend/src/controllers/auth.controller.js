import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { User, Profile } from '../models/index.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, securityQuestion, securityAnswer } = req.body;
    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Name, email, password, security question and answer are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : 'GUEST',
      securityQuestion,
      securityAnswerHash
    });

    // Ensure a Profile exists for this user
    const existingProfile = await Profile.findOne({ email });
    if (!existingProfile) {
      await Profile.create({
        name,
        email,
        role: user.role,
        phone: '',
        address: '',
        hotelName: user.role === 'ADMIN' ? 'Aetheria Heights' : undefined,
        paymentMethods: [],
        documents: [],
        preferences: {
          preferredFloor: 'No Preference',
          pillowType: 'Hypoallergenic',
          dietaryRestrictions: [],
          newsletter: false
        },
        loyaltyPoints: 0,
        loyaltyTier: 'Silver',
        adminNotes: ''
      });
    }

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to register user', details: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to login', details: err.message });
  }
};

// POST /api/auth/forgot-password/question
export const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ error: 'Security question not set for this account. Please contact support.' });
    }

    return res.json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get security question', details: err.message });
  }
};

// POST /api/auth/forgot-password/verify
export const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    if (!email || !securityAnswer) {
      return res.status(400).json({ error: 'Email and security answer are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify security answer (case-insensitive comparison)
    const isValidAnswer = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswerHash);
    if (!isValidAnswer) {
      return res.status(401).json({ error: 'Incorrect security answer' });
    }

    return res.json({ success: true, message: 'Security answer verified' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to verify security answer', details: err.message });
  }
};

// POST /api/auth/forgot-password/reset
export const resetPassword = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'Email, security answer, and new password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify security answer (case-insensitive comparison)
    const isValidAnswer = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswerHash);
    if (!isValidAnswer) {
      return res.status(401).json({ error: 'Incorrect security answer' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
};
