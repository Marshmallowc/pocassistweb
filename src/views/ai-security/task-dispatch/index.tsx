import React, { useState, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { 
  Button, 
  Form, 
  Input, 
  Space, 
  Card, 
  Select, 
  Upload, 
  Modal, 
  message,
  Row,
  Col,
  Divider,
  Typography,
  Tag,
  Spin
} from "antd";
import { 
  PlusOutlined, 
  UploadOutlined, 
  DownloadOutlined,
  FileTextOutlined,
  CloseOutlined,
  CheckOutlined,
  WifiOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { dispatchTask, TaskDispatchParams } from "../../../api/task";
import "./index.less";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TaskDispatch: React.FC<RouteComponentProps> = () => {
  const [form] = Form.useForm();
  
  // 文件上传相关状态
  const [requestContent, setRequestContent] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [requestFileName, setRequestFileName] = useState("");
  const [responseFileName, setResponseFileName] = useState("");
  
  // 模板选择相关状态
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customCorpusFiles, setCustomCorpusFiles] = useState<string[]>([]);
  const [customCorpusFileNames, setCustomCorpusFileNames] = useState<string[]>([]);
  const [currentCustomCorpusFile, setCurrentCustomCorpusFile] = useState("");
  const [currentCustomCorpusFileName, setCurrentCustomCorpusFileName] = useState("");
  
  // API配置相关状态
  const [apiFormatType, setApiFormatType] = useState<"builtin" | "custom" | "">("");
  const [selectedBuiltinFormat, setSelectedBuiltinFormat] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<"success" | "failed" | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const requestFileRef = useRef<HTMLInputElement>(null);
  const responseFileRef = useRef<HTMLInputElement>(null);
  const customCorpusRef = useRef<HTMLInputElement>(null);

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "request" | "response") => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (type === "request") {
          setRequestContent(content);
          setRequestFileName(file.name);
        } else {
          setResponseContent(content);
          setResponseFileName(file.name);
        }
      };
      reader.readAsText(file);
    } else {
      message.error("请选择txt格式的文件");
    }
  };

  // 清除文件
  const clearFile = (type: "request" | "response") => {
    if (type === "request") {
      setRequestContent("");
      setRequestFileName("");
      if (requestFileRef.current) requestFileRef.current.value = "";
    } else {
      setResponseContent("");
      setResponseFileName("");
      if (responseFileRef.current) responseFileRef.current.value = "";
    }
  };

  // 模板选择处理
  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplates((prev) => {
      if (prev.includes(templateName)) {
        return prev.filter((t) => t !== templateName);
      } else {
        return [...prev, templateName];
      }
    });
  };

  // 自定义语料上传
  const handleCustomCorpusUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCurrentCustomCorpusFile(content);
        setCurrentCustomCorpusFileName(file.name);
      };
      reader.readAsText(file);
    } else {
      message.error("请选择txt格式的文件");
    }
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    const templateContent = `{
  "task_name": "自定义任务模板",
  "description": "请填写任务描述",
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

  // API测试
  const handleApiTest = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const success = Math.random() > 0.3;
      setApiTestResult(success ? "success" : "failed");
      message[success ? "success" : "error"](
        success ? "API连接测试成功" : "API连接测试失败"
      );
    } catch (error) {
      setApiTestResult("failed");
      message.error("API连接测试失败");
    } finally {
      setIsTestingApi(false);
    }
  };

  // 提交任务
  const handleSubmitTask = async () => {
    // 验证必填项
    const errors = [];
    
    // 验证API格式配置
    if (!apiFormatType) {
      errors.push("请选择API格式类型");
    } else if (apiFormatType === "builtin") {
      if (!selectedBuiltinFormat) {
        errors.push("请选择具体的API格式");
      } else if (!apiKey.trim()) {
        errors.push("请输入API密钥");
      }
    } else if (apiFormatType === "custom") {
      if (!requestContent.trim()) {
        errors.push("请输入或上传请求格式");
      }
      if (!responseContent.trim()) {
        errors.push("请输入或上传响应格式");
      }
    }
    
    // 验证模板选择
    if (selectedTemplates.length === 0) {
      errors.push("请至少选择一个测试模板");
    }
    
    if (errors.length > 0) {
      message.error(errors[0]); // 显示第一个错误
      return;
    }
    
    try {
      // 验证表单字段
      const values = await form.validateFields();
      
      // 设置提交状态
      setIsSubmittingTask(true);
      
      // 构建请求参数
      const taskParams: TaskDispatchParams = {
        taskName: values.taskName,
        targetUrl: values.targetUrl,
        description: values.description,
        modelType: values.modelType, // 添加模型类型字段
        apiConfig: {
          type: apiFormatType as "builtin" | "custom", // 类型断言，因为已经通过验证
          format: apiFormatType === "builtin" ? selectedBuiltinFormat : undefined,
          apiKey: apiFormatType === "builtin" ? apiKey : undefined,
          customHeaders,
          requestContent: apiFormatType === "custom" ? requestContent : undefined,
          responseContent: apiFormatType === "custom" ? responseContent : undefined,
        },
        selectedTemplates,
        customCorpusFile: customCorpusFiles.length > 0 ? customCorpusFiles : undefined
      };
      
      // 发送任务下发请求
      const response = await dispatchTask(taskParams);
      
      // 成功处理
      if (response?.data?.taskId) {
        message.success(`任务下发成功！任务ID: ${response.data.taskId}`);
        console.log("✅ 任务下发成功:", response);
        
        // 显示详细的成功信息
        Modal.success({
          title: '任务创建成功',
          content: (
            <div>
              <p><strong>任务ID:</strong> {response.data.taskId}</p>
              <p><strong>任务名称:</strong> {response.data.taskName}</p>
              <p><strong>目标URL:</strong> {response.data.targetUrl}</p>
              <p><strong>预估时长:</strong> {Math.floor(response.data.estimatedDuration / 60)}分{response.data.estimatedDuration % 60}秒</p>
              <p><strong>模板数量:</strong> {response.data.templateCount}个</p>
              {response.data.customFileCount > 0 && (
                <p><strong>自定义文件:</strong> {response.data.customFileCount}个</p>
              )}
            </div>
          ),
          width: 500,
        });
      } else {
        message.success("任务下发成功！");
        console.log("✅ 任务下发响应:", response);
      }
      
      // 可选：重置表单或跳转页面
      // form.resetFields();
      // history.push('/task'); // 跳转到任务列表页面
      
    } catch (error) {
      console.error("任务下发失败:", error);
      
      // 根据错误类型显示不同的错误信息
      let errorMessage = "任务下发失败，请检查配置后重试";
      
      // 类型断言处理错误对象
      const err = error as any;
      if (err?.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = `网络错误: ${err.message}`;
      }
      
      message.error(errorMessage);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  return (
    <div className="task-dispatch-wrap">
      {/* Mock状态指示器 */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 1000,
        background: '#722ed1',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        🔧 Mock模式
      </div>
      <div className="task-sections">
        {/* 基本信息 */}
        <Card className="section-card">
          <Title level={3}>
            基本信息
          </Title>
          
          <Form form={form} layout="vertical">
            <Form.Item
              label="任务名称"
              name="taskName"
              rules={[{ required: true, message: "请输入任务名称" }]}
            >
              <Input 
                placeholder="请输入任务名称" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="任务描述"
              name="description"
              rules={[{ required: true, message: "请输入任务描述" }]}
            >
              <TextArea
                placeholder="请输入任务描述"
                rows={3}
                className="form-textarea"
              />
            </Form.Item>
          </Form>
        </Card>

        {/* 目标配置 */}
        <Card className="section-card">
          <Title level={3}>
            目标配置
          </Title>
          
          <Form form={form} layout="vertical">
            <Form.Item
              label="目标URL"
              name="targetUrl"
              rules={[
                { required: true, message: "请输入目标URL" },
                { type: "url", message: "请输入有效的URL" }
              ]}
            >
              <Input 
                placeholder="https://example.com/api" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="模型类型"
              name="modelType"
              rules={[{ required: true, message: "请选择模型类型" }]}
            >
              <Select
                placeholder="选择模型类型"
                size="large"
                className="form-select"
              >
                <Option value="qwen">Qwen</Option>
                <Option value="deepseek">Deepseek</Option>
                <Option value="gpt">ChatGPT</Option>
                <Option value="other">其他-未知</Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>

         {/* API格式配置 */}
         <Card className="section-card">
           <Title level={3}>
             API格式配置
           </Title>

           <div className="api-format-section">
             <Text strong>
               API格式类型 <span style={{ color: '#ff4d4f' }}>*</span>
             </Text>
             <Select
              value={apiFormatType === "custom" ? "custom" : (apiFormatType === "builtin" ? selectedBuiltinFormat : undefined)}
               onChange={(value) => {
                 if (value === "custom") {
                   setApiFormatType("custom");
                   setSelectedBuiltinFormat("");
                 } else {
                   setApiFormatType("builtin");
                   setSelectedBuiltinFormat(value);
                 }
               }}
              placeholder="选择API格式类型"
              size="large"
              className="format-select"
              style={{ width: "100%", marginTop: 8 }}
            >
              <Option value="dify">Dify</Option>
              <Option value="openai">OpenAI</Option>
              <Option value="claude">Claude</Option>
              <Option value="gemini">Gemini</Option>
              <Option value="qwen">通义千问</Option>
              <Option value="deepseek">DeepSeek</Option>
              <Option value="custom">自定义API格式</Option>
            </Select>
          </div>

          {/* 内置API格式配置 */}
          {apiFormatType === "builtin" && selectedBuiltinFormat && (
               <div className="builtin-config">
                 <div className="config-item">
                   <Text strong>
                     API_KEY <span style={{ color: '#ff4d4f' }}>*</span>
                   </Text>
                   <Input.Password
                  placeholder="请输入API密钥"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  size="large"
                  className="form-input"
                  style={{ marginTop: 8 }}
                />
              </div>

              <div className="config-item">
                <Text strong>自定义Header</Text>
                <TextArea
                  placeholder={`请输入自定义请求头，格式如：
