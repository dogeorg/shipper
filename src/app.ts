import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import shippingRoutes from './routes/shipping';
import { canReachService } from './checks';

dotenv.config();

async function startServer() {
  try {
    // Check for AusPost API key
    if (!process.env.AUSPOST_API_KEY) {
      console.error('Error: AUSPOST_API_KEY environment variable is not set');
      process.exit(1);
    }

    if (!process.env.DOGE_TO_AUD) {
      console.error('Error: DOGE_TO_AUD environment variable is not set');
      process.exit(1);
    }

    if (!process.env.HANDLING_COST_IN_DOGE) {
      console.error('Error: HANDLING_COST environment variable is not set');
      process.exit(1);
    }

    // Check AusPost is reachable
    if (await canReachService()) {
      console.log('[✓] Startup check passed: AusPOST shipping calculation API is reachable')
    } else {
      console.error('Startup check failed. Test request to AusPOST failed');
      process.exit(1);
    }

    // CORS configuration
    const corsOptions: cors.CorsOptions = {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
      methods: ['POST'],
      allowedHeaders: ['Content-Type']
    };

    const app = express();
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use('/shipping', shippingRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`[✓] Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1);
  }
}

startServer();