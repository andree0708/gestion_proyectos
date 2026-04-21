import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { RegisterDto, LoginDto } from '../types/auth.types.js';

export const register = async (req: Request, res: Response) => {
  try {
    const data = req.body as RegisterDto;
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = req.body as LoginDto;
    const result = await authService.login(data);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};