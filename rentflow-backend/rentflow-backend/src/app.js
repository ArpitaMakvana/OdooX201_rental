import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, isTest } from './config/env.js';
import apiRouter from './routes/index.js';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const app = express();

// Behind a reverse proxy (Heroku, Render, nginx, ...) this makes
// `req.secure` / `X-Forwarded-*` handling correct, which matters for the
// `secure` cookie flag once NODE_ENV=production.
app.set('trust proxy', 1);

app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (!isTest) {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
