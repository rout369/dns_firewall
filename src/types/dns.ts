export interface DNSQuery {
  id: string;
  timestamp: Date;
  domain: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS';
  clientIP: string;
  country: string;
  city: string;
  status: 'allowed' | 'blocked' | 'redirected';
  threatLevel: 'safe' | 'suspicious' | 'malicious';
  source: string;
  responseTime: number;
  aiScore: number;
}

export interface ThreatIntelligence {
  domain: string;
  virusTotalScore: number;
  abuseIPDBScore: number;
  malwareDetected: boolean;
  categories: string[];
  lastSeen: Date;
}

export interface SystemMetrics {
  totalQueries: number;
  blockedQueries: number;
  allowedQueries: number;
  avgResponseTime: number;
  cacheHitRate: number;
  threatsDetected: number;
  uniqueClients: number;
  bandwidth: number;
}

export interface GeographicData {
  country: string;
  code: string;
  lat: number;
  lng: number;
  queries: number;
  threats: number;
}