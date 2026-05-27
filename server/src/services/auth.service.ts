import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { RegisterDto, LoginDto, JwtPayload } from '../types/auth.types.js';

dotenv.config();

export const register = async (data: RegisterDto) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      taxId: data.taxId,
      country: data.country,
      sector: data.sector,
      department: data.department,
      city: data.city,
      address: data.address,
      kybStatus: 'approved',
    },
  });

  const user = await prisma.user.create({
    data: {
      orgId: organization.id,
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      role: 'seller',
    },
  });

  const payload: JwtPayload = {
    userId: user.id,
    orgId: organization.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { user, organization, accessToken, refreshToken };
};

export const login = async (data: LoginDto) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { organization: true },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('User account is disabled');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const payload: JwtPayload = {
    userId: user.id,
    orgId: user.orgId,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { user, organization: user.organization, accessToken, refreshToken };
};

export const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true },
    });

    if (!user || !user.isActive) {
      throw new Error('User not found or disabled');
    }

    const payload: JwtPayload = {
      userId: user.id,
      orgId: user.orgId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    return { accessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};