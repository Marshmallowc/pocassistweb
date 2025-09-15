import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';
import { ArrowLeftOutlined, DownloadOutlined, AlertOutlined } from '@ant-design/icons';
import { Descriptions, Table, Timeline, Divider } from 'antd';
import './result-detail.less';

interface ResultDetailProps {
  taskId: string;
  onBack: () => void;
}

const ResultDetail: React.FC<ResultDetailProps> = ({ taskId, onBack }) => {
  // 模拟详细数据
  const taskDetail = {
    id: taskId,
    name: "电商平台AI推荐系统安全评估",
    type: "模型安全评估",
    status: "completed",
    progress: 100,
    createTime: "2024-01-15 10:30",
    completedTime: "2024-01-15 15:45",
    duration: "5小时15分钟",
    riskLevel: "medium",
    vulnerabilities: 12,
    score: 75,
    details: { high: 2, medium: 5, low: 5 },
    model: "推荐系统模型 v2.1",
    target: "用户行为预测模块",
    description: "对电商平台AI推荐系统进行全面的安全评估，包括模型鲁棒性、对抗攻击防护、数据隐私保护等方面。"
  };

  const vulnerabilityData = [
    {
      key: '1',
      id: 'VUL-001',
      name: '模型对抗攻击漏洞',
      level: 'high',
      category: '模型安全',
      description: '推荐模型容易受到对抗性样本攻击',
      suggestion: '增加对抗训练，提升模型鲁棒性'
    },
    {
      key: '2', 
      id: 'VUL-002',
      name: '用户隐私泄露风险',
      level: 'high',
      category: '数据隐私',
      description: '模型可能通过推荐结果泄露用户敏感信息',
      suggestion: '实施差分隐私保护机制'
    },
    {
      key: '3',
      id: 'VUL-003',
      name: '模型偏见问题',
      level: 'medium',
      category: '公平性',
      description: '推荐算法存在性别和年龄偏见',
      suggestion: '优化训练数据，增加公平性约束'
    },
    {
      key: '4',
      id: 'VUL-004',
      name: '输入验证不足',
      level: 'medium',
      category: '输入安全',
      description: '缺乏对输入数据的有效验证',
      suggestion: '增强输入验证和过滤机制'
    },
    {
      key: '5',
      id: 'VUL-005',
      name: '模型版本控制问题',
      level: 'low',
      category: '版本管理',
      description: '模型版本管理不规范',
      suggestion: '建立完善的模型版本控制流程'
    }
  ];

  const columns = [
    {
      title: '漏洞ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '漏洞名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const config = {
          high: { label: '高风险', variant: 'destructive' as const },
          medium: { label: '中风险', variant: 'default' as const },
          low: { label: '低风险', variant: 'secondary' as const },
        };
        const levelConfig = config[level as keyof typeof config];
        return <Badge variant={levelConfig.variant}>{levelConfig.label}</Badge>;
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '修复建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
    }
  ];

  const getRiskBadge = (level: string) => {
    const config = {
      high: { label: "高风险", variant: "destructive" as const },
      medium: { label: "中风险", variant: "default" as const },
      low: { label: "低风险", variant: "secondary" as const },
    };
    return config[level as keyof typeof config] || config.low;
  };

  const riskConfig = getRiskBadge(taskDetail.riskLevel);

  return (
    <div className="result-detail-wrap">
      <div className="detail-header">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} />
          返回列表
        </Button>
        <div className="header-actions">
          <Button variant="primary">
            <DownloadOutlined style={{ marginRight: 8 }} />
            下载报告
          </Button>
        </div>
      </div>

      <div className="detail-content">
        {/* 任务基本信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>任务基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="任务ID">{taskDetail.id}</Descriptions.Item>
              <Descriptions.Item label="任务名称">{taskDetail.name}</Descriptions.Item>
              <Descriptions.Item label="评估类型">{taskDetail.type}</Descriptions.Item>
              <Descriptions.Item label="目标模型">{taskDetail.model}</Descriptions.Item>
              <Descriptions.Item label="评估目标">{taskDetail.target}</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Badge variant={riskConfig.variant}>{riskConfig.label}</Badge>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{taskDetail.createTime}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{taskDetail.completedTime}</Descriptions.Item>
              <Descriptions.Item label="执行时长">{taskDetail.duration}</Descriptions.Item>
              <Descriptions.Item label="安全评分">
                <span className={`score ${taskDetail.score >= 80 ? 'score-high' : taskDetail.score >= 60 ? 'score-medium' : 'score-low'}`}>
                  {taskDetail.score}/100
                </span>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <p><strong>任务描述：</strong>{taskDetail.description}</p>
          </CardContent>
        </Card>

        {/* 评估结果概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总漏洞数</p>
                  <p className="text-2xl font-bold text-red-600">{taskDetail.vulnerabilities}</p>
                </div>
                <AlertOutlined className="text-2xl text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="risk-distribution">
                <p className="text-sm font-medium text-gray-600 mb-3">风险分布</p>
                <div className="risk-stats">
                  <div className="risk-item">
                    <span className="risk-label high">高风险</span>
                    <span className="risk-count">{taskDetail.details.high}</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label medium">中风险</span>
                    <span className="risk-count">{taskDetail.details.medium}</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label low">低风险</span>
                    <span className="risk-count">{taskDetail.details.low}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">安全评分</p>
                <p className={`text-2xl font-bold mb-3 ${taskDetail.score >= 80 ? 'text-green-600' : taskDetail.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {taskDetail.score}/100
                </p>
                <Progress value={taskDetail.score} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 漏洞详情 */}
        <Card>
          <CardHeader>
            <CardTitle>漏洞详情</CardTitle>
          </CardHeader>
          <CardContent>
            <Table 
              columns={columns}
              dataSource={vulnerabilityData}
              pagination={false}
              size="middle"
            />
          </CardContent>
        </Card>

        {/* 执行时间线 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>执行时间线</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline>
              <Timeline.Item color="blue">
                任务创建 - 2024-01-15 10:30
              </Timeline.Item>
              <Timeline.Item color="blue">
                开始模型加载 - 2024-01-15 10:35
              </Timeline.Item>
              <Timeline.Item color="blue">
                数据预处理完成 - 2024-01-15 11:20
              </Timeline.Item>
              <Timeline.Item color="blue">
                安全评估执行中 - 2024-01-15 11:25
              </Timeline.Item>
              <Timeline.Item color="red">
                发现高风险漏洞 - 2024-01-15 13:15
              </Timeline.Item>
              <Timeline.Item color="green">
                评估完成 - 2024-01-15 15:45
              </Timeline.Item>
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultDetail;
