import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  req.auth = { userId: token };
  
  next();
};