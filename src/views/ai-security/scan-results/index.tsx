import React, { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Progress } from "../../../components/ui/Progress";
import { Input } from "../../../components/ui/Input";
import ResultDetail from "./result-detail";
import { 
  deleteScanTask, 
  downloadScanReport, 
  startScanTask, 
  pauseScanTask, 
  resumeScanTask, 
  getScanResults,
  ScanResultItem 
} from "../../../api/task";
import { message, Modal, Spin, Tooltip, Pagination } from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "./index.less";

// 智能自适应类型标签显示组件
const TypeTagsDisplay: React.FC<{ types: string[] }> = ({ types }) => {
  const [visibleTypes, setVisibleTypes] = React.useState<string[]>([]);
  const [hiddenCount, setHiddenCount] = React.useState<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const calculateVisibleTags = React.useCallback(() => {
    if (!types || types.length === 0 || !containerRef.current) return;

    // 获取容器的实际可用宽度
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth === 0) return; // 容器还未渲染

    // 创建临时容器来测量标签宽度
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.display = 'flex';
    tempContainer.style.gap = '8px';
    tempContainer.style.fontSize = '12px';
    tempContainer.style.fontFamily = getComputedStyle(document.body).fontFamily;
    document.body.appendChild(tempContainer);

    // 使用容器实际宽度减去一些边距
    const maxWidth = containerWidth - 20; // 预留20px边距
    let totalWidth = 0;
    let visibleCount = 0;
    const moreTagWidth = 40; // +N标签的预估宽度

    for (let i = 0; i < types.length; i++) {
      // 创建临时标签元素来测量宽度
      const tempTag = document.createElement('span');
      tempTag.style.padding = '2px 8px';
      tempTag.style.border = '1px solid #1890ff';
      tempTag.style.borderRadius = '4px';
      tempTag.style.whiteSpace = 'nowrap';
      tempTag.textContent = types[i];
      tempContainer.appendChild(tempTag);

      const tagWidth = tempTag.offsetWidth + 8; // 加上间距

      // 如果还有更多标签，需要为+N标签预留空间
      const needMoreTag = i < types.length - 1;
      const requiredWidth = totalWidth + tagWidth + (needMoreTag ? moreTagWidth : 0);

      if (requiredWidth <= maxWidth) {
        totalWidth += tagWidth;
        visibleCount++;
      } else {
        break;
      }
    }

    // 清理临时容器
    document.body.removeChild(tempContainer);

    setVisibleTypes(types.slice(0, visibleCount));
    setHiddenCount(types.length - visibleCount);
  }, [types]);

  React.useEffect(() => {
    calculateVisibleTags();
  }, [calculateVisibleTags]);

  // 监听窗口大小变化和容器大小变化
  React.useEffect(() => {
    // 使用 any 类型避免 TypeScript 错误
    const ResizeObserverClass = (window as any).ResizeObserver || (global as any).ResizeObserver;
    const resizeObserver = ResizeObserverClass 
      ? new ResizeObserverClass(() => {
          calculateVisibleTags();
        })
      : null;

    const handleWindowResize = () => {
      setTimeout(calculateVisibleTags, 100); // 延迟执行，确保布局稳定
    };

    if (containerRef.current && resizeObserver) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculateVisibleTags]);

  if (!types || types.length === 0) return null;

  return (
    <Tooltip 
      title={
        <div>
          {types.map((typeItem, index) => (
            <div key={index} style={{ marginBottom: index < types.length - 1 ? 4 : 0 }}>
              {typeItem}
            </div>
          ))}
        </div>
      }
      placement="topLeft"
    >
      <div className="type-tags-container" ref={containerRef}>
        <div className="type-tags">
          {visibleTypes.map((typeItem, index) => (
            <Badge key={index} variant="outline" className="type-badge">
              {typeItem}
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="outline" className="type-badge type-badge-more">
              +{hiddenCount}
            </Badge>
          )}
        </div>
      </div>
    </Tooltip>
  );
};

