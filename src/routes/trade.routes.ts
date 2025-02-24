import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createTrade, getRecentTransactions } from '../controllers/trade.controller';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await createTrade(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recent/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await getRecentTransactions(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 