import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as { userId: string };
    
    req.user = { id: decoded.userId };
    next();
  } catch (error: any) {
    console.log(error)
    res.status(401).json({ error: error.shortMessage });
    return;
  }
}; 