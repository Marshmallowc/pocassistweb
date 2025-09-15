import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Button, Form, Input, Space, Table, Card } from "antd";
import { PlusOutlined, RobotOutlined } from "@ant-design/icons";
import "./index.less";

const TaskDispatch: React.FC<RouteComponentProps> = () => {
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
    { title: "任务ID", dataIndex: "id" },
    { title: "AI模型", dataIndex: "ai_model" },
    { title: "评估目标", dataIndex: "target" },
    { title: "评估类型", dataIndex: "assessment_type" },
    { title: "任务状态", dataIndex: "status" },
    { title: "创建时间", dataIndex: "created_at" },
    {
      title: "操作",
      render: (text: any, record: any) => {
        return (
          <Space>
            <Button type="link">查看详情</Button>
            <Button type="link">编辑</Button>
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
    <div className="task-dispatch-wrap">
      <Card 
        title={
          <span>
            <RobotOutlined style={{ marginRight: 8 }} />
            AI安全评估任务下发
          </span>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={form} layout="inline" onFinish={handleFinish}>
            <Form.Item label="关键字" name="search">
              <Input placeholder="请输入关键字" allowClear />
            </Form.Item>
            <Form.Item label="AI模型" name="ai_model">
              <Input placeholder="请输入AI模型" allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </Form>

          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              console.log('创建新的AI安全评估任务');
            }}
          >
            创建评估任务
          </Button>

          <Table
            className="task-dispatch-table"
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

export default TaskDispatch;
