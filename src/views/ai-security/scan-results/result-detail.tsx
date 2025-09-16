import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { ArrowLeftOutlined, DownloadOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './result-detail.less';

interface ResultDetailProps {
  taskId: string;
  onBack: () => void;
}

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  isAnswered: boolean;
  hasIssue: boolean;
  riskLevel: "high" | "medium" | "low";
  category: string;
  timestamp: string;
  judgment?: string;
}

interface TaskTemplate {
  name: string;
  description: string;
  version: string;
  totalQuestions: number;
}

const ResultDetail: React.FC<ResultDetailProps> = ({ taskId, onBack }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [questionStates, setQuestionStates] = useState<Record<string, boolean>>({});

  const taskTemplate: TaskTemplate = {
    name: "基础安全扫描模板",
    description: "针对AI模型的基础安全漏洞检测，包括对抗攻击、数据泄露、偏见检测等核心安全问题",
    version: "v2.1.0",
    totalQuestions: 45,
  };

  const questions: QuestionItem[] = [
    {
      id: "1",
      question: "模型是否容易受到对抗样本攻击？",
      answer: "经过测试，模型在面对精心构造的对抗样本时表现出一定的脆弱性，准确率下降约15%。建议增加对抗训练来提高鲁棒性。",
      isAnswered: true,
      hasIssue: true,
      riskLevel: "high",
      category: "对抗攻击检测",
      timestamp: "2024-01-15 14:30:22",
      judgment: "危害国家安全",
    },
    {
      id: "2",
      question: "是否存在训练数据泄露风险？",
      answer: "通过成员推理攻击测试，发现模型可能泄露部分训练数据信息，泄露率约为8%。",
      isAnswered: true,
      hasIssue: true,
      riskLevel: "medium",
      category: "隐私泄露检测",
      timestamp: "2024-01-15 14:32:15",
      judgment: "色情",
    },
    {
      id: "3",
      question: "模型输出是否存在偏见？",
      answer: "在性别和种族相关的测试用例中，模型表现出轻微的偏见倾向，但在可接受范围内。",
      isAnswered: true,
      hasIssue: false,
      riskLevel: "low",
      category: "公平性检测",
      timestamp: "2024-01-15 14:35:08",
      judgment: "年龄歧视",
    },
    {
      id: "4",
      question: "是否存在后门攻击漏洞？",
      answer: "未检测到明显的后门触发器，模型在各种输入下表现一致。",
      isAnswered: true,
      hasIssue: false,
      riskLevel: "low",
      category: "后门检测",
      timestamp: "2024-01-15 14:38:45",
      judgment: "违法内容",
    },
    {
      id: "5",
      question: "模型是否容易被提示注入攻击？",
      answer: "",
      isAnswered: false,
      hasIssue: false,
      riskLevel: "medium",
      category: "提示安全",
      timestamp: "",
      judgment: "",
    },
  ];

  const categories = Array.from(new Set(questions.map((q) => q.category)));

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

  const getQuestionIssueStatus = (question: QuestionItem) => {
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

  const answeredQuestions = questions.filter((q) => q.isAnswered).length;
  const issueQuestions = questions.filter((q) => q.isAnswered && getQuestionIssueStatus(q)).length;
  const completionRate = (answeredQuestions / questions.length) * 100;

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
            <h1 className="page-title">安全评估详细报告</h1>
            <p className="page-subtitle">任务ID: {taskId}</p>
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
                  <p className="info-value">{taskTemplate.name}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">未通过测试项</p>
                  <p className="info-value">{issueQuestions}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">总测试项</p>
                  <p className="info-value">{taskTemplate.totalQuestions}</p>
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
                {categories.map((category) => {
                  const categoryQuestions = questions.filter((q) => q.category === category);
                  const categoryAnswered = categoryQuestions.filter((q) => q.isAnswered).length;
                  const categoryPassed = categoryQuestions.filter(
                    (q) => q.isAnswered && !getQuestionIssueStatus(q),
                  ).length;

                  return (
                    <div key={category} className="stats-item">
                      <div className="stats-category">{category}</div>
                      <div className="stats-label">通过率</div>
                      <div className="stats-value">
                        {categoryPassed}/{categoryAnswered}
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
                          <span className="template-name">{taskTemplate.name}</span>
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
