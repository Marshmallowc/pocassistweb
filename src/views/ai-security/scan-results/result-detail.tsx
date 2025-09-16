import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { ArrowLeftOutlined, DownloadOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { getScanResultDetail, ScanResultDetailResponse } from '../../../api/task';
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

  const toggleQuestionIssue = (questionId: string, originalHasIssue: boolean) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: prev[questionId] !== undefined ? !prev[questionId] : !originalHasIssue,
    }));
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
        <Button variant="primary">
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
                    <TableHead>任务模板</TableHead>
                    <TableHead>问题分类</TableHead>
                    <TableHead>问题</TableHead>
                    <TableHead>回答</TableHead>
                    <TableHead>研判结论</TableHead>
                    <TableHead className="w-24">是否回答</TableHead>
                    <TableHead className="w-24">是否存在问题</TableHead>
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
                          <p className="question-text max-w-md">{question.question}</p>
                        </TableCell>
                        <TableCell>
                          {question.isAnswered ? (
                            <div className="answer-content max-w-lg">
                              <p className="answer-text">{question.answer}</p>
                            </div>
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
                          <div className="flex items-center justify-center">
                            {question.isAnswered ? (
                              <CheckCircleOutlined className="status-icon answered" />
                            ) : (
                              <ClockCircleOutlined className="status-icon waiting" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {question.isAnswered ? (
                              <Button
                                variant="ghost"
                                size="small"
                                className="issue-toggle-btn"
                                onClick={() => toggleQuestionIssue(question.id, question.hasIssue)}
                              >
                                {currentHasIssue ? (
                                  <CloseCircleOutlined className="status-icon issue" />
                                ) : (
                                  <CheckCircleOutlined className="status-icon no-issue" />
                                )}
                              </Button>
                            ) : (
                              <span className="empty-text">-</span>
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
