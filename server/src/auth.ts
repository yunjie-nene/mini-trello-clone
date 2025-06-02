import jwt from 'jsonwebtoken';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

export interface AuthPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }
  
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' }); 
};

export const verifyToken = (token: string): AuthPayload => {
  if (!token) {
    throw new Error('Token is required');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (!decoded.userId) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

export const getUserId = (req: Request): string | null => {
  try {
    if (!req) {
      return null;
    }

    if (!req.headers) {
      return null;
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }
    
    
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return null;
    }
    
    const { userId } = verifyToken(token);
    return userId;
  } catch (error) {
    return null;
  }
};