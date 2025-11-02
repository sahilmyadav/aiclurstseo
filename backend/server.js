import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/connectDB.js';
import { initializeFirebase } from './config/firebase.js';
import helmet from 'helmet';
import compression from 'compression';
import { authLimiter } from './middleware/rateLimiter.js';
import googleRoutes from './routes/googleRoutes.js';
import authRoutes from './routes/auth.js';
import auditRoutes from './routes/auditRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS: allow multiple origins from environment variable
const allowedOrigins = process.env.FRONTEND_ORIGINS ? process.env.FRONTEND_ORIGINS.split(',') : [];
console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '200kb' }));

// Initialize services
connectDB();
initializeFirebase();

// Routes
app.use("/auth/google", googleRoutes);
app.use("/api/audit", auditRoutes);
// rate limit auth endpoints
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reviews', reviewRoutes);

// Test routes
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'backend',
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Test API route
app.get('/api/status', (req, res) => {
    res.json({
        status: 'success',
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// DB and server start
const PORT = process.env.PORT || 8000;


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


