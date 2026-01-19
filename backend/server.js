import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { connectDB } from './config/connectDB.js';
import { initializeFirebase } from './config/firebase.js';
import { startSubscriptionJobs } from './jobs/subscriptionJobs.js';
import { authLimiter } from './middleware/rateLimiter.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analytics.js';
import auditRoutes from './routes/auditRoutes.js';
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/googleRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import planRoutes from './routes/planRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
dotenv.config();

const app = express();

// Middlewares
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: Dynamic origin handling for IP-based hosting
const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(',').map((o) => o.trim())
  : [];
console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (
      allowedOrigins.some(
        (allowed) => origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''))
      )
    ) {
      return callback(null, true);
    }

    // Allow same IP/host as the server (for IP-based deployments)
    // This allows requests from http://IP:PORT or https://IP:PORT
    const originUrl = new URL(origin);
    const isIpBased = /^(\d{1,3}\.){3}\d{1,3}$/.test(originUrl.hostname);
    if (isIpBased) {
      console.log('Allowing IP-based origin:', origin);
      return callback(null, true);
    }

    // Allow localhost for development
    if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
      return callback(null, true);
    }

    // Allow clurst.io domain (production)
    if (originUrl.hostname === 'clurst.io' || originUrl.hostname.endsWith('.clurst.io')) {
      console.log('Allowing clurst.io domain:', origin);
      return callback(null, true);
    }

    console.warn('CORS blocked origin:', origin);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '200kb' }));

// Initialize services
connectDB();
initializeFirebase();

// Start subscription jobs
if (process.env.NODE_ENV !== 'test') {
  startSubscriptionJobs();
}

// Start the post scheduler (runs every 5 minutes)
if (process.env.NODE_ENV !== 'test') {
  import('./services/postScheduler.js')
    .then(({ startScheduler }) => startScheduler(5)) // Check every 5 minutes
    .catch((err) => console.error('Failed to start post scheduler:', err));
}

app.use((req, res, next) => {
  if (req.originalUrl === '/api/subscription/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin/plans', planRoutes);
app.use('/auth/google', googleRoutes);
app.use('/api/audit', auditRoutes);
// rate limit auth endpoints
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/post', scheduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// Test API route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// DB and server start .
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
