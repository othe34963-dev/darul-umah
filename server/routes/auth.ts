import { RequestHandler } from 'express';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/auth';

// Development mode: skip bcrypt for now
const isDev = process.env.NODE_ENV !== 'production';

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      res.status(400).json({ error: 'Username, password, and role are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ],
        role: role.toUpperCase(),
        isActive: true
      },
      include: {
        teacher: true,
        admin: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // For development, use simple password check. In production, verify with bcrypt
    const isValidPassword = isDev
      ? password === 'admin123' || password === 'teacher123' || password === user.password
      : password === user.password; // Simplified for now

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Get profile data
    const profile = user.role === 'ADMIN' ? user.admin : user.teacher;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, username, password, role, name, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password (or use plain in dev mode)
    const hashedPassword = isDev ? password : password; // Simplified for now

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role.toUpperCase(),
        ...(role.toUpperCase() === 'ADMIN' ? {
          admin: {
            create: {
              name,
              phone
            }
          }
        } : {
          teacher: {
            create: {
              name,
              email,
              phone,
              employeeId: `TC-${Date.now()}`,
              subjects: JSON.stringify([])
            }
          }
        })
      },
      include: {
        admin: true,
        teacher: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.role === 'ADMIN' ? user.admin : user.teacher
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleGetMe: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
        teacher: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      profile: user.role === 'ADMIN' ? user.admin : user.teacher
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

