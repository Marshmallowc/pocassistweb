import React from 'react';
import { 
  BarChartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  TrophyOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

// 使用 Ant Design 图标替代 lucide-react 图标
export const BarChart3 = BarChartOutlined;
export const AlertTriangle = ExclamationCircleOutlined;
export const CheckCircle = CheckCircleOutlined;
export const Download = DownloadOutlined;
export const Eye = EyeOutlined;
export const TrendingUp = TrophyOutlined;
export const Search = SearchOutlined;
export const Play = PlayCircleOutlined;
export const Pause = PauseCircleOutlined;
export const Trash2 = DeleteOutlined;

// 自定义图标组件（如果需要特殊样式）
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CustomBarChart3: React.FC<IconProps> = ({ className, style }) => (
  <BarChartOutlined className={className} style={{ fontSize: '20px', ...style }} />
);

export const CustomAlertTriangle: React.FC<IconProps> = ({ className, style }) => (
  <ExclamationCircleOutlined className={className} style={{ fontSize: '20px', ...style }} />
);

export const CustomCheckCircle: React.FC<IconProps> = ({ className, style }) => (
  <CheckCircleOutlined className={className} style={{ fontSize: '20px', ...style }} />
);

export const CustomTrendingUp: React.FC<IconProps> = ({ className, style }) => (
  <TrophyOutlined className={className} style={{ fontSize: '20px', ...style }} />
);
