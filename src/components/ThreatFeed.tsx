import React from 'react';
import { DNSQuery } from '../types/dns';
import { AlertTriangle, Shield, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ThreatFeedProps {
  threats: DNSQuery[];
}

export const ThreatFeed: React.FC<ThreatFeedProps> = ({ threats }) => {
  const recentThreats = threats
    .filter(q => q.threatLevel !== 'safe')
    .slice(0, 8);

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'malicious':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'suspicious':
        return <Shield className="w-4 h-4 text-yellow-400" />;
      default:
        return <Shield className="w-4 h-4 text-green-400" />;
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'malicious':
        return 'border-red-500/50 bg-red-900/20';
      case 'suspicious':
        return 'border-yellow-500/50 bg-yellow-900/20';
      default:
        return 'border-green-500/50 bg-green-900/20';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Live Threat Feed</h3>
        <div className="flex items-center text-sm text-gray-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <span>Live</span>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {recentThreats.map((threat) => (
          <div
            key={threat.id}
            className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${getThreatColor(threat.threatLevel)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getThreatIcon(threat.threatLevel)}
                <span className="ml-2 font-medium text-white">
                  {threat.threatLevel === 'malicious' ? 'Blocked' : 'Detected'}
                </span>
              </div>
              <span className="text-xs text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDistanceToNow(threat.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            <div className="mb-2">
              <code className="text-sm bg-gray-900 px-2 py-1 rounded text-red-300 font-mono">
                {threat.domain}
              </code>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <span className="block font-medium text-gray-300">Source</span>
                <span>{threat.source}</span>
              </div>
              <div>
                <span className="block font-medium text-gray-300">AI Score</span>
                <span className="text-red-400">{(threat.aiScore * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="block font-medium text-gray-300">Client IP</span>
                <span className="font-mono">{threat.clientIP}</span>
              </div>
              <div>
                <span className="block font-medium text-gray-300">Location</span>
                <span>{threat.city}, {threat.country}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                threat.threatLevel === 'malicious' 
                  ? 'bg-red-900 text-red-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {threat.threatLevel.toUpperCase()}
              </span>
              
              <button className="text-gray-400 hover:text-white transition-colors flex items-center text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Details
              </button>
            </div>
          </div>
        ))}
        
        {recentThreats.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active threats detected</p>
            <p className="text-sm">System is secure</p>
          </div>
        )}
      </div>
    </div>
  );
};