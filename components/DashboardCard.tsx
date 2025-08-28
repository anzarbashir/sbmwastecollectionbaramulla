
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
      <div className={`rounded-full p-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {change && <p className="text-xs text-gray-400">{change}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;
