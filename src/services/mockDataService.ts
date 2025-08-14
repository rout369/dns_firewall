import { DNSQuery, ThreatIntelligence, SystemMetrics, GeographicData } from '../types/dns';

const suspiciousDomains = [
  'malware-example.com',
  'phishing-site.net',
  'cryptominer.org',
  'ransomware-c2.biz',
  'suspicious-redirect.info'
];

const safeDomains = [
  'google.com',
  'github.com',
  'stackoverflow.com',
  'mozilla.org',
  'wikipedia.org',
  'cloudflare.com'
];

const countries = [
  { name: 'United States', code: 'US', lat: 39.8283, lng: -98.5795 },
  { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954 },
  { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515 },
  { name: 'United Kingdom', code: 'GB', lat: 55.3781, lng: -3.4360 },
  { name: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188 },
  { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253 },
  { name: 'India', code: 'IN', lat: 20.5937, lng: 78.9629 },
  { name: 'Japan', code: 'JP', lat: 36.2048, lng: 138.2529 }
];

const cities = ['New York', 'London', 'Tokyo', 'Berlin', 'Moscow', 'São Paulo', 'Mumbai', 'Beijing'];

export const generateMockDNSQuery = (): DNSQuery => {
  const isSuspicious = Math.random() < 0.15; // 15% suspicious queries
  const domain = isSuspicious 
    ? suspiciousDomains[Math.floor(Math.random() * suspiciousDomains.length)]
    : safeDomains[Math.floor(Math.random() * safeDomains.length)];
  
  const country = countries[Math.floor(Math.random() * countries.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  const threatLevel = isSuspicious 
    ? (Math.random() < 0.6 ? 'suspicious' : 'malicious')
    : 'safe';
    
  const status = threatLevel === 'malicious' 
    ? 'blocked' 
    : (threatLevel === 'suspicious' && Math.random() < 0.3 ? 'redirected' : 'allowed');

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    domain,
    type: ['A', 'AAAA', 'CNAME', 'TXT', 'MX'][Math.floor(Math.random() * 5)] as any,
    clientIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: country.name,
    city,
    status,
    threatLevel,
    source: ['AI Classification', 'VirusTotal', 'AbuseIPDB', 'Blocklist'][Math.floor(Math.random() * 4)],
    responseTime: Math.floor(Math.random() * 150) + 10,
    aiScore: threatLevel === 'safe' ? Math.random() * 0.3 : (Math.random() * 0.7) + 0.3
  };
};

export const generateSystemMetrics = (queries: DNSQuery[]): SystemMetrics => {
  const totalQueries = queries.length;
  const blockedQueries = queries.filter(q => q.status === 'blocked').length;
  const allowedQueries = queries.filter(q => q.status === 'allowed').length;
  const avgResponseTime = queries.reduce((acc, q) => acc + q.responseTime, 0) / totalQueries || 0;
  const threatsDetected = queries.filter(q => q.threatLevel !== 'safe').length;
  const uniqueClients = new Set(queries.map(q => q.clientIP)).size;

  return {
    totalQueries,
    blockedQueries,
    allowedQueries,
    avgResponseTime: Math.round(avgResponseTime),
    cacheHitRate: Math.floor(Math.random() * 30) + 60, // 60-90%
    threatsDetected,
    uniqueClients,
    bandwidth: Math.floor(Math.random() * 500) + 100 // MB
  };
};

export const generateGeographicData = (queries: DNSQuery[]): GeographicData[] => {
  const countryMap = new Map<string, { queries: number; threats: number; country: any }>();
  
  queries.forEach(query => {
    const country = countries.find(c => c.name === query.country);
    if (country) {
      const existing = countryMap.get(country.code) || { queries: 0, threats: 0, country };
      existing.queries++;
      if (query.threatLevel !== 'safe') existing.threats++;
      countryMap.set(country.code, existing);
    }
  });

  return Array.from(countryMap.values()).map(data => ({
    country: data.country.name,
    code: data.country.code,
    lat: data.country.lat,
    lng: data.country.lng,
    queries: data.queries,
    threats: data.threats
  }));
};

export const mockThreatIntelligence: ThreatIntelligence[] = [
  {
    domain: 'malware-example.com',
    virusTotalScore: 8.5,
    abuseIPDBScore: 9.2,
    malwareDetected: true,
    categories: ['malware', 'trojan', 'botnet'],
    lastSeen: new Date(Date.now() - 3600000)
  },
  {
    domain: 'phishing-site.net',
    virusTotalScore: 7.8,
    abuseIPDBScore: 8.9,
    malwareDetected: true,
    categories: ['phishing', 'credential-theft'],
    lastSeen: new Date(Date.now() - 7200000)
  }
];