import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bookRoutes from './routes/bookRoutes.js';

export function createApp(): Express {
  const app = express();

  // Security and base middleware
  app.use(helmet());
  app.use(cors());
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

  // Central error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    
    const status = err.status || 500;
    const code = err.name === 'OpenLibraryError' ? 'UPSTREAM_ERROR' : 'INTERNAL_SERVER_ERROR';
    
    res.status(status).json({
      error: {
        code: status === 500 ? 'INTERNAL_SERVER_ERROR' : code,
        message: err.message || 'An unexpected internal error occurred.',
      },
    });
  });

  return app;
}
