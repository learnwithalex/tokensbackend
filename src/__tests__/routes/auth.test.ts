import request from 'supertest';
import { ethers } from 'ethers';
import app from '../../app';
import { context } from '../setup';
import { generateTestWallet, generateTestSignature } from '../utils/test-utils';

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/connect-wallet', () => {
    it('should connect wallet and return user data with token', async () => {
      const wallet = generateTestWallet();
      const message = 'Sign this message to connect your wallet';
      const signature = await generateTestSignature(new ethers.Wallet(wallet.privateKey), message);

      const mockUser = {
        id: '1',
        address: wallet.address.toLowerCase(),
        username: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      context.prisma.user.findUnique.mockResolvedValueOnce(null);
      context.prisma.user.create.mockResolvedValueOnce({...mockUser, image: null});

      const response = await request(app)
        .post('/api/v1/auth/connect-wallet')
        .send({
          address: wallet.address,
          signature,
          message
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.address).toBe(wallet.address.toLowerCase());
      expect(response.body.isNewUser).toBe(true);
    });

    it('should return 401 for invalid signature', async () => {
      const wallet = generateTestWallet();
      const message = 'Sign this message to connect your wallet';
      const signature = 'invalid-signature';

      const response = await request(app)
        .post('/api/v1/auth/connect-wallet')
        .send({
          address: wallet.address,
          signature,
          message
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid signature');
    });
  });
}); 