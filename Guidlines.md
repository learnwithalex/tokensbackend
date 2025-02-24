
# Backend API Requirements

This document outlines the backend API requirements for the Token Platform frontend. The API should be built to support all frontend functionalities while maintaining security and performance.

## API Endpoints

### 1. Authentication & User Management

#### POST /api/auth/connect-wallet
Handles wallet connection and user authentication.
```typescript
interface ConnectWalletResponse {
  address: string;
  userId: string;
  username?: string;
  isNewUser: boolean;
}
```

#### POST /api/users
Creates new user accounts.
```typescript
interface CreateUserRequest {
  address: string;
  username: string;
}

interface CreateUserResponse {
  id: string;
  username: string;
  address: string;
  image: string;
  error?: string;
}
```

### 2. Token Management

#### POST /api/tokens
Creates new tokens on the platform.
```typescript
interface CreateTokenRequest {
  userId: string;
  totalSupply: number;
  name: string;
  symbol: string;
  price: number;
  image: string;
  contractAddress: string;
  description: string;
  website?: string;
  twitter?: string;
}

interface CreateTokenResponse {
  success: boolean;
  error?: string;
  token?: {
    id: string;
    name: string;
    symbol: string;
    contractAddress: string;
    image: string;
    price: number;
  }
}
```

#### GET /api/tokens/new
Retrieves list of newly created tokens.
```typescript
interface NewTokensResponse {
  tokens: {
    symbol: string;
    timeAgo: string;
    marketCap: string;
    image: string;
    description: string;
  }[];
}
```

#### GET /api/tokens/[id]
Retrieves detailed information about a specific token.
```typescript
interface TokenDetailsResponse {
  name: string;
  symbol: string;
  price: string;
  marketCap: string;
  volume24h: string;
  change24h: string;
  chartData: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}
```

### 3. Trading

#### POST /api/trades
Handles token trading operations.
```typescript
interface CreateTradeRequest {
  tokenId: string;
  amount: string;
  type: 'buy' | 'sell';
  walletAddress: string;
}

interface CreateTradeResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}
```

#### GET /api/transactions/recent
Retrieves recent trading transactions.
```typescript
interface RecentTransactionsResponse {
  transactions: {
    id: number;
    logo: string;
    symbol: string;
    address: string;
    type: 'buy' | 'sell';
    amount: string;
  }[];
}
```

### 4. Portfolio

#### GET /api/portfolio/[address]
Retrieves user portfolio information.
```typescript
interface PortfolioResponse {
  portfolio: {
    coin: string;
    icon: string;
    marketCap: string;
    balance: string;
    value: string;
    change: string;
    graph: 'positive' | 'negative';
  }[];
  memestreams: {
    coin: string;
    icon: string;
    revenue: string;
    holders: string;
    change: string;
    lastActive: string;
  }[];
}
```

### 5. Stats

#### GET /api/stats
Retrieves platform statistics.
```typescript
interface DexStatsResponse {
  totalVolume: string;
  totalTrades: number;
  totalUsers: number;
  averageTnxFee: string;
  averageCreationFee: string;
}
```

### 6. File Upload

#### POST /api/uploadthing
Handles file uploads for token images.
```typescript
interface UploadResponse {
  url: string;
  error?: string;
}
```

## Technical Requirements

### Authentication
- Implement wallet-based authentication
- Validate wallet signatures for secure transactions
- Maintain session management for authenticated users

### Blockchain Integration
- Validate blockchain transactions
- Interface with smart contracts for token operations
- Handle wallet interactions securely

### Real-time Updates
- Implement WebSocket connections for:
  - Price updates
  - Trading data
  - Transaction notifications

### Data Formatting
- Ensure consistent number formatting for:
  - Prices
  - Amounts
  - Percentages
- Format timestamps in user-friendly format
- Handle currency conversions and decimals properly

### Error Handling
- Implement consistent error response format
- Support frontend toast notifications
- Provide detailed error messages for debugging
- Handle blockchain transaction failures gracefully

### Security
- Implement rate limiting
- Validate all input data
- Protect against common web vulnerabilities
- Secure file upload handling
- Implement proper CORS policies

### Performance
- Implement caching where appropriate
- Optimize database queries
- Handle high-frequency trading operations
- Efficient real-time data distribution

## Development Guidelines

1. Use TypeScript for type safety
2. Follow RESTful API conventions
3. Implement proper logging
4. Write comprehensive tests
5. Document all endpoints using OpenAPI/Swagger
6. Follow security best practices
7. Implement proper environment configuration

## Getting Started

[Add instructions for setting up the development environment]

## Environment Variables

[List required environment variables]

## Contributing

[Add contribution guidelines]

## License

[Add license information]
