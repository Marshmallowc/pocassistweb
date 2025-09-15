import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Button, Form, Input, Space, Table, Card, Tag, Select } from "antd";
import { SafetyOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "./index.less";

const ScanResults: React.FC<RouteComponentProps> = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  const columns = [
    { 
      title: "序号",
      dataIndex: "order",
      width: '8%',
      render: (text: any, record: any, index: any) => index + 1
    },
    { title: "结果ID", dataIndex: "id" },
    { title: "任务ID", dataIndex: "task_id" },
    { title: "AI模型", dataIndex: "ai_model" },
    { title: "评估目标", dataIndex: "target" },
    { 
      title: "风险等级", 
      dataIndex: "risk_level",
      render: (level: string) => {
        const colors = {
          'high': 'red',
          'medium': 'orange', 
          'low': 'green',
          'info': 'blue'
        };
        return <Tag color={colors[level as keyof typeof colors]}>{level?.toUpperCase()}</Tag>;
      }
    },
    { 
      title: "发现问题", 
      dataIndex: "issues_found",
      render: (count: number) => count > 0 ? 
        <Tag color="volcano">{count} 个问题</Tag> : 
        <Tag color="green">无问题</Tag>
    },
    { title: "扫描时间", dataIndex: "scan_time" },
    {
      title: "操作",
      render: (text: any, record: any) => {
        return (
          <Space>
            <Button type="link">查看报告</Button>
            <Button type="link">下载结果</Button>
            <Button type="link" danger>删除</Button>
          </Space>
        );
      }
    }
  ];

  const handleFinish = (values: any) => {
    console.log('搜索条件:', values);
  };

  return (
    <div className="scan-results-wrap">
      <Card 
        title={
          <span>
            <SafetyOutlined style={{ marginRight: 8 }} />
            AI安全评估扫描结果
          </span>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={form} layout="inline" onFinish={handleFinish}>
            <Form.Item label="关键字" name="search">
              <Input placeholder="请输入关键字" allowClear />
            </Form.Item>
            <Form.Item label="任务ID" name="task_id">
              <Input placeholder="请输入任务ID" allowClear />
            </Form.Item>
            <Form.Item label="风险等级" name="risk_level">
              <Select allowClear style={{ width: 120 }} placeholder="选择等级">
                <Select.Option value="high">高风险</Select.Option>
                <Select.Option value="medium">中风险</Select.Option>
                <Select.Option value="low">低风险</Select.Option>
                <Select.Option value="info">信息</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </Form>

          <Table
            className="scan-results-table"
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              current: 1,
              pageSize: 10,
              total: total,
              showTotal: (total: number) => `共${total}条`,
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ScanResults;
