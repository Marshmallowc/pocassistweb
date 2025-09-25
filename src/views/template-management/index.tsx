import React, { useState, useRef, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { 
  Button, 
  Table, 
  Space, 
  Modal, 
  message,
  Card,
  Typography,
  Input,
  Upload,
  Form,
  Divider,
  Tabs
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CloseOutlined,
  CopyOutlined
} from "@ant-design/icons";
import { saveCustomTemplate, SaveCustomTemplateParams, getTaskTemplates, TaskTemplate, editTemplate, EditTemplateParams, deleteTemplate } from "../../api/task";
import "./index.less";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 使用API中定义的TaskTemplate接口
type TemplateItem = TaskTemplate;

const TemplateManagement: React.FC<RouteComponentProps> = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 分页状态管理
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateItem | null>(null);
  
  // 新建模板相关状态
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [currentCustomCorpusFile, setCurrentCustomCorpusFile] = useState<File | null>(null);
  const [currentCustomCorpusFileName, setCurrentCustomCorpusFileName] = useState("");
  
  const customCorpusRef = useRef<HTMLInputElement>(null);

  // 分页回调函数
  const handlePageChange = (page: number, pageSize: number | undefined) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  // 获取模板列表
  const fetchTemplates = async (page: number = pagination.current, pageSize: number = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await getTaskTemplates({ page, pageSize });
      if (response.code === 1 && response.data) {
        setTemplates(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total_count
        }));
      } else {
        message.error(response.message || "获取模板列表失败");
      }
    } catch (error) {
      const err = error as any;
      let errorMessage = "获取模板列表失败";
      if (err?.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err?.message) {
        errorMessage += `: ${err.message}`;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 分页参数变化时重新获取数据
  useEffect(() => {
    fetchTemplates(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  // 表格列定义
  const columns = [
    {
      title: "序号",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "模板描述信息",
      dataIndex: "description", 
      key: "description",
      width: 300,
      ellipsis: true,
    },
    {
      title: "总数",
      dataIndex: "count",
      key: "count",
      width: 120,
      align: 'center' as const,
      render: (count: number | undefined) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {count !== undefined ? count : '-'}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: any, record: TemplateItem) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 自定义语料上传处理
  const handleCustomCorpusUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      // 验证JSON格式但不读取全部内容
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          // 验证JSON格式
          JSON.parse(content);
          // 验证通过后保存File对象而非内容
          setCurrentCustomCorpusFile(file);
          setCurrentCustomCorpusFileName(file.name);
        } catch (error) {
          message.error("JSON文件格式不正确，请检查文件内容");
        }
      };
      reader.readAsText(file);
    } else {
      message.error("请选择json格式的文件");
    }
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    const templateContent = `{
  "task_name": "自定义任务模板",
  "target_url": "https://example.com/api",
  "test_cases": [
    {
      "input": "测试输入1",
      "expected_output": "期望输出1"
    },
    {
      "input": "测试输入2", 
      "expected_output": "期望输出2"
    }
  ]
}`;

    const blob = new Blob([templateContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_task_template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("模板已下载");
  };

  // 新建自定义模板
  const handleCreateTemplate = async () => {
    if (!customTemplateName.trim()) {
      message.error("请输入模板名称");
      return;
    }
    if (!currentCustomCorpusFile) {
      message.error("请上传测试语料文件");
      return;
    }

    try {
      // 发送网络请求保存自定义模板到后端
      const templateData: SaveCustomTemplateParams = {
        name: customTemplateName.trim(),
        description: "自定义模板",
        corpusFile: currentCustomCorpusFile,
        corpusFileName: currentCustomCorpusFileName,
      };

      const response = await saveCustomTemplate(templateData) as any;
      
      if (response.success || response.data?.success) {
        // 保存成功，重新获取模板列表
        const templateName = response.data?.templateName || customTemplateName.trim();
        message.success(`自定义模板"${templateName}"创建成功`);
        
        // 重新获取模板列表以显示最新数据
        await fetchTemplates(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || response.data?.message || "创建自定义模板失败");
      }
    } catch (error) {
      const err = error as any;
      let errorMessage = "创建自定义模板失败";
      
      // 处理来自响应拦截器的code: 0错误（直接是响应体）
      if (err?.code === 0) {
        errorMessage = err?.msg || err?.message || "创建自定义模板失败";
      } else if (err?.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err?.message) {
        errorMessage += `: ${err.message}`;
      }
      
      message.error(errorMessage);
    }
    
    // 重置表单
    resetCreateForm();
    setIsCreateModalOpen(false);
  };

  // 重置创建表单
  const resetCreateForm = () => {
    setCustomTemplateName("");
    setCurrentCustomCorpusFile(null);
    setCurrentCustomCorpusFileName("");
    if (customCorpusRef.current) customCorpusRef.current.value = "";
  };

  // 查看模板
  const handleView = (record: TemplateItem) => {
    setCurrentTemplate(record);
    setIsViewModalOpen(true);
  };

  // 编辑模板
  const handleEdit = (record: TemplateItem) => {
    setCurrentTemplate(record);
    setCustomTemplateName(record.name);
    setCurrentCustomCorpusFileName(record.corpusFileName || "");
    setCurrentCustomCorpusFile(null); // 编辑时不预填充文件对象
    setIsEditModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!customTemplateName.trim()) {
      message.error("请输入模板名称");
      return;
    }

    if (!currentTemplate) {
      message.error("未找到要编辑的模板");
      return;
    }

    try {
      // 发送网络请求编辑模板
      const editData: EditTemplateParams = {
        templateId: currentTemplate.id,
        name: customTemplateName.trim(),
        description: "自定义模板",
        corpusFile: currentCustomCorpusFile || undefined, // 如果有上传新文件就传File对象
        corpusFileName: currentCustomCorpusFileName || currentTemplate.corpusFileName,
      };

      const response = await editTemplate(editData) as any;
      
      if (response.success || response.data?.success) {
        message.success("模板编辑成功");
        
        // 重新获取模板列表以显示最新数据
        await fetchTemplates(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || response.data?.message || "编辑模板失败");
      }
    } catch (error) {
      const err = error as any;
      let errorMessage = "编辑模板失败";
      if (err?.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err?.message) {
        errorMessage += `: ${err.message}`;
      }
      message.error(errorMessage);
    }

    resetCreateForm();
    setIsEditModalOpen(false);
    setCurrentTemplate(null);
  };

  // 删除模板
  const handleDelete = (record: TemplateItem) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除模板"${record.name}"吗？此操作不可恢复。`,
      okText: "删除",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        try {
          // 发送网络请求删除模板
          const response = await deleteTemplate(record.id) as any;
          
          if (response.success || response.data?.success) {
            message.success("模板删除成功");
            
            // 重新获取模板列表以显示最新数据
            await fetchTemplates(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || response.data?.message || "删除模板失败");
          }
        } catch (error) {
          const err = error as any;
          let errorMessage = "删除模板失败";
          if (err?.response?.data?.message) {
            errorMessage += `: ${err.response.data.message}`;
          } else if (err?.message) {
            errorMessage += `: ${err.message}`;
          }
          message.error(errorMessage);
        }
      },
    });
  };

  return (
    <div className="template-management-wrap">
      <Card>
        <div className="page-header">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            新建自定义模板
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: handlePageChange,
          }}
        />
      </Card>

      {/* 新建自定义模板对话框 */}
      <Modal
        title="新建自定义模板"
        visible={isCreateModalOpen}
        onCancel={() => {
          resetCreateForm();
          setIsCreateModalOpen(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(false);
          }}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleCreateTemplate}
          >
            创建模板
          </Button>
        ]}
        width={600}
      >
        <div className="custom-dialog-content">
          <div className="dialog-section">
            <Text strong>模板名称 <span style={{ color: '#ff4d4f' }}>*</span></Text>
            <Input
              placeholder="请输入自定义模板名称"
              value={customTemplateName}
              onChange={(e) => setCustomTemplateName(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>

          <Divider />

          <div className="dialog-section">
            <Text strong>功能1：下载模板</Text>
            <Button 
              block 
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              style={{ marginTop: 8 }}
            >
              下载任务模板
            </Button>
          </div>

          <Divider />

          <div className="dialog-section">
            <Text strong>功能2：上传自定义测试语料 <span style={{ color: '#ff4d4f' }}>*</span></Text>
            
            {/* 当前选择的文件 */}
            {currentCustomCorpusFileName && (
              <div className="file-info" style={{ marginTop: 8 }}>
                <FileTextOutlined />
                <span title={currentCustomCorpusFileName}>{currentCustomCorpusFileName}</span>
                <Button 
                  type="text" 
                  size="small" 
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setCurrentCustomCorpusFile(null);
                    setCurrentCustomCorpusFileName("");
                    if (customCorpusRef.current) customCorpusRef.current.value = "";
                  }}
                  title="取消选择此文件"
                />
              </div>
            )}
            
            <div className="upload-area" style={{ marginTop: 8 }}>
              <input
                ref={customCorpusRef}
                type="file"
                accept=".json"
                onChange={handleCustomCorpusUpload}
                style={{ display: "none" }}
              />
              <div className="upload-content">
                <UploadOutlined className="upload-icon" />
                <Text>上传测试语料文件</Text>
                <Button 
                  type="dashed" 
                  size="small" 
                  onClick={() => customCorpusRef.current?.click()}
                >
                  选择json文件
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 查看模板对话框 */}
      <Modal
        title="查看模板详情"
        visible={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {currentTemplate && (
          <Tabs defaultActiveKey="basic" type="card">
            <TabPane tab="基本信息" key="basic">
              <div className="template-detail">
                <div className="detail-item">
                  <Text strong>模板名称：</Text>
                  <Text>{currentTemplate.name}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>模板描述：</Text>
                  <Text>{currentTemplate.description}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>模板类型：</Text>
                  <Text>{currentTemplate.type === 'builtin' ? '内置模板' : '自定义模板'}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>创建时间：</Text>
                  <Text>{currentTemplate.createTime || '-'}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>总数：</Text>
                  <Text style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {currentTemplate.count !== undefined ? currentTemplate.count : '-'}
                  </Text>
                </div>
                {currentTemplate.corpusFileName && (
                  <div className="detail-item">
                    <Text strong>语料文件：</Text>
                    <Text>{currentTemplate.corpusFileName}</Text>
                  </div>
                )}
              </div>
            </TabPane>
            
            {/* JSON内容标签页 */}
            <TabPane tab="JSON内容" key="json">
              <div className="json-content-section">
                {currentTemplate.corpusContent ? (
                  <>
                    <div className="json-header">
                      <Text strong>模板JSON内容：</Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(currentTemplate.corpusContent!);
                          message.success('JSON内容已复制到剪贴板');
                        }}
                      >
                        复制内容
                      </Button>
                    </div>
                    <div className="json-viewer">
                      <pre className="json-content">
                        {(() => {
                          try {
                            // 尝试解析JSON
                            const parsed = JSON.parse(currentTemplate.corpusContent);
                            return JSON.stringify(parsed, null, 2);
                          } catch (error) {
                            // 如果不是有效JSON，直接显示原内容
                            return currentTemplate.corpusContent;
                          }
                        })()}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="no-json-content">
                    <Text type="secondary">
                      {currentTemplate.type === 'builtin' 
                        ? '内置模板的JSON内容由系统管理，无法查看' 
                        : '该模板暂无JSON内容'}
                    </Text>
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 编辑模板对话框 */}
      <Modal
        title="编辑模板"
        visible={isEditModalOpen}
        onCancel={() => {
          resetCreateForm();
          setIsEditModalOpen(false);
          setCurrentTemplate(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            resetCreateForm();
            setIsEditModalOpen(false);
            setCurrentTemplate(null);
          }}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleSaveEdit}
          >
            保存修改
          </Button>
        ]}
        width={600}
      >
        <div className="custom-dialog-content">
          <div className="dialog-section">
            <Text strong>模板名称 <span style={{ color: '#ff4d4f' }}>*</span></Text>
            <Input
              placeholder="请输入自定义模板名称"
              value={customTemplateName}
              onChange={(e) => setCustomTemplateName(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>

          <Divider />

          <div className="dialog-section">
            <Text strong>更新测试语料文件</Text>
            
            {/* 当前选择的文件 */}
            {currentCustomCorpusFileName && (
              <div className="file-info" style={{ marginTop: 8 }}>
                <FileTextOutlined />
                <span title={currentCustomCorpusFileName}>{currentCustomCorpusFileName}</span>
                <Button 
                  type="text" 
                  size="small" 
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setCurrentCustomCorpusFile(null);
                    setCurrentCustomCorpusFileName("");
                    if (customCorpusRef.current) customCorpusRef.current.value = "";
                  }}
                  title="取消选择此文件"
                />
              </div>
            )}
            
            <div className="upload-area" style={{ marginTop: 8 }}>
              <input
                ref={customCorpusRef}
                type="file"
                accept=".json"
                onChange={handleCustomCorpusUpload}
                style={{ display: "none" }}
              />
              <div className="upload-content">
                <UploadOutlined className="upload-icon" />
                <Text>上传新的测试语料文件</Text>
                <Button 
                  type="dashed" 
                  size="small" 
                  onClick={() => customCorpusRef.current?.click()}
                >
                  选择json文件
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateManagement;
