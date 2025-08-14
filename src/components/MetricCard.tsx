import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 text-blue-100',
  green: 'from-green-500 to-green-600 text-green-100',
  red: 'from-red-500 to-red-600 text-red-100',
  yellow: 'from-yellow-500 to-yellow-600 text-yellow-100',
  purple: 'from-purple-500 to-purple-600 text-purple-100'
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white">{value}</span>
            {change !== undefined && (
              <span className={`ml-2 text-sm font-medium ${
                change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};