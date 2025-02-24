import request from 'supertest';
import app from '../../app';
import { context } from '../setup';
import { generateTestToken } from '../utils/test-utils';

describe('Token Routes', () => {
  const testToken = generateTestToken('user-1');

  describe('POST /api/v1/tokens', () => {
    it('should create a new token', async () => {
      const mockToken = {
        id: '1',
        name: 'Test Token',
        symbol: 'TEST',
        contractAddress: '0x123',
        totalSupply: 1000000,
        price: 1.0,
        image: 'https://example.com/image.png',
        description: 'Test token description',
        creatorId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        website: null,
        twitter: null
      };

      context.prisma.token.create.mockResolvedValueOnce(mockToken);

      const response = await request(app)
        .post('/api/v1/tokens')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Token',
          symbol: 'TEST',
          contractAddress: '0x123',
          totalSupply: 1000000,
          price: 1.0,
          image: 'https://example.com/image.png',
          description: 'Test token description'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toHaveProperty('id');
    });
  });

  describe('GET /api/v1/tokens/new', () => {
    it('should return list of new tokens', async () => {
      const mockTokens = [{
        id: '1',
        symbol: 'TEST',
        createdAt: new Date(),
        price: 1.0,
        totalSupply: 1000000,
        image: 'https://example.com/image.png',
        description: 'Test description',
        trades: []
      }];

      const mockTokensWithAllFields = mockTokens.map(token => ({
        ...token,
        name: 'Test Token',
        contractAddress: '0x123',
        website: null,
        twitter: null,
        updatedAt: new Date(),
        creatorId: 'user-1'
      }));

      context.prisma.token.findMany.mockResolvedValueOnce(mockTokensWithAllFields);

      const response = await request(app)
        .get('/api/v1/tokens/new');

      expect(response.status).toBe(200);
      expect(response.body.tokens).toBeInstanceOf(Array);
      expect(response.body.tokens.length).toBe(1);
    });
  });
}); 