import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import shippingRoutes from './routes/shipping';

dotenv.config();

// Check for AusPost API key
if (!process.env.AUSPOST_API_KEY) {
  console.error('Error: AUSPOST_API_KEY environment variable is not set');
  process.exit(1);
}

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 300 // 5 minutes
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/shipping', shippingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});