import React from 'react';
import { DNSQuery } from '../types/dns';
import { Shield, ShieldAlert, ShieldX, Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DNSQueryTableProps {
  queries: DNSQuery[];
  limit?: number;
}

export const DNSQueryTable: React.FC<DNSQueryTableProps> = ({ queries, limit = 10 }) => {
  const displayQueries = queries.slice(0, limit);

  const getStatusIcon = (status: string, threatLevel: string) => {
    if (status === 'blocked') return <ShieldX className="w-4 h-4 text-red-400" />;
    if (threatLevel === 'suspicious') return <ShieldAlert className="w-4 h-4 text-yellow-400" />;
    return <Shield className="w-4 h-4 text-green-400" />;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      allowed: 'bg-green-900 text-green-300 border-green-800',
      blocked: 'bg-red-900 text-red-300 border-red-800',
      redirected: 'bg-yellow-900 text-yellow-300 border-yellow-800'
    };
    
    return colors[status as keyof typeof colors] || colors.allowed;
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Recent DNS Queries</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Response Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayQueries.map((query) => (
              <tr key={query.id} className="hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(query.status, query.threatLevel)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(query.status)}`}>
                      {query.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white font-mono">{query.domain}</div>
                  <div className="text-xs text-gray-400">AI Score: {(query.aiScore * 100).toFixed(1)}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded-full">
                    {query.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                  {query.clientIP}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-300">
                    <MapPin className="w-3 h-3 mr-1" />
                    {query.city}, {query.country}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-3 h-3 mr-1" />
                    {query.responseTime}ms
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDistanceToNow(query.timestamp, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};