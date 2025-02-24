import { Router, Request, Response } from 'express';
import { connectWallet, updateUsername } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/connect-wallet', async (req: Request, res: Response): Promise<void> => {
  try {
    await connectWallet(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/user/username', authenticate,  updateUsername);

export default router; 