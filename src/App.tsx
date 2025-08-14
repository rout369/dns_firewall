import React from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  Shield, 
  Activity, 
  Globe, 
  AlertTriangle, 
  Clock, 
  Users,
  Server,
  Database,
  Zap
} from 'lucide-react';

import { MetricCard } from './components/MetricCard';
import { DNSQueryTable } from './components/DNSQueryTable';
import { ThreatMap } from './components/ThreatMap';
import { RealTimeChart } from './components/RealTimeChart';
import { ThreatFeed } from './components/ThreatFeed';
import { useDNSData } from './hooks/useDNSData';

function App() {
  const { queries, metrics, geoData, isConnected } = useDNSData();

  // Prepare chart data for last 10 data points
  const chartLabels = Array.from({ length: 10 }, (_, i) => {
    const time = new Date(Date.now() - (9 - i) * 60000);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const queryData = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 20);
  const threatData = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading DNS Firewall Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg mr-3">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DNS Firewall</h1>
              <p className="text-gray-400 text-sm">Advanced AI-Powered Security System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">System Status</div>
              <div className="text-green-400 font-medium">All Services Operational</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Queries"
            value={metrics.totalQueries.toLocaleString()}
            change={8.2}
            icon={Activity}
            color="blue"
          />
          <MetricCard
            title="Blocked Queries"
            value={metrics.blockedQueries.toLocaleString()}
            change={-12.5}
            icon={Shield}
            color="red"
          />
          <MetricCard
            title="Response Time"
            value={`${metrics.avgResponseTime}ms`}
            change={-5.3}
            icon={Clock}
            color="green"
          />
          <MetricCard
            title="Threats Detected"
            value={metrics.threatsDetected.toLocaleString()}
            change={15.7}
            icon={AlertTriangle}
            color="yellow"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Cache Hit Rate"
            value={`${metrics.cacheHitRate}%`}
            change={2.1}
            icon={Database}
            color="purple"
          />
          <MetricCard
            title="Unique Clients"
            value={metrics.uniqueClients.toLocaleString()}
            change={18.9}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Bandwidth"
            value={`${metrics.bandwidth}MB`}
            change={-3.2}
            icon={Server}
            color="green"
          />
          <MetricCard
            title="AI Processed"
            value={`${Math.floor(metrics.totalQueries * 0.73)}k`}
            change={22.1}
            icon={Zap}
            color="yellow"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RealTimeChart
            data={queryData}
            labels={chartLabels}
            title="DNS Queries Per Minute"
            color="#0EA5E9"
          />
          <RealTimeChart
            data={threatData}
            labels={chartLabels}
            title="Threats Detected Per Minute"
            color="#EF4444"
          />
        </div>

        {/* Geographic and Threat Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ThreatMap data={geoData} />
          </div>
          <div>
            <ThreatFeed threats={queries} />
          </div>
        </div>

        {/* DNS Queries Table */}
        <DNSQueryTable queries={queries} limit={15} />

        {/* Architecture Documentation */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">DNS Engine</h4>
              <p className="text-sm text-gray-400">Go + miekg/dns handling A/AAAA/CNAME/TXT queries with DoH/DNSSEC support</p>
            </div>
            
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">AI Classification</h4>
              <p className="text-sm text-gray-400">Python FastAPI + TensorFlow Lite for real-time domain threat analysis</p>
            </div>
            
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <Database className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Data Layer</h4>
              <p className="text-sm text-gray-400">Redis caching + MongoDB logging with VirusTotal/AbuseIPDB integration</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;