import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { io } from '../server'; // Import the io instance

export const createToken = async (req: Request, res: Response) => {
  try {
    const {
      totalSupply,
      name,
      symbol,
      price,
      image,
      contractAddress,
      description,
      website,
      twitter
    } = req.body;

    const checkUser = await prisma.user.findUnique({
      where: {
        id: req.user!.id
      }
    });

    if(!checkUser){
      res.status(500).json({ success: false, error: 'User does not exists, or invalid token' });
      return;
    }

    const token = await prisma.token.create({
      data: {
        totalSupply,
        name,
        symbol,
        price,
        image,
        contractAddress,
        description,
        website,
        twitter,
        status: "active",
        creatorId: req.user!.id
      }
    });

    // Broadcast the new token to all connected clients
    io.emit('newToken', token);

    return res.status(201).json({
      success: true,
      token: {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        contractAddress: token.contractAddress,
        image: token.image,
        price: token.price
      }
    });
  } catch (error) {
    console.error('Create token error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getNewTokens = async (req: Request, res: Response) => {
  try {
    const tokens = await prisma.token.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        trades: true
      }
    });

    const formattedTokens = tokens.map((token: { symbol: any; createdAt: string | number | Date; price: number; totalSupply: number; image: any; description: any; }) => ({
      symbol: token.symbol,
      timeAgo: new Date(token.createdAt).toISOString(),
      marketCap: (token.price * token.totalSupply).toString(),
      image: token.image,
      description: token.description
    }));

    return res.json({ tokens: formattedTokens });
  } catch (error) {
    console.error('Get new tokens error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTokenDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = await prisma.token.findUnique({
      where: { contractAddress: id },
      include: {
        trades: {
          orderBy: { createdAt: 'desc' },
          take: 100,
          select: {
            walletAddress: true,
            createdAt: true,
            amount: true,
            price: true,
            type: true
          }
        }
      }
    });

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Calculate market metrics
    const volume24h = token.trades
      .filter(t => new Date(t.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + (t.amount * t.price), 0);

    // Calculate holdings per address
    const holdingsMap = new Map<string, number>();
    token.trades.forEach(trade => {
      const currentBalance = holdingsMap.get(trade.walletAddress) || 0;
      const tradeAmount = trade.type === 'BUY' ? trade.amount : -trade.amount;
      holdingsMap.set(trade.walletAddress, currentBalance + tradeAmount);
    });

    // Convert to array and calculate percentages
    const holders = Array.from(holdingsMap.entries())
      .filter(([_, balance]) => balance > 0) // Only include positive balances
      .map(([address, balance]) => ({
        address,
        balance: balance.toString(),
        percentage: ((balance / token.totalSupply) * 100).toFixed(2)
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)); // Sort by percentage desc

    const marketCap = token.totalSupply * token.price;
    const chartData: never[] = []; // Mock chart data

    return res.json({
      name: token.name,
      icon: token.image,
      symbol: token.symbol,
      price: token.price.toString(),
      marketCap: marketCap.toString(),
      volume24h: volume24h.toString(),
      holders,
      change24h: "0", // Would need historical data to calculate this
      chartData
    });
  } catch (error) {
    console.error('Get token details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTokenChart = async (req: Request, res: Response) => {
  const { id } = req.params; // Get token ID from request parameters

  try {
    // Fetch trades for the token, assuming you have a Trade model
    const trades = await prisma.trade.findMany({
      where: { tokenId: id },
      orderBy: { createdAt: 'asc' }, // Order trades by date
      select: {
        createdAt: true,
        price: true,
        amount: true,
      },
    });

    // Format the data for charting
    const chartData = trades.map(trade => ({
      time: trade.createdAt,
      price: trade.price,
      amount: trade.amount,
    }));

     res.json({
      success: true,
      chartData,
    });
  } catch (error) {
    console.error('Get token chart error:', error);
     res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const filterTokens = async (req: Request, res: Response) => {
  const { category, timeFrame } = req.query;

  try {
    const timeLimit = getTimeLimit(timeFrame as string || '48h'); // Default to '24h' if undefined
    let tokens;

    switch (category) {
      case 'newlyCreated':
        tokens = await prisma.token.findMany({
          where: {
            createdAt: {
              gte: timeLimit,
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case 'mostVolume':
        tokens = await prisma.token.findMany({
          where: {
            trades: {
              some: {
                createdAt: {
                  gte: timeLimit,
                },
              },
            },
          },
          orderBy: {
            trades: {
              _count: 'desc',
            },
          },
        });
        break;

      case 'mostHolders':
        tokens = await prisma.token.findMany({
          where: {
            trades: {
              some: {
                createdAt: {
                  gte: timeLimit,
                },
              },
            },
          },
          orderBy: {
            trades: {
              _count: 'desc',
            },
          },
        });
        break;

      case 'highestMarketCap':
        tokens = await prisma.token.findMany({
          where: {
            createdAt: {
              gte: timeLimit,
            },
          },
          orderBy: {
            totalSupply: 'desc',
          },
        });
        break;

      default:
        tokens = await prisma.token.findMany();
        break;
    }

    // Generate the response with calculated fields
    const formattedTokens = tokens.map(token => {
      const marketCap = (token.price * token.totalSupply).toString(); // Calculate market cap

      // Generate category based on price (example logic)
      

      // Set change to a default value (you can modify this logic as needed)
      const change = "0%"; // Placeholder for change, modify if you have historical data

      return {
        name: token.name,
        icon: token.image,
        symbol: token.symbol,
        category,
        price: token.price,
        marketCap,
        contractAddress: token.contractAddress,
        change,
      };
    });

    res.json({ tokens: formattedTokens });
  } catch (error) {
    console.error('Filter tokens error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to get time limit based on the time frame
const getTimeLimit = (timeFrame: string) => {
  const now = new Date();
  switch (timeFrame) {
    case '10mins':
      return new Date(now.getTime() - 10 * 60 * 1000);
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // Default to the beginning of time if no valid timeframe is provided
  }
}; 