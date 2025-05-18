import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'; 
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowingRoutes from './routes/borrowingRoutes.js';
import borrowingRequestRoutes from './routes/borrowingRequestRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [process.env.FRONTEND_URI, 'http://localhost:8080'];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); 
}

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/requests', borrowingRequestRoutes);

app.get('/', (req, res) => {
  res.send('Shelf Sync API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Server startup message can be handled by a more robust logging solution if needed
});
