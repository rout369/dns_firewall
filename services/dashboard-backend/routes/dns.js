const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// DNS Query Schema
const dnsQuerySchema = new mongoose.Schema({
  queryId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  domain: { type: String, required: true },
  queryType: { type: String, enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS'], required: true },
  clientIP: { type: String, required: true },
  country: String,
  city: String,
  status: { type: String, enum: ['allowed', 'blocked', 'redirected'], required: true },
  threatLevel: { type: String, enum: ['safe', 'suspicious', 'malicious'], default: 'safe' },
  source: String,
  responseTime: Number,
  aiScore: { type: Number, min: 0, max: 1 },
  virusTotalScore: Number,
  abuseIPDBScore: Number,
  blocked: { type: Boolean, default: false },
  reason: String
}, {
  timestamps: true,
  collection: 'dns_queries'
});

// Add indexes for better query performance
dnsQuerySchema.index({ timestamp: -1 });
dnsQuerySchema.index({ domain: 1 });
dnsQuerySchema.index({ clientIP: 1 });
dnsQuerySchema.index({ status: 1 });
dnsQuerySchema.index({ threatLevel: 1 });

const DNSQuery = mongoose.model('DNSQuery', dnsQuerySchema);

// GET /api/dns/queries - Get recent DNS queries
router.get('/queries', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      domain,
      status,
      threatLevel,
      clientIP,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (domain) {
      filter.domain = { $regex: domain, $options: 'i' };
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (threatLevel) {
      filter.threatLevel = threatLevel;
    }
    
    if (clientIP) {
      filter.clientIP = clientIP;
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const queries = await DNSQuery.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await DNSQuery.countDocuments(filter);

    res.json({
      queries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching DNS queries:', error);
    res.status(500).json({ error: 'Failed to fetch DNS queries' });
  }
});

// GET /api/dns/stats - Get DNS query statistics
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          totalQueries: { $sum: 1 },
          allowedQueries: {
            $sum: { $cond: [{ $eq: ['$status', 'allowed'] }, 1, 0] }
          },
          blockedQueries: {
            $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
          },
          redirectedQueries: {
            $sum: { $cond: [{ $eq: ['$status', 'redirected'] }, 1, 0] }
          },
          threatsDetected: {
            $sum: { $cond: [{ $ne: ['$threatLevel', 'safe'] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' },
          uniqueClients: { $addToSet: '$clientIP' }
        }
      }
    ];

    const [stats] = await DNSQuery.aggregate(pipeline);
    
    if (!stats) {
      return res.json({
        totalQueries: 0,
        allowedQueries: 0,
        blockedQueries: 0,
        redirectedQueries: 0,
        threatsDetected: 0,
        avgResponseTime: 0,
        uniqueClients: 0,
        cacheHitRate: 85, // Mock cache hit rate
        bandwidth: Math.floor(Math.random() * 500) + 100
      });
    }

    res.json({
      ...stats,
      uniqueClients: stats.uniqueClients.length,
      avgResponseTime: Math.round(stats.avgResponseTime || 0),
      cacheHitRate: Math.floor(Math.random() * 30) + 60, // Mock cache hit rate
      bandwidth: Math.floor(Math.random() * 500) + 100 // Mock bandwidth
    });
  } catch (error) {
    console.error('Error fetching DNS stats:', error);
    res.status(500).json({ error: 'Failed to fetch DNS statistics' });
  }
});

// GET /api/dns/top-domains - Get top queried domains
router.get('/top-domains', async (req, res) => {
  try {
    const { limit = 10, type = 'all' } = req.query;
    
    const matchStage = {};
    if (type === 'blocked') {
      matchStage.status = 'blocked';
    } else if (type === 'suspicious') {
      matchStage.threatLevel = { $in: ['suspicious', 'malicious'] };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
          lastSeen: { $max: '$timestamp' },
          threatLevel: { $first: '$threatLevel' },
          avgAiScore: { $avg: '$aiScore' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ];

    const domains = await DNSQuery.aggregate(pipeline);
    
    res.json(domains.map(domain => ({
      domain: domain._id,
      count: domain.count,
      lastSeen: domain.lastSeen,
      threatLevel: domain.threatLevel,
      avgAiScore: domain.avgAiScore
    })));
  } catch (error) {
    console.error('Error fetching top domains:', error);
    res.status(500).json({ error: 'Failed to fetch top domains' });
  }
});

// GET /api/dns/geographic - Get geographic distribution
router.get('/geographic', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            country: '$country',
            city: '$city'
          },
          queries: { $sum: 1 },
          threats: {
            $sum: { $cond: [{ $ne: ['$threatLevel', 'safe'] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          queries: { $sum: '$queries' },
          threats: { $sum: '$threats' },
          cities: {
            $push: {
              city: '$_id.city',
              queries: '$queries',
              threats: '$threats'
            }
          }
        }
      },
      { $sort: { queries: -1 } }
    ];

    const geoData = await DNSQuery.aggregate(pipeline);
    
    // Add mock coordinates for visualization
    const countryCoords = {
      'US': { lat: 39.8283, lng: -98.5795 },
      'CN': { lat: 35.8617, lng: 104.1954 },
      'DE': { lat: 51.1657, lng: 10.4515 },
      'GB': { lat: 55.3781, lng: -3.4360 },
      'RU': { lat: 61.5240, lng: 105.3188 },
      'BR': { lat: -14.2350, lng: -51.9253 },
      'IN': { lat: 20.5937, lng: 78.9629 },
      'JP': { lat: 36.2048, lng: 138.2529 }
    };

    const result = geoData.map(country => ({
      country: country._id,
      code: country._id,
      queries: country.queries,
      threats: country.threats,
      lat: countryCoords[country._id]?.lat || 0,
      lng: countryCoords[country._id]?.lng || 0,
      cities: country.cities
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    res.status(500).json({ error: 'Failed to fetch geographic data' });
  }
});

// POST /api/dns/query - Log a new DNS query (for testing)
router.post('/query', async (req, res) => {
  try {
    const queryData = {
      queryId: req.body.queryId || Math.random().toString(36).substr(2, 9),
      ...req.body
    };

    const query = new DNSQuery(queryData);
    await query.save();

    // Emit to WebSocket clients
    req.app.locals.io.to('dns-feed').emit('dns-query', query);
    
    if (query.threatLevel !== 'safe') {
      req.app.locals.io.to('threats').emit('threat-detected', query);
    }

    res.status(201).json(query);
  } catch (error) {
    console.error('Error logging DNS query:', error);
    res.status(500).json({ error: 'Failed to log DNS query' });
  }
});

module.exports = router;