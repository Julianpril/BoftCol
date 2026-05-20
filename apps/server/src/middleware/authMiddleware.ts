import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export interface AuthRequest extends Request {
  adminId?: string;
}

export function createAuthMiddleware(secret: string) {
  return function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, secret) as { adminId: string };
      req.adminId = payload.adminId;
      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
}

export const requireAdmin = createAuthMiddleware(config.jwt.secret);
