import React from 'react';
import { Button as AntButton } from 'antd';
import './Button.less';

type ButtonVariant = 'default' | 'primary' | 'ghost' | 'link';
type ButtonSize = 'small' | 'middle' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantMap = {
  default: 'default',
  primary: 'primary',
  ghost: 'ghost',
  link: 'link'
};

const sizeMap = {
  small: 'small',
  middle: 'middle', 
  large: 'large'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'middle',
  onClick,
  className = '',
  disabled = false,
  type = 'button'
}) => {
  return (
    <AntButton
      type={variantMap[variant] as any}
      size={sizeMap[size] as any}
      onClick={onClick}
      className={`custom-button ${className}`}
      disabled={disabled}
      htmlType={type}
    >
      {children}
    </AntButton>
  );
};
