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
  Divider
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { saveCustomTemplate, SaveCustomTemplateParams, getTaskTemplates, TaskTemplate } from "../../api/task";
import "./index.less";

const { Title, Text } = Typography;
const { TextArea } = Input;

// 使用API中定义的TaskTemplate接口
type TemplateItem = TaskTemplate;

const TemplateManagement: React.FC<RouteComponentProps> = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateItem | null>(null);
  
  // 新建模板相关状态
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [currentCustomCorpusFile, setCurrentCustomCorpusFile] = useState("");
  const [currentCustomCorpusFileName, setCurrentCustomCorpusFileName] = useState("");
  
  const customCorpusRef = useRef<HTMLInputElement>(null);

  // 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getTaskTemplates();
      if (response.success && response.data) {
        setTemplates(response.data.templates);
        console.log("✅ 获取模板列表成功:", response.data.templates);
      } else {
        message.error(response.message || "获取模板列表失败");
      }
    } catch (error) {
      console.error("获取模板列表失败:", error);
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

  // 组件加载时获取模板列表
  useEffect(() => {
    fetchTemplates();
  }, []);

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
      width: 350,
      ellipsis: true,
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          // 验证JSON格式
          JSON.parse(content);
          setCurrentCustomCorpusFile(content);
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
  "model_type": "请选择模型类型",
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
    if (!templateDescription.trim()) {
      message.error("请输入模板描述");
      return;
    }
    if (!currentCustomCorpusFileName) {
      message.error("请上传测试语料文件");
      return;
    }

    try {
      // 发送网络请求保存自定义模板到后端
      const templateData: SaveCustomTemplateParams = {
        name: customTemplateName.trim(),
        corpusContent: currentCustomCorpusFile,
        corpusFileName: currentCustomCorpusFileName,
      };

      const response = await saveCustomTemplate(templateData) as any;
      
      if (response.success || response.data?.success) {
        // 保存成功，重新获取模板列表
        const templateName = response.data?.templateName || customTemplateName.trim();
        message.success(`自定义模板"${templateName}"创建成功`);
        console.log("✅ 自定义模板保存成功:", response);
        
        // 重新获取模板列表以显示最新数据
        await fetchTemplates();
      } else {
        message.error(response.message || response.data?.message || "创建自定义模板失败");
      }
    } catch (error) {
      console.error("创建自定义模板失败:", error);
      const err = error as any;
      let errorMessage = "创建自定义模板失败";
      if (err?.response?.data?.message) {
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
    setTemplateDescription("");
    setCurrentCustomCorpusFile("");
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
    setTemplateDescription(record.description);
    setCurrentCustomCorpusFileName(record.corpusFileName || "");
    setCurrentCustomCorpusFile(record.corpusContent || "");
    setIsEditModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!customTemplateName.trim()) {
      message.error("请输入模板名称");
      return;
    }
    if (!templateDescription.trim()) {
      message.error("请输入模板描述");
      return;
    }

    if (currentTemplate) {
      setTemplates(prev => 
        prev.map(item => 
          item.id === currentTemplate.id 
            ? {
                ...item,
                name: customTemplateName.trim(),
                description: templateDescription.trim(),
                corpusFileName: currentCustomCorpusFileName,
                corpusContent: currentCustomCorpusFile
              }
            : item
        )
      );
      message.success("模板编辑成功");
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
      onOk() {
        setTemplates(prev => prev.filter(item => item.id !== record.id));
        message.success("模板删除成功");
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
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
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

          <div className="dialog-section" style={{ marginTop: 16 }}>
            <Text strong>模板描述 <span style={{ color: '#ff4d4f' }}>*</span></Text>
            <TextArea
              placeholder="请输入模板描述信息"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={3}
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
                    setCurrentCustomCorpusFile("");
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
        width={500}
      >
        {currentTemplate && (
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
              <Text strong>创建时间：</Text>
              <Text>{currentTemplate.createTime}</Text>
            </div>
            {currentTemplate.corpusFileName && (
              <div className="detail-item">
                <Text strong>语料文件：</Text>
                <Text>{currentTemplate.corpusFileName}</Text>
              </div>
            )}
          </div>
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

          <div className="dialog-section" style={{ marginTop: 16 }}>
            <Text strong>模板描述 <span style={{ color: '#ff4d4f' }}>*</span></Text>
            <TextArea
              placeholder="请输入模板描述信息"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={3}
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
                    setCurrentCustomCorpusFile("");
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
