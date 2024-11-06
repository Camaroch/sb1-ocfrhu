import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { sendVerificationEmail } from '../services/email.service.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, username, type } = req.body;

    if (await User.findOne({ email })) {
      throw new ApiError(400, 'Email already registered');
    }

    const user = new User({
      email,
      password,
      username,
      type
    });

    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.verification.email.token = verificationToken;
    user.verification.email.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.verification.email.verified) {
      throw new ApiError(403, 'Please verify your email first');
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
};