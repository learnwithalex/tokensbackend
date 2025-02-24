import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getStats = async (req: Request, res: Response) => {
  try {
    // Get total volume
    const trades = await prisma.trade.findMany();
    const totalVolume = trades.reduce((sum: number, trade: { amount: number; price: number; }) => 
      sum + (trade.amount * trade.price), 0
    );

    // Get user count
    const totalUsers = await prisma.user.count();

    // Calculate average fees (mock data for now)
    const averageTnxFee = '1%';
    const averageCreationFee = '0.003ETH';

    return res.json({
      totalVolume: totalVolume.toString(),
      totalTrades: trades.length,
      totalUsers,
      averageTnxFee,
      averageCreationFee
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 