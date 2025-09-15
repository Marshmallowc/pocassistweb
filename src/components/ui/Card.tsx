import React from 'react';
import { Card as AntCard } from 'antd';
import './Card.less';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, extra }) => {
  return (
    <AntCard 
      className={`custom-card ${className}`}
      title={title}
      extra={extra}
      bordered={false}
    >
      {children}
    </AntCard>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`custom-card-content ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`custom-card-header ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return <h3 className={`custom-card-title ${className}`}>{children}</h3>;
};
