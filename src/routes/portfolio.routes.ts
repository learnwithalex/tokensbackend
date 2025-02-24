import { Router, Request, Response } from 'express';
import { getPortfolio } from '../controllers/portfolio.controller';

const router = Router();

router.get('/:address', async (req: Request, res: Response): Promise<void> => {
  try {
    await getPortfolio(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 