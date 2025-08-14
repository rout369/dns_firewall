import { useState, useEffect, useCallback } from 'react';
import { DNSQuery, SystemMetrics, GeographicData } from '../types/dns';
import { generateMockDNSQuery, generateSystemMetrics, generateGeographicData } from '../services/mockDataService';

export const useDNSData = () => {
  const [queries, setQueries] = useState<DNSQuery[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [geoData, setGeoData] = useState<GeographicData[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const addQuery = useCallback(() => {
    const newQuery = generateMockDNSQuery();
    setQueries(prev => [newQuery, ...prev.slice(0, 499)]); // Keep last 500 queries
  }, []);

  useEffect(() => {
    // Generate initial data
    const initialQueries = Array.from({ length: 50 }, () => generateMockDNSQuery());
    setQueries(initialQueries);
  }, []);

  useEffect(() => {
    // Update metrics whenever queries change
    if (queries.length > 0) {
      setMetrics(generateSystemMetrics(queries));
      setGeoData(generateGeographicData(queries));
    }
  }, [queries]);

  useEffect(() => {
    // Simulate real-time queries
    const interval = setInterval(() => {
      if (Math.random() < 0.8) { // 80% chance to add a query
        addQuery();
      }
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds

    return () => clearInterval(interval);
  }, [addQuery]);

  return {
    queries,
    metrics,
    geoData,
    isConnected,
    addQuery
  };
};