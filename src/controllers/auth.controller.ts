import { Request, Response } from 'express';
import { ethers } from 'ethers';
import prisma from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import Web3 from 'web3';

interface ConnectWalletRequest {
  address: string;
  signature: string;
  message: string;
}

export const connectWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, signature, message } = req.body as ConnectWalletRequest;
    const web3 = new Web3(process.env.NETWORK_RPC_URL);

    // Verify signature
    const signerAddr = web3.eth.accounts.recover(message, signature);
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() }
    });

    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase()
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      address: user.address,
      userId: user.id,
      username: user.username,
      isNewUser,
      token
    });
  } catch (error: any) {
    console.error('Connect wallet error:', error);
    res.status(500).json({ error: error.shortMessage });
  }
};

export const updateUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, username } = req.body;

    // Validate input
    if (!address || !username) {
      res.status(400).json({ success: false, error: 'Address and username are required' });
      return;
    }

    const validateToken = await prisma.user.findUnique({
      where: {
        id: (req.user as any).id
      }
    });

    if (!validateToken) {
      res.status(402).json({ success: false, error: 'User in the token does not exist !' });
      return;
    }

    // Find the user by address
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Update the username
    const updatedUser = await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: { username },
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        address: updatedUser.address,
        username: updatedUser.username,
      },
    });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; 

