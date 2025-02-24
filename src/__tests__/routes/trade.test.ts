import request from 'supertest';
import app from '../../app';
import { context } from '../setup';
import { generateTestToken } from '../utils/test-utils';
import { TradeType } from '@prisma/client';

describe('Trade Routes', () => {
  const testToken = generateTestToken('user-1');

  describe('POST /api/v1/trades', () => {
    it('should create a new trade', async () => {
      const mockToken = {
        id: '1',
        price: 1.0,
        symbol: 'TEST',
        createdAt: new Date(),
        name: 'Test Token',
        contractAddress: '0x123',
        totalSupply: 1000000,
        image: 'https://example.com/image.png',
        description: 'Test token description',
        website: null,
        twitter: null,
        updatedAt: new Date(),
        creatorId: 'user-1'
      };

      context.prisma.token.findUnique.mockResolvedValueOnce(mockToken);
      context.prisma.trade.create.mockResolvedValueOnce({
          id: '1',
          tokenId: '1',
          amount: 100,
          type: 'BUY',
          price: 1.0,
          walletAddress: '0x123',
          userId: 'user-1',
          createdAt: new Date(),
          txHash: null
      });

      const response = await request(app)
        .post('/api/v1/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          tokenId: '1',
          amount: '100',
          type: 'BUY',
          walletAddress: '0x123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('txHash');
    });
  });

  describe('GET /api/v1/trades/recent', () => {
    it('should return recent transactions', async () => {
      const mockTrades = [{
        id: '1',
        token: {
          image: 'https://example.com/image.png',
          symbol: 'TEST'
        },
        walletAddress: '0x123',
        type: TradeType.BUY,
        amount: 100,
        price: 1.0,
        txHash: null,
        createdAt: new Date(),
        tokenId: '1',
        userId: 'user-1'
      }];

      context.prisma.trade.findMany.mockResolvedValueOnce(mockTrades);

      const response = await request(app)
        .get('/api/v1/trades/recent');

      expect(response.status).toBe(200);
      expect(response.body.transactions).toBeInstanceOf(Array);
      expect(response.body.transactions.length).toBe(1);
    });
  });
}); 