import React from 'react';
import { Progress as AntProgress } from 'antd';
import './Progress.less';

interface ProgressProps {
  value: number;
  className?: string;
  showInfo?: boolean;
  strokeColor?: string | { [key: string]: string };
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  className = '', 
  showInfo = false,
  strokeColor
}) => {
  const defaultStrokeColor = {
    '0%': '#10b981',
    '50%': '#f59e0b', 
    '100%': '#ef4444'
  };

  return (
    <AntProgress
      percent={value}
      showInfo={showInfo}
      className={`custom-progress ${className}`}
      strokeColor={strokeColor || defaultStrokeColor}
    />
  );
};
