const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock threat intelligence data
const mockThreatIntelligence = [
  {
    domain: 'malware-example.com',
    virusTotalScore: 8.5,
    abuseIPDBScore: 9.2,
    malwareDetected: true,
    categories: ['malware', 'trojan', 'botnet'],
    lastSeen: new Date(Date.now() - 3600000),
    sources: ['VirusTotal', 'AbuseIPDB', 'Custom Blocklist']
  },
  {
    domain: 'phishing-site.net',
    virusTotalScore: 7.8,
    abuseIPDBScore: 8.9,
    malwareDetected: true,
    categories: ['phishing', 'credential-theft'],
    lastSeen: new Date(Date.now() - 7200000),
    sources: ['VirusTotal', 'PhishTank']
  },
  {
    domain: 'cryptominer.org',
    virusTotalScore: 6.5,
    abuseIPDBScore: 7.2,
    malwareDetected: true,
    categories: ['cryptomining', 'malware'],
    lastSeen: new Date(Date.now() - 10800000),
    sources: ['Custom Analysis', 'AbuseIPDB']
  }
];

// GET /api/threats/intelligence - Get threat intelligence data
router.get('/intelligence', async (req, res) => {
  try {
    const { domain, limit = 50 } = req.query;
    
    let threats = [...mockThreatIntelligence];
    
    if (domain) {
      threats = threats.filter(threat => 
        threat.domain.toLowerCase().includes(domain.toLowerCase())
      );
    }
    
    // Add some dynamic threats
    const dynamicThreats = [
      'suspicious-redirect.info',
      'fake-bank-login.com',
      'malicious-download.net',
      'scam-website.org'
    ].map(domain => ({
      domain,
      virusTotalScore: Math.random() * 5 + 5,
      abuseIPDBScore: Math.random() * 5 + 5,
      malwareDetected: Math.random() > 0.3,
      categories: ['suspicious', 'potential-threat'],
      lastSeen: new Date(Date.now() - Math.random() * 86400000),
      sources: ['AI Classification', 'Pattern Analysis']
    }));
    
    threats = [...threats, ...dynamicThreats].slice(0, limit);
    
    res.json({
      threats,
      total: threats.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching threat intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch threat intelligence' });
  }
});

// GET /api/threats/check/:domain - Check specific domain threat status
router.get('/check/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Simulate threat checking logic
    const isSuspicious = domain.includes('malware') || 
                        domain.includes('phishing') || 
                        domain.includes('suspicious') ||
                        domain.includes('scam');
    
    const threatData = {
      domain,
      safe: !isSuspicious,
      threatLevel: isSuspicious ? (Math.random() > 0.5 ? 'malicious' : 'suspicious') : 'safe',
      aiScore: isSuspicious ? Math.random() * 0.7 + 0.3 : Math.random() * 0.3,
      sources: [],
      details: {}
    };
    
    // Simulate VirusTotal check
    if (process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY !== 'your_virustotal_api_key_here') {
      try {
        // In a real implementation, you would make actual API calls
        // const vtResponse = await axios.get(`https://www.virustotal.com/vtapi/v2/domain/report`, {
        //   params: {
        //     apikey: process.env.VIRUSTOTAL_API_KEY,
        //     domain: domain
        //   }
        // });
        
        // Mock VirusTotal response
        threatData.sources.push('VirusTotal');
        threatData.details.virusTotal = {
          positives: isSuspicious ? Math.floor(Math.random() * 10) + 5 : 0,
          total: 70,
          scanDate: new Date().toISOString()
        };
      } catch (error) {
        console.error('VirusTotal API error:', error.message);
      }
    }
    
    // Simulate AbuseIPDB check
    if (process.env.ABUSEIPDB_API_KEY && process.env.ABUSEIPDB_API_KEY !== 'your_abuseipdb_api_key_here') {
      try {
        // In a real implementation, you would make actual API calls
        threatData.sources.push('AbuseIPDB');
        threatData.details.abuseIPDB = {
          abuseConfidence: isSuspicious ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 20),
          countryCode: ['US', 'CN', 'RU', 'DE'][Math.floor(Math.random() * 4)],
          usageType: 'hosting'
        };
      } catch (error) {
        console.error('AbuseIPDB API error:', error.message);
      }
    }
    
    // AI Classification
    threatData.sources.push('AI Classification');
    threatData.details.aiClassification = {
      features: {
        domainLength: domain.length,
        subdomainCount: (domain.match(/\./g) || []).length,
        entropy: Math.random() * 5,
        suspiciousKeywords: isSuspicious
      },
      confidence: threatData.aiScore
    };
    
    res.json(threatData);
  } catch (error) {
    console.error('Error checking domain threat status:', error);
    res.status(500).json({ error: 'Failed to check domain threat status' });
  }
});

// GET /api/threats/stats - Get threat statistics
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Mock threat statistics
    const stats = {
      timeRange,
      totalThreats: Math.floor(Math.random() * 1000) + 500,
      maliciousDetected: Math.floor(Math.random() * 300) + 200,
      suspiciousDetected: Math.floor(Math.random() * 200) + 100,
      blockedDomains: Math.floor(Math.random() * 150) + 75,
      topThreatCategories: [
        { category: 'malware', count: Math.floor(Math.random() * 100) + 50 },
        { category: 'phishing', count: Math.floor(Math.random() * 80) + 40 },
        { category: 'botnet', count: Math.floor(Math.random() * 60) + 30 },
        { category: 'cryptomining', count: Math.floor(Math.random() * 40) + 20 },
        { category: 'spam', count: Math.floor(Math.random() * 30) + 15 }
      ],
      topSourceCountries: [
        { country: 'US', code: 'US', threats: Math.floor(Math.random() * 100) + 50 },
        { country: 'China', code: 'CN', threats: Math.floor(Math.random() * 80) + 40 },
        { country: 'Russia', code: 'RU', threats: Math.floor(Math.random() * 70) + 35 },
        { country: 'Germany', code: 'DE', threats: Math.floor(Math.random() * 50) + 25 }
      ],
      aiAccuracy: (Math.random() * 10 + 85).toFixed(1),
      falsePositiveRate: (Math.random() * 3 + 1).toFixed(2),
      averageDetectionTime: Math.floor(Math.random() * 50) + 10
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching threat statistics:', error);
    res.status(500).json({ error: 'Failed to fetch threat statistics' });
  }
});

// POST /api/threats/report - Report a new threat
router.post('/report', async (req, res) => {
  try {
    const { domain, category, description, source } = req.body;
    
    if (!domain || !category) {
      return res.status(400).json({ error: 'Domain and category are required' });
    }
    
    // In a real implementation, you would store this in the database
    const threatReport = {
      id: Math.random().toString(36).substr(2, 9),
      domain,
      category,
      description,
      source: source || 'User Report',
      timestamp: new Date().toISOString(),
      status: 'pending_review'
    };
    
    // Emit to WebSocket clients
    req.app.locals.io.to('threats').emit('threat-reported', threatReport);
    
    res.status(201).json({
      message: 'Threat reported successfully',
      report: threatReport
    });
  } catch (error) {
    console.error('Error reporting threat:', error);
    res.status(500).json({ error: 'Failed to report threat' });
  }
});

module.exports = router;