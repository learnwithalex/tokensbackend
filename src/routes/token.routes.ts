import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createToken, getNewTokens, getTokenDetails, getTokenChart, filterTokens } from '../controllers/token.controller';

const router = Router();

router.post('/new', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await createToken(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await getNewTokens(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await getTokenDetails(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chart/:id', getTokenChart);

router.get('/tokens/filter', filterTokens);

export default router; 