import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
          {icon}
        </div>
      </div>
      
      <div className="flex items-end">
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        
        {trend && (
          <div className={`ml-2 flex items-center ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            <span className="text-sm font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;