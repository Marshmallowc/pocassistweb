import React from 'react';
import { Tag } from 'antd';
import './Badge.less';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles = {
  default: 'badge-default',
  secondary: 'badge-secondary', 
  destructive: 'badge-destructive',
  outline: 'badge-outline'
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  return (
    <span className={`custom-badge ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
