import React from 'react';
import { GeographicData } from '../types/dns';
import { MapPin, AlertTriangle } from 'lucide-react';

interface ThreatMapProps {
  data: GeographicData[];
}

export const ThreatMap: React.FC<ThreatMapProps> = ({ data }) => {
  const maxQueries = Math.max(...data.map(d => d.queries));
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Geographic Threat Distribution</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Queries</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Threats</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-4 min-h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.slice(0, 8).map((location) => {
            const intensity = (location.queries / maxQueries) * 100;
            const threatRatio = location.threats / location.queries * 100;
            
            return (
              <div 
                key={location.code} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50 hover:border-gray-500 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-white font-medium text-sm">{location.code}</span>
                  </div>
                  {location.threats > 0 && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Queries</span>
                    <span className="text-white text-sm font-medium">{location.queries}</span>
                  </div>
                  
                  {location.threats > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Threats</span>
                      <span className="text-red-400 text-sm font-medium">{location.threats}</span>
                    </div>
                  )}
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${intensity}%` }}
                    ></div>
                  </div>
                  
                  {location.threats > 0 && (
                    <div className="text-xs text-gray-400">
                      Threat Rate: {threatRatio.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};