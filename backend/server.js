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

dotenv.config();

const app = express();

// Middlewares
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS: restrict to known origin if provided
const corsOrigin = process.env.FRONTEND_ORIGIN
console.log(corsOrigin)
app.use(cors({ 
    origin: corsOrigin, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '200kb' }));

// Initialize services
connectDB();
initializeFirebase();

// Routes
app.use("/auth/google", googleRoutes);
app.use("/api/audit", auditRoutes);
// rate limit auth endpoints
app.use('/api/auth', authLimiter, authRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'backend' });
});

// DB and server start
const PORT = process.env.PORT || 8000;


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


