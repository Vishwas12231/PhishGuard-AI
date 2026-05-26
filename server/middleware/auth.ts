import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'phishguard_super_defense_secret_key_1337';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Auth token parsed as null' });
    }

    if (token.startsWith('guest_')) {
      if (req.path === '/api/auth/me') {
        return res.status(401).json({ error: 'Please sign in to access member profile.' });
      }
      req.userId = token;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ error: 'Your session has expired. Please authenticate again.' });
  }
}

// Optional Auth middleware that registers userId if present but doesn't block the request
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        if (token.startsWith('guest_')) {
          req.userId = token;
        } else {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          req.userId = decoded.userId;
        }
      }
    }
  } catch (err) {
    // Ignore error and proceed without user context
  }
  next();
}
