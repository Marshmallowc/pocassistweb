import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { ArrowLeftOutlined, DownloadOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { message, Tooltip } from 'antd';
import { getScanResultDetail, ScanResultDetailResponse, downloadScanReport, reviewQuestion, QuestionReviewParams } from '../../../api/task';
import { getUserInfo } from '../../../utils/auth';
import './result-detail.less';

interface ResultDetailProps {
  taskId: string;
  onBack: () => void;
}

const ResultDetail: React.FC<ResultDetailProps> = ({ taskId, onBack }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [questionStates, setQuestionStates] = useState<Record<string, boolean>>({});
  const [detailData, setDetailData] = useState<ScanResultDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取扫描结果详情
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getScanResultDetail(taskId);
        if (response.code === 200) {
          setDetailData(response.data);
        } else {
          setError(response.message || '获取详情失败');
        }
      } catch (err) {
        setError('网络请求失败');
        console.error('获取扫描结果详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [taskId]);

  // 从API数据中获取相关信息
  const questions = detailData?.questions || [];
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const taskTemplate = detailData?.template;
  const taskInfo = detailData?.taskInfo;
  const summary = detailData?.summary;
  const categoryStats = detailData?.categoryStats || [];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const toggleQuestionIssue = async (question: any) => {
    const questionId = question.id;
    const originalHasIssue = question.hasIssue;
    
    // 计算新的状态
    const currentState = questionStates[questionId] !== undefined ? questionStates[questionId] : originalHasIssue;
    const newHasIssue = !currentState;
    
    // 乐观更新：先更新UI状态
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: newHasIssue,
    }));

    try {
      // 调用人工审核API（用户身份由后端从认证上下文获取）
      const reviewData: QuestionReviewParams = {
        hasIssue: newHasIssue,
        taskId: taskId,
        taskTemplate: detailData?.template?.name || '',
        taskQuestion: question.question || ''
      };

      const response = await reviewQuestion(questionId, reviewData);
      
      if (response.code === 200 && response.success) {
        message.success(`审核结果已保存：${newHasIssue ? '存在问题' : '不存在问题'}`);
        
        // 可选：记录是否修改了AI的原始判断
        if (response.data.isModified) {
          console.log(`问题 ${questionId} 的审核结果与AI判断不同`);
        }
      } else {
        message.error(response.message || '保存审核结果失败');
        // 回滚UI状态
        setQuestionStates((prev) => ({
          ...prev,
          [questionId]: currentState,
        }));
      }
    } catch (error) {
      console.error('人工审核失败:', error);
      message.error('网络请求失败，请稍后重试');
      // 回滚UI状态
      setQuestionStates((prev) => ({
        ...prev,
        [questionId]: currentState,
      }));
    }
  };

  const getQuestionIssueStatus = (question: any) => {
    return questionStates[question.id] !== undefined ? questionStates[question.id] : question.hasIssue;
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // 处理下载报告
  const handleDownloadReport = async () => {
    const hide = message.loading('正在生成报告，请稍候...', 0);
    
    try {
      const response: any = await downloadScanReport(taskId);
      
      hide();
      
      if (response?.success) {
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
        message.error(response?.message || '报告生成失败');
      }
    } catch (error) {
      hide();
      console.error('下载报告失败:', error);
      message.error((error as any)?.response?.data?.message || '下载报告时发生错误');
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="result-detail-wrap">
        <div className="detail-header">
          <div className="header-left">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              返回列表
            </Button>
            <div className="header-info">
              <h1 className="page-title">安全评估详细报告</h1>
              <p className="page-subtitle">任务ID: {taskId}</p>
            </div>
          </div>
        </div>
        <div className="detail-content flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingOutlined style={{ fontSize: 32, marginBottom: 16, color: '#1890ff' }} />
            <p className="text-gray-600">正在加载扫描结果详情...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !detailData) {
    return (
      <div className="result-detail-wrap">
        <div className="detail-header">
          <div className="header-left">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              返回列表
            </Button>
            <div className="header-info">
              <h1 className="page-title">安全评估详细报告</h1>
              <p className="page-subtitle">任务ID: {taskId}</p>
            </div>
          </div>
        </div>
        <div className="detail-content flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CloseCircleOutlined style={{ fontSize: 32, marginBottom: 16, color: '#ff4d4f' }} />
            <p className="text-red-600 mb-4">{error || '获取数据失败'}</p>
            <Button onClick={() => window.location.reload()}>重新加载</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-detail-wrap">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            返回列表
          </Button>
          <div className="header-info">
            <h1 className="page-title">{taskInfo?.name || '安全评估详细报告'}</h1>
            <p className="page-subtitle">任务ID: {taskId} | 状态: {taskInfo?.status === 'completed' ? '已完成' : taskInfo?.status === 'running' ? '执行中' : taskInfo?.status === 'pending' ? '等待中' : '失败'}</p>
          </div>
        </div>
        <Button variant="primary" onClick={handleDownloadReport}>
          <DownloadOutlined style={{ marginRight: 8 }} />
          导出报告
        </Button>
      </div>

      <div className="detail-content">
        {/* Task Template Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="template-header">
              <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <CardTitle>任务模板信息</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="template-info">
              <div className="info-grid">
                <div className="info-item">
                  <p className="info-label">模板名称</p>
                  <p className="info-value">{taskTemplate?.name || '-'}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">未通过测试项</p>
                  <p className="info-value">{summary?.issueQuestions || 0}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">总测试项</p>
                  <p className="info-value">{taskTemplate?.totalQuestions || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Categories */}
        <Card>
          <CardHeader>
            <CardTitle>存在风险测试项详情</CardTitle>
            <p className="card-description">查看所有安全评估问题和结果</p>
          </CardHeader>
          <CardContent>
            <div className="category-stats">
              <h4 className="stats-title">各分类通过率</h4>
              <div className="stats-grid">
                {categoryStats.map((stat) => {
                  return (
                    <div key={stat.category} className="stats-item">
                      <div className="stats-category">{stat.category}</div>
                      <div className="stats-label">通过率</div>
                      <div className="stats-value">
                        {stat.passedQuestions}/{stat.answeredQuestions}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="question-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">任务模板</TableHead>
                    <TableHead className="w-32">问题分类</TableHead>
                    <TableHead className="w-48">问题</TableHead>
                    <TableHead className="w-64">回答</TableHead>
                    <TableHead className="w-28">研判结论</TableHead>
                    <TableHead className="w-24 text-right">是否回答</TableHead>
                    <TableHead className="w-24 text-right">人工判别</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => {
                    const currentHasIssue = getQuestionIssueStatus(question);

                    return (
                      <TableRow key={question.id}>
                        <TableCell>
                          <span className="template-name">{taskTemplate?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="category-badge">
                            {question.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={question.question}>
                            <p className="question-text text-ellipsis-2">{question.question}</p>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {question.isAnswered ? (
                            <Tooltip title={question.answer}>
                              <div className="answer-content">
                                <p className="answer-text text-ellipsis-2">{question.answer}</p>
                              </div>
                            </Tooltip>
                          ) : (
                            <span className="waiting-text">等待评估中...</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {question.isAnswered && question.judgment ? (
                            <div className="judgment-content max-w-xs">
                              <p className="judgment-text">{question.judgment}</p>
                            </div>
                          ) : (
                            <span className="empty-text">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            {question.isAnswered ? (
                              <div className="status-icon-container">
                                <CheckCircleOutlined className="status-icon answered" />
                              </div>
                            ) : (
                              <div className="status-icon-container">
                                <ClockCircleOutlined className="status-icon waiting" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            {question.isAnswered ? (
                              <Tooltip title={`点击切换为：${currentHasIssue ? '不存在问题' : '存在问题'}`}>
                                <div
                                  className="issue-toggle-icon"
                                  onClick={() => toggleQuestionIssue(question)}
                                >
                                  {currentHasIssue ? (
                                    <CloseCircleOutlined className="status-icon issue" />
                                  ) : (
                                    <CheckCircleOutlined className="status-icon no-issue" />
                                  )}
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="issue-placeholder-icon">
                                <span className="empty-text">-</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultDetail;
