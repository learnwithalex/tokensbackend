import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

const prisma = mockDeep<PrismaClient>();

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: prisma
}));

export type Context = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const context: Context = {
  prisma
}; 