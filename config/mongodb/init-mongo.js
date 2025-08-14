// MongoDB initialization script
db = db.getSiblingDB('dns_firewall');

// Create collections
db.createCollection('dns_queries');
db.createCollection('threat_intelligence');
db.createCollection('users');
db.createCollection('system_metrics');

// Create indexes for better performance
db.dns_queries.createIndex({ "timestamp": -1 });
db.dns_queries.createIndex({ "domain": 1 });
db.dns_queries.createIndex({ "clientIP": 1 });
db.dns_queries.createIndex({ "status": 1 });
db.dns_queries.createIndex({ "threatLevel": 1 });
db.dns_queries.createIndex({ "country": 1 });

db.threat_intelligence.createIndex({ "domain": 1 }, { unique: true });
db.threat_intelligence.createIndex({ "lastSeen": -1 });
db.threat_intelligence.createIndex({ "threatLevel": 1 });

db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.system_metrics.createIndex({ "timestamp": -1 });
db.system_metrics.createIndex({ "metric_type": 1 });

// Insert sample data
db.dns_queries.insertMany([
  {
    queryId: "sample_001",
    timestamp: new Date(),
    domain: "google.com",
    queryType: "A",
    clientIP: "192.168.1.100",
    country: "US",
    city: "New York",
    status: "allowed",
    threatLevel: "safe",
    source: "AI Classification",
    responseTime: 25,
    aiScore: 0.1
  },
  {
    queryId: "sample_002",
    timestamp: new Date(),
    domain: "malware-example.com",
    queryType: "A",
    clientIP: "192.168.1.101",
    country: "CN",
    city: "Beijing",
    status: "blocked",
    threatLevel: "malicious",
    source: "VirusTotal",
    responseTime: 45,
    aiScore: 0.9
  }
]);

db.threat_intelligence.insertMany([
  {
    domain: "malware-example.com",
    virusTotalScore: 8.5,
    abuseIPDBScore: 9.2,
    malwareDetected: true,
    categories: ["malware", "trojan", "botnet"],
    lastSeen: new Date(),
    sources: ["VirusTotal", "AbuseIPDB"]
  },
  {
    domain: "phishing-site.net",
    virusTotalScore: 7.8,
    abuseIPDBScore: 8.9,
    malwareDetected: true,
    categories: ["phishing", "credential-theft"],
    lastSeen: new Date(),
    sources: ["VirusTotal", "PhishTank"]
  }
]);

print("MongoDB initialization completed successfully!");