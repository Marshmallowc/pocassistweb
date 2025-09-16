import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Progress } from "../../../components/ui/Progress";
import { Input } from "../../../components/ui/Input";
import ResultDetail from "./result-detail";
import { deleteScanTask, downloadScanReport, startScanTask, pauseScanTask, resumeScanTask } from "../../../api/task";
import { message, Modal } from "antd";
import {
  CustomBarChart3,
  CustomAlertTriangle,
  CustomCheckCircle,
  CustomTrendingUp,
} from "../../../components/Icons";
import {
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "./index.less";

const ScanResults: React.FC<RouteComponentProps> = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskResults, setTaskResults] = useState([
    {
      id: "TASK-001",
      name: "电商平台AI推荐系统安全评估",
      type: "模型安全评估",
      status: "completed",
      progress: 100,
      createTime: "2024-01-15 10:30",
      completedTime: "2024-01-15 15:45",
      estimatedTime: "2小时30分钟",
      riskLevel: "medium",
      vulnerabilities: 12,
      score: 75,
      details: { high: 2, medium: 5, low: 5 },
    },
    {
      id: "TASK-002",
      name: "智能客服对抗攻击测试",
      type: "对抗攻击测试",
      status: "completed",
      progress: 100,
      createTime: "2024-01-14 14:20",
      completedTime: "2024-01-14 16:05",
      estimatedTime: "1小时45分钟",
      riskLevel: "high",
      vulnerabilities: 18,
      score: 45,
      details: { high: 6, medium: 8, low: 4 },
    },
    {
      id: "TASK-003",
      name: "图像识别模型隐私检测",
      type: "数据隐私检测",
      status: "running",
      progress: 65,
      createTime: "2024-01-16 09:15",
      completedTime: null,
      estimatedTime: "3小时10分钟",
      riskLevel: null,
      vulnerabilities: null,
      score: null,
      details: null,
    },
    {
      id: "TASK-004",
      name: "图像分类模型基础扫描",
      type: "基础安全扫描",
      status: "completed",
      progress: 100,
      createTime: "2024-01-13 09:20",
      completedTime: "2024-01-13 11:20",
      estimatedTime: "2小时",
      riskLevel: "low",
      vulnerabilities: 3,
      score: 92,
      details: { high: 0, medium: 1, low: 2 },
    },
    {
      id: "TASK-005",
      name: "语音识别模型安全评估",
      type: "模型安全评估",
      status: "pending",
      progress: 0,
      createTime: "2024-01-17 14:30",
      completedTime: null,
      estimatedTime: "4小时",
      riskLevel: null,
      vulnerabilities: null,
      score: null,
      details: null,
    },
    {
      id: "TASK-006",
      name: "自然语言处理模型评估",
      type: "模型安全评估",
      status: "paused",
      progress: 30,
      createTime: "2024-01-18 10:15",
      completedTime: null,
      estimatedTime: "2小时45分钟",
      riskLevel: null,
      vulnerabilities: null,
      score: null,
      details: null,
    },
  ]);

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
          if (response?.data?.success) {
            message.success(response.data.message || '任务删除成功');
            // 从任务列表中移除已删除的任务
            setTaskResults(prevTasks => 
              prevTasks.filter(task => task.id !== taskId)
            );
          } else {
            message.error(response?.data?.message || '删除失败');
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
      
      if (response?.data?.success) {
        const { blob, filename } = response.data.data;
        
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
        message.error(response?.data?.message || '报告生成失败');
      }
    } catch (error) {
      hide();
      console.error('下载报告失败:', error);
      message.error((error as any)?.response?.data?.message || '下载报告时发生错误');
    }
  };

  // 更新任务状态的辅助函数
  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTaskResults(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );
  };

  // 处理开始任务
  const handleStartTask = async (taskId: string) => {
    try {
      const response: any = await startScanTask(taskId);
      if (response?.data?.success) {
        message.success('任务启动成功');
        updateTaskStatus(taskId, 'running');
      } else {
        message.error(response?.data?.message || '启动失败');
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
      if (response?.data?.success) {
        message.success('任务暂停成功');
        updateTaskStatus(taskId, 'paused');
      } else {
        message.error(response?.data?.message || '暂停失败');
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
      if (response?.data?.success) {
        message.success('任务恢复成功');
        updateTaskStatus(taskId, 'running');
      } else {
        message.error(response?.data?.message || '恢复失败');
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

  const completedTasks = taskResults.filter((task) => task.status === "completed");
  const totalVulnerabilities = completedTasks.reduce((sum, task) => sum + (task.vulnerabilities || 0), 0);
  const averageScore =
    completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum, task) => sum + (task.score || 0), 0) / completedTasks.length)
      : 0;
  const passRate =
    completedTasks.length > 0
      ? Math.round((completedTasks.filter((task) => (task.score || 0) >= 70).length / completedTasks.length) * 100)
      : 0;

  return (
    <div className="scan-results-container">
      <div className="header-section">
        <div>
          <h2 className="page-title">扫描结果</h2>
          <p className="page-subtitle">查看AI安全评估任务的扫描结果</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card>
          <CardContent className="stats-card-content">
            <div className="stats-item">
              <div>
                <p className="stats-label">总任务数</p>
                <p className="stats-value">{taskResults.length}</p>
              </div>
              <CustomBarChart3 className="stats-icon text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="stats-card-content">
            <div className="stats-item">
              <div>
                <p className="stats-label">发现漏洞</p>
                <p className="stats-value text-red-600">{totalVulnerabilities}</p>
              </div>
              <CustomAlertTriangle className="stats-icon text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="stats-card-content">
            <div className="stats-item">
              <div>
                <p className="stats-label">平均安全分</p>
                <p className="stats-value text-yellow-600">{averageScore}</p>
              </div>
              <CustomTrendingUp className="stats-icon text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="stats-card-content">
            <div className="stats-item">
              <div>
                <p className="stats-label">通过率</p>
                <p className="stats-value text-green-600">{passRate}%</p>
              </div>
              <CustomCheckCircle className="stats-icon text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>任务列表与扫描结果</CardTitle>
          <div className="search-section">
            <div className="search-input-wrapper">
              <SearchOutlined className="search-icon" />
              <Input placeholder="搜索任务..." className="search-input" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="task-list">
            {taskResults.map((task) => {
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
                      <p className="detail-value">{task.type}</p>
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
                        <p className="detail-label">发现漏洞</p>
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
                      <div className="score-progress">
                        <div className="progress-header">
                          <span className="summary-label">安全评分</span>
                          <span className="progress-value">{task.score}/100</span>
                        </div>
                        <Progress value={task.score || 0} className="progress-bar" />
                      </div>
                    </div>
                  ) : (
                    <div className="task-summary">
                      <div className="progress-header">
                        <span className="summary-label">执行进度</span>
                        <span className="progress-value">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="progress-bar" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanResults;
