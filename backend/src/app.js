import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

// ====== Global middleware ======
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200
  })
);
// Increase JSON body limit so we can store small document previews (base64)
app.use(express.json({ limit: '10mb' }));

// ====== Health check ======
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// ====== API routes ======
app.use('/api', apiRoutes);

// ====== Error handling ======
app.use(notFound);
app.use(errorHandler);

export default app;