Authorization: Bearer your-token
Content-Type: application/json
X-Custom-Header: value`}
                  rows={4}
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  className="header-textarea"
                  style={{ marginTop: 8 }}
                />
              </div>
            </div>
          )}

          {/* 自定义API格式配置 */}
          {apiFormatType === "custom" && (
            <Row gutter={16} className="custom-format-section">
              <Col span={12}>
                   <div className="format-upload-section">
                     <div className="section-header">
                       <Text strong>
                         请求格式 <span style={{ color: '#ff4d4f' }}>*</span>
                       </Text>
                    {requestFileName && (
                      <div className="file-info">
                        <FileTextOutlined />
                        <span>{requestFileName}</span>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<CloseOutlined />}
                          onClick={() => clearFile("request")}
                        />
                      </div>
                    )}
                  </div>
                  
                  <TextArea
                    placeholder={`请输入API请求格式，例如：
{
  "model": "gpt-4",
  "messages": [...]
}`}
                    rows={8}
                    value={requestContent}
                    onChange={(e) => setRequestContent(e.target.value)}
                    className="format-textarea"
                  />

                  <div className="upload-area">
                    <input
                      ref={requestFileRef}
                      type="file"
                      accept=".txt"
                      onChange={(e) => handleFileUpload(e, "request")}
                      style={{ display: "none" }}
                    />
                    <div className="upload-content">
                      <UploadOutlined className="upload-icon" />
                      <Text>上传请求格式文件</Text>
                      <Button 
                        type="dashed" 
                        size="small" 
                        onClick={() => requestFileRef.current?.click()}
                      >
                        选择txt文件
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                   <div className="format-upload-section">
                     <div className="section-header">
                       <Text strong>
                         响应格式 <span style={{ color: '#ff4d4f' }}>*</span>
                       </Text>
                    {responseFileName && (
                      <div className="file-info">
                        <FileTextOutlined />
                        <span>{responseFileName}</span>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<CloseOutlined />}
                          onClick={() => clearFile("response")}
                        />
                      </div>
                    )}
                  </div>
                  
                  <TextArea
                    placeholder={`请输入API响应格式，例如：
{
  "choices": [{
    "message": {...}
  }]
}`}
                    rows={8}
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    className="format-textarea"
                  />

                  <div className="upload-area">
                    <input
                      ref={responseFileRef}
                      type="file"
                      accept=".txt"
                      onChange={(e) => handleFileUpload(e, "response")}
                      style={{ display: "none" }}
                    />
                    <div className="upload-content">
                      <UploadOutlined className="upload-icon" />
                      <Text>上传响应格式文件</Text>
                      <Button 
                        type="dashed" 
                        size="small" 
                        onClick={() => responseFileRef.current?.click()}
                      >
                        选择txt文件
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* API测试 */}
          <Divider />
          <div className="api-test-section">
            <Space>
               <Button
                 type="default"
                 onClick={handleApiTest}
                 disabled={isTestingApi || !apiFormatType || (apiFormatType === "builtin" && (!selectedBuiltinFormat || !apiKey.trim())) || (apiFormatType === "custom" && (!requestContent.trim() || !responseContent.trim()))}
                 icon={isTestingApi ? <Spin size="small" /> : <WifiOutlined />}
               >
                {isTestingApi ? "测试中..." : "一键测试API请求联通性"}
              </Button>

              {apiTestResult && (
                <Tag color={apiTestResult === "success" ? "green" : "red"}>
                  {apiTestResult === "success" ? (
                    <>
                      <CheckOutlined /> API连接成功
                    </>
                  ) : (
                    <>
                      <CloseOutlined /> API连接失败
                    </>
                  )}
                </Tag>
              )}
            </Space>
          </div>
        </Card>

         {/* 快速任务模板 */}
         <Card className="section-card template-card">
           <Title level={3}>
             快速任务模板 <span style={{ color: '#ff4d4f' }}>*</span>
           </Title>
           <Paragraph type="secondary">
             选择预设的任务模板快速创建（支持多选）
           </Paragraph>

          <Row gutter={[16, 16]} className="template-grid">
            {[
              { name: "基础安全扫描", desc: "检测基础TC260内容" },
              { name: "对抗样本测试", desc: "生成对抗样本进行鲁棒性测试" },
              { name: "隐私泄露检测", desc: "检测模型是否存在隐私泄露风险" },
            ].map((template, index) => (
              <Col span={6} key={index}>
                <Card
                  size="small"
                  className={`template-item ${
                    selectedTemplates.includes(template.name) ? "selected" : ""
                  }`}
                  onClick={() => handleTemplateSelect(template.name)}
                  hoverable
                >
                  {selectedTemplates.includes(template.name) && (
                    <CheckOutlined className="template-check" />
                  )}
                  <div className="template-content">
                    <Text strong>{template.name}</Text>
                    <Paragraph type="secondary" className="template-desc">
                      {template.desc}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}

            <Col span={6}>
              <Card
                size="small"
                className="template-item custom-template"
                onClick={() => setIsCustomDialogOpen(true)}
                hoverable
              >
                <div className="template-content">
                  <SettingOutlined className="custom-icon" />
                  <Text strong>自定义模板</Text>
                  <Paragraph type="secondary" className="template-desc">
                    创建自定义测试模板
                  </Paragraph>
                </div>
              </Card>
            </Col>
          </Row>

          {selectedTemplates.length > 0 && (
            <div className="selected-templates">
              <Divider />
              <div className="templates-summary">
                <div>
                  <Text>已选择 {selectedTemplates.length} 个模板：</Text>
                  <div className="selected-tags">
                    {selectedTemplates.map(template => (
                      <Tag key={template} color="blue">{template}</Tag>
                    ))}
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  icon={isSubmittingTask ? <Spin size="small" /> : <PlusOutlined />}
                  onClick={handleSubmitTask}
                  loading={isSubmittingTask}
                  disabled={isSubmittingTask}
                  className="submit-button"
                >
                  {isSubmittingTask ? "任务下发中..." : "下发测试任务"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 自定义模板对话框 */}
      <Modal
        title="自定义模板配置"
        visible={isCustomDialogOpen}
        onCancel={() => setIsCustomDialogOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCustomDialogOpen(false)}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            disabled={!currentCustomCorpusFileName}
            onClick={() => {
              if (currentCustomCorpusFileName) {
                // 添加新的自定义模板文件到数组
                setCustomCorpusFiles(prev => [...prev, currentCustomCorpusFile]);
                setCustomCorpusFileNames(prev => [...prev, currentCustomCorpusFileName]);
                setSelectedTemplates((prev) => [...prev, "自定义模板"]);
                message.success("自定义模板配置成功");
                // 清空当前输入
                setCurrentCustomCorpusFile("");
                setCurrentCustomCorpusFileName("");
                if (customCorpusRef.current) customCorpusRef.current.value = "";
              }
              setIsCustomDialogOpen(false);
            }}
          >
            确认配置
          </Button>
        ]}
        width={500}
      >
        <div className="custom-dialog-content">
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
            <Text strong>功能2：上传自定义测试语料</Text>
            {/* 显示已上传的文件列表 */}
            {customCorpusFileNames.length > 0 && (
              <div className="uploaded-files" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">已上传的文件：</Text>
                  <Button 
                    type="link" 
                    size="small" 
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: '批量删除确认',
                        content: `确定要删除所有 ${customCorpusFileNames.length} 个文件吗？`,
                        okText: '全部删除',
                        cancelText: '取消',
                        okType: 'danger',
                        onOk() {
                          setCustomCorpusFiles([]);
                          setCustomCorpusFileNames([]);
                          message.success('所有文件已删除');
                        },
                      });
                    }}
                    title="删除所有文件"
                  >
                    清空全部
                  </Button>
                </div>
                {customCorpusFileNames.map((fileName, index) => (
                  <div key={index} className="file-info" style={{ marginTop: 4 }}>
                    <FileTextOutlined />
                    <span title={fileName}>{fileName}</span>
                    <Button 
                      type="text" 
                      size="small" 
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '删除确认',
                          content: `确定要删除文件 "${fileName}" 吗？`,
                          okText: '删除',
                          cancelText: '取消',
                          okType: 'danger',
                          onOk() {
                            const newFiles = customCorpusFiles.filter((_, i) => i !== index);
                            const newFileNames = customCorpusFileNames.filter((_, i) => i !== index);
                            setCustomCorpusFiles(newFiles);
                            setCustomCorpusFileNames(newFileNames);
                            
                            // 如果删除后没有文件了，从selectedTemplates中移除"自定义模板"
                            if (newFiles.length === 0) {
                              setSelectedTemplates(prev => prev.filter(t => t !== "自定义模板"));
                            }
                            
                            message.success('文件删除成功');
                          },
                        });
                      }}
                      title="删除此文件"
                    />
                  </div>
                ))}
              </div>
            )}
            
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
                    Modal.confirm({
                      title: '取消选择',
                      content: `确定要取消选择文件 "${currentCustomCorpusFileName}" 吗？`,
                      okText: '取消选择',
                      cancelText: '保留',
                      okType: 'danger',
                      onOk() {
                        setCurrentCustomCorpusFile("");
                        setCurrentCustomCorpusFileName("");
                        if (customCorpusRef.current) customCorpusRef.current.value = "";
                        message.success('已取消选择');
                      },
                    });
                  }}
                  title="取消选择此文件"
                />
              </div>
            )}
            
            <div className="upload-area" style={{ marginTop: 8 }}>
              <input
                ref={customCorpusRef}
                type="file"
                accept=".txt"
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
                  选择txt文件
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDispatch;
