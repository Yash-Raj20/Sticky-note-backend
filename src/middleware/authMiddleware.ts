import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
      return next();
    } catch (error) {
      res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized, no token' });
    return;
  }
};
