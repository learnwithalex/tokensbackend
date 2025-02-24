import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import tokenRoutes from './routes/token.routes';
import tradeRoutes from './routes/trade.routes';
import portfolioRoutes from './routes/portfolio.routes';
import statsRoutes from './routes/stats.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/trades', tradeRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/stats', statsRoutes);

// Error handling
app.use(errorHandler);

export default app; 