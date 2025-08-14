const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cron = require('node-cron');
const winston = require('winston');
require('dotenv').config();

// Import routes and middleware
const dnsRoutes = require('./routes/dns');
const metricsRoutes = require('./routes/metrics');
const threatRoutes = require('./routes/threats');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://admin:SecurePassword123!@localhost:27017/dns_firewall?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// Redis Connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Connected to Redis'));

redisClient.connect();

// Make Redis client available to routes
app.locals.redis = redisClient;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dns', dnsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/threats', threatRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection
    const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe-dns-feed', () => {
    socket.join('dns-feed');
    logger.info(`Client ${socket.id} subscribed to DNS feed`);
  });
  
  socket.on('subscribe-threats', () => {
    socket.join('threats');
    logger.info(`Client ${socket.id} subscribed to threat feed`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.locals.io = io;

// Simulate real-time DNS queries for demo
const simulateDNSQueries = () => {
  const domains = [
    'google.com', 'facebook.com', 'malware-example.com', 'github.com',
    'phishing-site.net', 'stackoverflow.com', 'suspicious-domain.org'
  ];
  
  const countries = ['US', 'CN', 'DE', 'GB', 'RU', 'BR', 'IN', 'JP'];
  const cities = ['New York', 'London', 'Tokyo', 'Berlin', 'Moscow', 'São Paulo', 'Mumbai', 'Beijing'];
  
  setInterval(() => {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const isSuspicious = domain.includes('malware') || domain.includes('phishing') || domain.includes('suspicious');
    
    const query = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      domain,
      type: ['A', 'AAAA', 'CNAME', 'TXT'][Math.floor(Math.random() * 4)],
      clientIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      status: isSuspicious ? (Math.random() < 0.8 ? 'blocked' : 'redirected') : 'allowed',
      threatLevel: isSuspicious ? (Math.random() < 0.6 ? 'suspicious' : 'malicious') : 'safe',
      source: ['AI Classification', 'VirusTotal', 'AbuseIPDB', 'Blocklist'][Math.floor(Math.random() * 4)],
      responseTime: Math.floor(Math.random() * 150) + 10,
      aiScore: isSuspicious ? Math.random() * 0.7 + 0.3 : Math.random() * 0.3
    };
    
    // Emit to connected clients
    io.to('dns-feed').emit('dns-query', query);
    
    if (isSuspicious) {
      io.to('threats').emit('threat-detected', query);
    }
    
    // Store in Redis for caching
    redisClient.setEx(`query:${query.id}`, 3600, JSON.stringify(query));
    
  }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds
};

// Start DNS query simulation
simulateDNSQueries();

// Scheduled tasks
cron.schedule('0 */6 * * *', async () => {
  logger.info('Running scheduled threat intelligence update');
  // Update threat intelligence data
  // This would typically fetch from VirusTotal, AbuseIPDB, etc.
});

cron.schedule('0 0 * * *', async () => {
  logger.info('Running daily cleanup tasks');
  // Clean up old logs, update statistics, etc.
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.API_PORT || 3001;
server.listen(PORT, () => {
  logger.info(`DNS Firewall Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  await mongoose.connection.close();
  await redisClient.quit();
  
  process.exit(0);
});

module.exports = { app, server, io };