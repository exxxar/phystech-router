import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import pinoHttp from 'pino-http';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(pinoHttp({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' }));

app.use('/api', routes);

app.use(errorHandler);

export default app;