const ScanResults: React.FC<RouteComponentProps> = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskResults, setTaskResults] = useState<ScanResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 分页状态管理
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 分页回调函数
  const handlePageChange = (page: number, pageSize: number | undefined) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  // 获取扫描结果数据
  const fetchScanResults = async (page: number = pagination.current, pageSize: number = pagination.pageSize) => {
    try {
      setLoading(true);
      const response = await getScanResults({
        page,
        pageSize
      });
      
      if (response.code === 200) {
        setTaskResults(response.data.results);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      } else {
        message.error(response.message || "获取扫描结果失败");
      }
    } catch (error) {
      console.error("获取扫描结果失败:", error);
      message.error("获取扫描结果时发生错误");
    } finally {
      setLoading(false);
    }
  };

  // 分页参数变化时重新获取数据
  useEffect(() => {
    fetchScanResults(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleViewDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleBackToList = () => {
    setSelectedTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    Modal.confirm({
      title: '确认删除任务',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除任务 ${taskId} 吗？此操作不可撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response: any = await deleteScanTask(taskId);
          // 修复响应数据结构处理 - Mock API 的 success 字段在 response.data.success
          const isSuccess = response?.success || response?.data?.success;
          const responseMessage = response?.message || response?.data?.message;
          
          if (isSuccess) {
            message.success(responseMessage || '任务删除成功');
            // 重新获取数据以保持同步
            fetchScanResults(pagination.current, pagination.pageSize);
          } else {
            message.error(responseMessage || '删除失败');
          }
        } catch (error) {
          console.error('删除任务失败:', error);
          message.error((error as any)?.response?.data?.message || '删除任务时发生错误');
        }
      },
    });
  };

  const handleDownloadReport = async (taskId: string) => {
    const hide = message.loading('正在生成报告，请稍候...', 0);
    
    try {
      const response: any = await downloadScanReport(taskId);
      
      hide();
      
      // 修复响应数据结构处理 - Mock API 的 success 字段在 response.data.success
      const isSuccess = response?.success || response?.data?.success;
      
      if (isSuccess) {
        const { blob, filename } = response.data;
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        window.URL.revokeObjectURL(url);
        
        message.success('报告下载成功');
      } else {
        const responseMessage = response?.message || response?.data?.message;
        message.error(responseMessage || '报告生成失败');
      }
    } catch (error) {
      hide();
      console.error('下载报告失败:', error);
      message.error((error as any)?.response?.data?.message || '下载报告时发生错误');
    }
  };

  // 刷新任务数据的辅助函数
  const refreshTaskData = () => {
    fetchScanResults(pagination.current, pagination.pageSize);
  };

  // 处理开始任务
  const handleStartTask = async (taskId: string) => {
    try {
      const response: any = await startScanTask(taskId);
      // 修复响应数据结构处理 - Mock API 的 success 字段在 response.data.success
      const isSuccess = response?.success || response?.data?.success;
      const responseMessage = response?.message || response?.data?.message;
      
      if (isSuccess) {
        message.success('任务启动成功');
        refreshTaskData();
      } else {
        message.error(responseMessage || '启动失败');
      }
    } catch (error) {
      console.error('启动任务失败:', error);
      message.error((error as any)?.response?.data?.message || '启动任务时发生错误');
    }
  };

  // 处理暂停任务
  const handlePauseTask = async (taskId: string) => {
    try {
      const response: any = await pauseScanTask(taskId);
      // 修复响应数据结构处理 - Mock API 的 success 字段在 response.data.success
      const isSuccess = response?.success || response?.data?.success;
      const responseMessage = response?.message || response?.data?.message;
      
      if (isSuccess) {
        message.success('任务暂停成功');
        refreshTaskData();
      } else {
        message.error(responseMessage || '暂停失败');
      }
    } catch (error) {
      console.error('暂停任务失败:', error);
      message.error((error as any)?.response?.data?.message || '暂停任务时发生错误');
    }
  };

  // 处理恢复任务
  const handleResumeTask = async (taskId: string) => {
    try {
      const response: any = await resumeScanTask(taskId);
      // 修复响应数据结构处理 - Mock API 的 success 字段在 response.data.success
      const isSuccess = response?.success || response?.data?.success;
      const responseMessage = response?.message || response?.data?.message;
      
      if (isSuccess) {
        message.success('任务恢复成功');
        refreshTaskData();
      } else {
        message.error(responseMessage || '恢复失败');
      }
    } catch (error) {
      console.error('恢复任务失败:', error);
      message.error((error as any)?.response?.data?.message || '恢复任务时发生错误');
    }
  };

  if (selectedTaskId) {
    return <ResultDetail taskId={selectedTaskId} onBack={handleBackToList} />;
  }

  const getRiskBadge = (level: string | null) => {
    if (!level) return null;
    const config = {
      high: { label: "高风险", variant: "destructive" as const },
      medium: { label: "中风险", variant: "default" as const },
      low: { label: "低风险", variant: "secondary" as const },
    };
    return config[level as keyof typeof config] || config.low;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      running: { label: "运行中", variant: "default" as const },
      completed: { label: "已完成", variant: "secondary" as const },
      pending: { label: "等待中", variant: "outline" as const },
      paused: { label: "已暂停", variant: "outline" as const },
      failed: { label: "失败", variant: "destructive" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };


  return (
    <div className="scan-results-container">
      <div className="header-section">
        <div>
          <h2 className="page-title">扫描结果</h2>
          <p className="page-subtitle">查看AI安全评估任务的扫描结果</p>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>任务列表与扫描结果</CardTitle>
        </CardHeader>
        <CardContent>
          <Spin spinning={loading} tip="加载中...">
            <div className="task-list">
              {taskResults.length === 0 && !loading ? (
                <div className="empty-state">
                  <p>暂无扫描任务数据</p>
                </div>
              ) : (
                taskResults.map((task) => {
              const statusConfig = getStatusBadge(task.status);
              const riskConfig = getRiskBadge(task.riskLevel);

              return (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div className="task-info">
                      <h4 className="task-name">{task.name}</h4>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      {riskConfig && <Badge variant={riskConfig.variant}>{riskConfig.label}</Badge>}
                    </div>
                    <div className="task-actions">
                      {task.status === "completed" && (
                        <>
                          <Button variant="ghost" size="small" onClick={() => handleViewDetail(task.id)}>
                            <EyeOutlined style={{ marginRight: 4 }} />
                            查看详情
                          </Button>
                          <Button variant="ghost" size="small" onClick={() => handleDownloadReport(task.id)}>
                            <DownloadOutlined style={{ marginRight: 4 }} />
                            下载报告
                          </Button>
                        </>
                      )}
                      {task.status === "running" ? (
                        <Button variant="ghost" size="small" onClick={() => handlePauseTask(task.id)}>
                          <PauseCircleOutlined style={{ marginRight: 4 }} />
                          暂停
                        </Button>
                      ) : task.status === "pending" ? (
                        <Button variant="ghost" size="small" onClick={() => handleStartTask(task.id)}>
                          <PlayCircleOutlined style={{ marginRight: 4 }} />
                          开始
                        </Button>
                      ) : task.status === "paused" ? (
                        <Button variant="ghost" size="small" onClick={() => handleResumeTask(task.id)}>
                          <PlayCircleOutlined style={{ marginRight: 4 }} />
                          恢复
                        </Button>
                      ) : null}
                      <Button 
                        variant="ghost" 
                        size="small"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </div>

                  <div className="task-details">
                    <div className="detail-item">
                      <p className="detail-label">任务ID</p>
                      <p className="detail-value task-id">{task.id}</p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">类型</p>
                      <div className="detail-value">
                        <TypeTagsDisplay types={task.type} />
                      </div>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">创建时间</p>
                      <p className="detail-value">{task.createTime}</p>
                    </div>
                    {task.completedTime ? (
                      <div className="detail-item">
                        <p className="detail-label">完成时间</p>
                        <p className="detail-value">{task.completedTime}</p>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <p className="detail-label">预计耗时</p>
                        <p className="detail-value">{task.estimatedTime}</p>
                      </div>
                    )}
                    {task.vulnerabilities !== null ? (
                      <div className="detail-item">
                        <p className="detail-label">未通过测试项</p>
                        <p className="detail-value">{task.vulnerabilities} 个</p>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <p className="detail-label">进度</p>
                        <p className="detail-value">{task.progress}%</p>
                      </div>
                    )}
                    {task.score !== null ? (
                      <div className="detail-item">
                        <p className="detail-label">安全评分</p>
                        <p className={`detail-value score-value ${getScoreColor(task.score)}`}>{task.score}</p>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <p className="detail-label">状态</p>
                        <p className="detail-value">
                          {task.status === "running" ? "执行中..." : 
                           task.status === "paused" ? "已暂停" : 
                           "等待执行"}
                        </p>
                      </div>
                    )}
                  </div>

                  {task.status === "completed" && task.details ? (
                    <div className="task-summary">
                      <div className="risk-summary">
                        <span className="summary-label">风险分布</span>
                        <div className="risk-counts">
                          <span className="risk-count high">高: {task.details.high}</span>
                          <span className="risk-count medium">中: {task.details.medium}</span>
                          <span className="risk-count low">低: {task.details.low}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="task-summary">
                      <div className="progress-header">
                        <span className="summary-label">执行进度</span>
                        <span className="progress-value">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="progress-bar" strokeColor="#4a4a4a" />
                    </div>
                  )}
                </div>
              );
                })
              )}
            </div>
          </Spin>
          
          {/* 分页组件 */}
          {taskResults.length > 0 && (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger={true}
                showQuickJumper={true}
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                }
                onChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanResults;
