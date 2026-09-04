const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://dummy-dsn@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { CONFIG } from './config/index.js';
import apiRouter from './routes/api.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { handleStripeWebhook } from './controllers/paymentController.js';

const app = express();
const server = http.createServer(app);

// Apply Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS configuration for mobile and admin web
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.post('/api/payment/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Static file serving for uploads (PDF, docs, images)
app.use('/uploads', express.static(CONFIG.UPLOAD_DIR));

// Mount REST API
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h1 style="color: #0D8ABC;">UNICOM Backend API is running perfectly! 🚀</h1>
      <p style="color: #555;">This is the backend API server. It does not have a frontend UI here.</p>
      <p style="color: #555;">Please go to <b>http://localhost:3000</b> to view the Mobile App.</p>
    </div>
  `);
});
app.use('/api', apiRouter);

// Socket.io Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Setup real-time event listeners
setupSocketHandlers(io);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

const PORT = CONFIG.PORT;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 UNICOM Real-time Simultaneous Translation Server`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Gateway: ws://localhost:${PORT}`);
  console.log(`🔒 Admin 2FA Portal API: http://localhost:${PORT}/api/admin/login`);
  console.log(`=======================================================`);
});

