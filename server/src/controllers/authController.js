import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching standard jwt refresh
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[env.cookieName];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }

    const decoded = jwt.verify(token, env.jwtRefreshSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Session invalid or user deactivated' });
    }

    // Token Rotation: Generate new access & refresh tokens
    const tokens = generateTokens(user);
    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        token: tokens.accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      }
    });
  } catch (error) {
    res.clearCookie(env.cookieName);
    return res.status(401).json({ success: false, message: 'Expired or invalid session' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie(env.cookieName);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl
      }
    }
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatarUrl } = req.body;
    const user = req.user;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
