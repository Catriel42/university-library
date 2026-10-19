import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import readingStatusRoutes from './routes/readingStatusRoutes.js';

export function createApp(): Express {
  const app = express();

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  // Security and base middleware
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Dev-friendly fallback
        }
      },
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Base API endpoint
  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'University Library API',
      version: '1.0.0',
      status: 'active',
    });
  });

  app.use('/api/books', bookRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/reading-status', readingStatusRoutes);

  // Central error handling middleware
  app.use(
    (
      err: Error & { status?: number },
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      console.error('Unhandled error:', err);

      const status = err.status || 500;
      const code =
        err.name === 'OpenLibraryError'
          ? 'UPSTREAM_ERROR'
          : 'INTERNAL_SERVER_ERROR';

      res.status(status).json({
        error: {
          code: status === 500 ? 'INTERNAL_SERVER_ERROR' : code,
          message: err.message || 'An unexpected internal error occurred.',
        },
      });
    }
  );

  return app;
}
