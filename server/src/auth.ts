import jwt from 'jsonwebtoken';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use env variable in production

export interface AuthPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const getUserId = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { userId } = verifyToken(token);
    return userId;
  } catch (error) {
    return null;
  }
};