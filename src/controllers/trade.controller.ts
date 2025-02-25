import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { io } from '../server'; // Import the io instance
import { addChartDataPoint, getChartData } from '../utils/chartData'; // Import chart data functions
import Web3 from 'web3'; // Import Web3
import { TradeType } from '@prisma/client';

const web3 = new Web3(process.env.NETWORK_RPC_URL); // Initialize Web3 with your RPC URL

export const createTrade = async (req: Request, res: Response) => {
  try {
    const { tokenId, amount, type, walletAddress, price, tx_hash } = req.body;

    // Verify the transaction hash
    const transaction = await web3.eth.getTransaction(tx_hash);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }

    // Check if the transaction's from address matches the provided walletAddress
    if (transaction.from.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address does not match the transaction' 
      });
    }

    // Check if the transaction timestamp is within the last 3 minutes
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const block = await web3.eth.getBlock(transaction.blockNumber); // Get the block
    const transactionTime = Number(block.timestamp); // Convert timestamp to number

    if (currentTime - transactionTime > 180) { // 180 seconds = 3 minutes
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction timestamp is older than 3 minutes' 
      });
    }

    // Check if the walletAddress exists and matches the user
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { trades: true } // Include trades if needed
    });

    if (!user || user.address.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Wallet address does not match the user' 
      });
    }

    const token = await prisma.token.findUnique({
      where: { contractAddress: tokenId }
    });

    if (!token) {
      return res.status(404).json({ 
        success: false, 
        error: 'Token not found' 
      });
    }

    let mbuy;

    if(type === 'buy'){
      mbuy = TradeType.BUY;
    }else {
      mbuy = TradeType.SELL;
    }

    const trade = await prisma.trade.create({
      data: {
        tokenId: token.id,
        amount: parseFloat(amount),
        type: mbuy,
        walletAddress,
        price: token.price,
        userId: req.user!.id,
        txHash: tx_hash
      }
    });

    // Add chart data point for the token
    addChartDataPoint(tokenId, price, amount);

    // Emit the new trade
    io.emit('newTrade', trade);

    // Emit updated chart data for the specific token
    const chartData = getChartData(tokenId);
    io.emit('chartDataUpdate', { tokenId, chartData });

    return res.status(201).json(trade);
  } catch (error) {
    console.error('Error creating trade:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecentTransactions = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const getTokenId = await prisma.token.findUnique({
      where: {
        contractAddress: id
      }
    });

    if(!getTokenId){
      return res.status(500).json({ error: 'Invalid Token Contract Address Provided' });
    }

    const transactions = await prisma.trade.findMany({
      where: {
        tokenId: getTokenId.id
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        token: true
      }
    });

    const formattedTransactions = transactions.map((tx: { id: any; token: { image: any; symbol: any; contractAddress: string; }; txHash: string | null; walletAddress: any; type: string; amount: { toString: () => any; }; }) => ({
      id: tx.id,
      logo: tx.token.image,
      symbol: tx.token.symbol,
      address: tx.walletAddress,
      type: tx.type.toLowerCase(),
      amount: tx.amount.toString(),
      contractAddress: tx.token.contractAddress,
      txHash: tx.txHash || ''
    }));

    return res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 