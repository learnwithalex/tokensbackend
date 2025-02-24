import request from 'supertest';
import app from '../../app';
import { context } from '../setup';
import { TradeType } from '@prisma/client';

describe('Portfolio Routes', () => {
  describe('GET /api/v1/portfolio/:address', () => {
    it('should return portfolio data', async () => {
      const mockTrades = [{
        userId: 'user-1',
        id: '1',
        token: {
          id: '1',
          symbol: 'TEST',
          image: 'https://example.com/image.png',
          price: 1.0,
          totalSupply: 1000000
        },
        amount: 100,
        type: TradeType.BUY,
        price: 1.0,
        txHash: null,
        walletAddress: '0x123',
        createdAt: new Date(),
        tokenId: '1'
      }];

      const mockCreatedTokens = [{
        id: '1',
        symbol: 'TEST',
        image: 'https://example.com/image.png',
        price: 1.0,
        totalSupply: 1000000,
        trades: [],
        createdAt: new Date(),
        name: 'Test Token',
        contractAddress: '0x123',
        description: 'Test token',
        website: null,
        twitter: null,
        updatedAt: new Date(),
        creatorId: 'user-1'
      }];

      context.prisma.trade.findMany.mockResolvedValueOnce(mockTrades);
      context.prisma.token.findMany.mockResolvedValueOnce(mockCreatedTokens);

      const response = await request(app)
        .get('/api/v1/portfolio/0x123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('portfolio');
      expect(response.body).toHaveProperty('memestreams');
    });
  });
}); 