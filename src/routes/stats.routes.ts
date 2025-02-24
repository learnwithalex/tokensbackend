import { Router, Request, Response } from 'express';
import { getStats } from '../controllers/stats.controller';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await getStats(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 