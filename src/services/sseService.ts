import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getToken } from '../utils/auth';

/**
 * SSE事件类型定义
 */
export interface SSETaskProgressEvent {
  type: 'task_progress';
  taskId: string;
  data: {
    progress: number;
    estimatedTime?: string;
    status: '进行中' | '暂停' | 'running' | 'paused';
  };
}

export interface SSETaskCompletedEvent {
  type: 'task_completed';
  taskId: string;
  data: {
    status: '已完成' | '失败' | 'completed' | 'failed';
    completedTime: string;
    score?: number;
    vulnerabilities?: number;
    riskLevel?: 'high' | 'medium' | 'low';
  };
}

export interface SSETaskStatusChangeEvent {
  type: 'task_status_change';
  taskId: string;
  data: {
    previousStatus: string;
    currentStatus: string;
    timestamp: string;
  };
}

export type SSEEvent = SSETaskProgressEvent | SSETaskCompletedEvent | SSETaskStatusChangeEvent;

/**
 * SSE连接状态
 */
export enum SSEConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

/**
 * SSE事件监听器类型
 */
export type SSEEventListener = (event: SSEEvent) => void;
export type SSEStatusListener = (status: SSEConnectionStatus, error?: Error) => void;

/**
 * SSE服务管理器
 */
class SSEService {
  private eventListeners: Set<SSEEventListener> = new Set();
  private statusListeners: Set<SSEStatusListener> = new Set();
  private abortController: AbortController | null = null;
  private connectionStatus: SSEConnectionStatus = SSEConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1秒
  private isManuallyDisconnected = false;

  /**
   * 获取当前连接状态
   */
  getConnectionStatus(): SSEConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 设置连接状态并通知监听器
   */
  private setConnectionStatus(status: SSEConnectionStatus, error?: Error) {
    this.connectionStatus = status;
    this.statusListeners.forEach(listener => listener(status, error));
  }

  /**
   * 开始SSE连接
   */
  async connect(): Promise<void> {
    if (this.connectionStatus === SSEConnectionStatus.CONNECTED || 
        this.connectionStatus === SSEConnectionStatus.CONNECTING) {
      return;
    }

    this.isManuallyDisconnected = false;
    this.setConnectionStatus(SSEConnectionStatus.CONNECTING);

    // 创建新的AbortController
    this.abortController = new AbortController();

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌');
      }

      await fetchEventSource('v1/ai_task/task_progress_update/', {
        signal: this.abortController.signal,
        headers: {
          'Authorization': `JWT ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        onopen: async (response) => {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            this.setConnectionStatus(SSEConnectionStatus.CONNECTED);
            this.reconnectAttempts = 0;
          } else {
            throw new Error(`SSE连接失败: ${response.status} ${response.statusText}`);
          }
        },
        onmessage: (event) => {
          try {
            const data = JSON.parse(event.data) as SSEEvent;
            this.eventListeners.forEach(listener => listener(data));
          } catch (error) {
          }
        },
        onclose: () => {
          if (!this.isManuallyDisconnected) {
            this.setConnectionStatus(SSEConnectionStatus.DISCONNECTED);
            this.handleReconnect();
          }
        },
        onerror: (error) => {
          this.setConnectionStatus(SSEConnectionStatus.ERROR, error);
          
          if (!this.isManuallyDisconnected) {
            this.handleReconnect();
          }
          
          // 抛出错误以触发重连
          throw error;
        }
      });
    } catch (error) {
      this.setConnectionStatus(SSEConnectionStatus.ERROR, error as Error);
      
      if (!this.isManuallyDisconnected) {
        this.handleReconnect();
      }
    }
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect() {
    if (this.isManuallyDisconnected) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setConnectionStatus(SSEConnectionStatus.ERROR, new Error('重连次数超过限制'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数退避
    this.setConnectionStatus(SSEConnectionStatus.RECONNECTING);

    setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }

  /**
   * 断开SSE连接
   */
  disconnect() {
    this.isManuallyDisconnected = true;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.setConnectionStatus(SSEConnectionStatus.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: SSEEventListener) {
    this.eventListeners.add(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: SSEEventListener) {
    this.eventListeners.delete(listener);
  }

  /**
   * 添加状态监听器
   */
  addStatusListener(listener: SSEStatusListener) {
    this.statusListeners.add(listener);
  }

  /**
   * 移除状态监听器
   */
  removeStatusListener(listener: SSEStatusListener) {
    this.statusListeners.delete(listener);
  }

  /**
   * 清理所有监听器
   */
  clearListeners() {
    this.eventListeners.clear();
    this.statusListeners.clear();
  }

  /**
   * 检查页面可见性并管理连接
   */
  private handleVisibilityChange = () => {
    if (document.hidden) {
      if (this.connectionStatus === SSEConnectionStatus.CONNECTED) {
        this.disconnect();
      }
    } else {
      if (this.connectionStatus === SSEConnectionStatus.DISCONNECTED && !this.isManuallyDisconnected) {
        this.connect();
      }
    }
  };

  /**
   * 初始化页面可见性监听
   */
  initVisibilityListener() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * 移除页面可见性监听
   */
  removeVisibilityListener() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// 创建单例实例
export const sseService = new SSEService();

// 导出SSE服务类用于类型定义
export default SSEService;
