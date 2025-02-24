import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getPortfolio = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const checkUser = await prisma.user.findFirst({
      where: {
        address: address.toLowerCase()
      }
    });

    if(!checkUser){
      res.status(500).json({ error: 'Invalid User, or User not Found' });
      return;
    }

    // Get all trades for this address
    const trades = await prisma.trade.findMany({
      where: { walletAddress: address },
      include: {
        token: true
      }
    });

    // Group trades by token and calculate balances
    const portfolioMap = new Map<string, {
      coin: string;
      icon: string | null;
      marketCap: string;
      balance: string;
      value: string;
      change: string;
      graph: 'positive' | 'negative';
    }>();
    
    trades.forEach((trade: { token: any; amount: any; type: any; }) => {
      const { token, amount, type } = trade;
      const currentBalance = portfolioMap.get(token.id) || {
        coin: token.symbol,
        icon: token.image,
        marketCap: ((token.price || 0) * (token.totalSupply || 0)).toString(),
        balance: '0',
        value: '0',
        change: '0%',
        graph: 'positive' as const
      };

      const tradeAmount = type === 'BUY' ? Number(amount) : -Number(amount);
      const newBalance = parseFloat(currentBalance.balance) + tradeAmount;
      const value = (newBalance * (token.price || 0)).toString();

      portfolioMap.set(token.id, {
        ...currentBalance,
        balance: newBalance.toString(),
        value
      });
    });

    // Get tokens created by this address
    const createdTokens = await prisma.token.findMany({
      where: {
        creator: {
          address
        }
      },
      include: {
        trades: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const memestreams = createdTokens.map((token: { symbol: any; image: any; price: number; totalSupply: number; trades: { createdAt: { toISOString: () => any; }; }[]; createdAt: { toISOString: () => any; }; }) => ({
      coin: token.symbol,
      icon: token.image,
      revenue: (token.price * token.totalSupply).toString(),
      holders: '0', // Would need additional tracking
      change: '0%', // Would need historical data
      lastActive: token.trades[0]?.createdAt.toISOString() || token.createdAt.toISOString()
    }));

     return res.json({
      username: checkUser.username,
      image: checkUser.image,
      portfolio: Array.from(portfolioMap.values()),
      memestreams
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
     return res.status(500).json({ error: 'Internal server error' });
  }
}; 