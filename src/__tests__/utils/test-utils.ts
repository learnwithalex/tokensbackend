import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

export const generateTestWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
};

export const generateTestSignature = async (wallet: ethers.Wallet, message: string) => {
  return await wallet.signMessage(message);
};

export const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
}; 