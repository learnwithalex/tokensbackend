import request from 'supertest';
import app from '../../app';
import { context } from '../setup';
import { TradeType } from '@prisma/client';

describe('Stats Routes', () => {
  describe('GET /api/v1/stats', () => {
    it('should return platform statistics', async () => {
      const mockTrades = [{
        id: '1',
        type: TradeType.BUY,
        amount: 100,
        price: 1.0,
        txHash: null,
        walletAddress: '0x123',
        createdAt: new Date(),
        tokenId: '1',
        userId: 'user-1'
      }];

      context.prisma.trade.findMany.mockResolvedValueOnce(mockTrades);
      context.prisma.user.count.mockResolvedValueOnce(10);

      const response = await request(app)
        .get('/api/v1/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalVolume');
      expect(response.body).toHaveProperty('totalTrades');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('averageTnxFee');
      expect(response.body).toHaveProperty('averageCreationFee');
    });
  });
}); 