import React from 'react';
import { Input as AntInput } from 'antd';
import './Input.less';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  return (
    <AntInput
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`custom-input ${className}`}
      disabled={disabled}
    />
  );
};
