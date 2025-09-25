import React, { useState, useRef, useEffect } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
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
import { dispatchTask, TaskDispatchParams, testApiConnectivity, ApiTestParams, saveCustomTemplate, SaveCustomTemplateParams, getTaskTemplates, TaskTemplate } from "../../../api/task";
import "./index.less";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TaskDispatch: React.FC<RouteComponentProps> = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  
  // API格式内容状态
  const [requestContent, setRequestContent] = useState("");
  const [responseContent, setResponseContent] = useState("");
  
  // 模板选择相关状态
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [currentCustomCorpusFile, setCurrentCustomCorpusFile] = useState<File | null>(null);
  const [currentCustomCorpusFileName, setCurrentCustomCorpusFileName] = useState("");
  const [customTemplateName, setCustomTemplateName] = useState("");

  // 快速任务模板状态
  const [quickTemplates, setQuickTemplates] = useState<TaskTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // 重置自定义模板表单
  const resetCustomTemplateForm = () => {
    setCustomTemplateName("");
    setCurrentCustomCorpusFile(null);
    setCurrentCustomCorpusFileName("");
    if (customCorpusRef.current) customCorpusRef.current.value = "";
  };

  // 清空整个页面
  const clearPage = () => {
    // 重置表单
    form.resetFields();
    
    // 重置API格式内容
    setRequestContent("");
    setResponseContent("");
    
    // 重置模板选择
    setSelectedTemplates([]);
    resetCustomTemplateForm();
    
    // 重置API配置
    setApiFormatType("");
    setSelectedBuiltinFormat("");
    setApiKey("");
    setCustomHeaders("");
    setCustomHeadersObj({});
    setApiTestResult(null);
    setApiTestElapsedTime(null);
    
    // 重置字段验证状态
    setFieldErrors({
      taskName: false,
      description: false,
      targetUrl: false,
      apiFormatType: false,
      apiKey: false,
      customHeaders: false,
      requestContent: false,
      responseContent: false,
      selectedTemplates: false
    });
    
    // 重置提交状态
    setIsTestingApi(false);
    setIsSubmittingTask(false);
    
    message.success("页面已清空，可以创建新任务");
  };
  
  // API配置相关状态
  const [apiFormatType, setApiFormatType] = useState<"builtin" | "custom" | "">("");
  const [selectedBuiltinFormat, setSelectedBuiltinFormat] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [customHeadersObj, setCustomHeadersObj] = useState<{}>({});
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<"success" | "failed" | null>(null);
  const [apiTestElapsedTime, setApiTestElapsedTime] = useState<number | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // 字段验证状态
  const [fieldErrors, setFieldErrors] = useState({
    taskName: false,
    description: false,
    targetUrl: false,
    apiFormatType: false,
    apiKey: false,
    customHeaders: false,
    requestContent: false,
    responseContent: false,
    selectedTemplates: false
  });

  const customCorpusRef = useRef<HTMLInputElement>(null);

  // 获取模板列表
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await getTaskTemplates();
      if (response.code === 1 && response.data) {
        setQuickTemplates(response.data);
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
      setTemplatesLoading(false);
    }
  };

  // 组件加载时获取模板列表
  useEffect(() => {
    fetchTemplates();
  }, []);


  // 模板选择处理
  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplates((prev) => {
      const newTemplates = prev.includes(templateName) 
        ? prev.filter((t) => t !== templateName)
        : [...prev, templateName];
      
      // 清除模板选择的错误状态
      if (newTemplates.length > 0 && fieldErrors.selectedTemplates) {
        setFieldErrors(prevErrors => ({ ...prevErrors, selectedTemplates: false }));
      }
      
      return newTemplates;
    });
  };

  // JSON内容验证函数 - 支持单个JSON对象和JSONL格式
  const validateJsonContent = (content: string): boolean => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;
    
    try {
      // 首先尝试解析为单个JSON对象
      JSON.parse(trimmedContent);
      return true;
    } catch (error) {
      // 如果失败，尝试解析为JSONL格式（每行一个JSON对象）
      try {
        const lines = trimmedContent.split('\n').filter(line => line.trim());
        if (lines.length === 0) return false;
        
        // 验证每一行都是有效的JSON对象
        for (const line of lines) {
          JSON.parse(line.trim());
        }
        return true;
      } catch (jsonlError) {
        return false;
      }
    }
  };

  // 自定义语料上传
  const handleCustomCorpusUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      // 验证JSON格式但不读取全部内容
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (validateJsonContent(content)) {
          // 验证通过后保存File对象而非内容
          setCurrentCustomCorpusFile(file);
          setCurrentCustomCorpusFileName(file.name);
        } else {
          message.error("JSON文件格式不正确，请检查文件内容。支持单个JSON对象或JSONL格式（每行一个JSON对象）");
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

  // API测试
  const handleApiTest = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    setApiTestElapsedTime(null);

    try {
      // 测试前先验证自定义Header的JSON格式
      if (customHeaders.trim()) {
        const headerValidationError = validateCustomHeadersJson(customHeaders);
        if (headerValidationError) {
          message.error(headerValidationError);
          setApiTestResult("failed");
          return;
        }
      }

      // 构建API测试参数
      const testParams: ApiTestParams = {
        type: apiFormatType === "custom" ? 0 : 1, // 0 - 自定义API格式, 1 - 其他内置模型
        customHeaders: customHeaders, // 直接传递字符串
      };

      // 根据API格式类型添加相应参数
      if (apiFormatType === "builtin") {
        testParams.modelType = selectedBuiltinFormat;
        testParams.apiKey = apiKey;
      } else if (apiFormatType === "custom") {
        testParams.requestContent = requestContent;
        testParams.responseContent = responseContent;
      }

      
      // 调用API测试接口
      const response = await testApiConnectivity(testParams) as any;
      
      // 提取延时时间
      const elapsedTime = response.data?.data?.elapsed_time;
      if (elapsedTime !== undefined) {
        setApiTestElapsedTime(elapsedTime);
      }
      
      if (response.data?.code === 1) {
        setApiTestResult("success");
        const elapsedTimeText = elapsedTime !== undefined ? ` (响应时间: ${elapsedTime}ms)` : "";
        message.success(`API连接测试成功${elapsedTimeText}`);
      } else {
        setApiTestResult("failed");
        const errorMsg = response.data?.message || "未知错误";
        const elapsedTimeText = elapsedTime !== undefined ? ` (响应时间: ${elapsedTime}ms)` : "";
        message.error(`API连接测试失败: ${errorMsg}${elapsedTimeText}`);
      }
    } catch (error) {
      setApiTestResult("failed");
      setApiTestElapsedTime(null);
      
      let errorMessage = "API连接测试失败";
      const err = error as any;
      
      // 处理来自响应拦截器的code: 0错误（直接是响应体）
      if (err?.code === 0) {
        const elapsedTime = err?.data?.elapsed_time;
        if (elapsedTime !== undefined) {
          setApiTestElapsedTime(elapsedTime);
        }
        errorMessage = err?.message || "API连接测试失败";
        const elapsedTimeText = elapsedTime !== undefined ? ` (响应时间: ${elapsedTime}ms)` : "";
        message.error(`${errorMessage}${elapsedTimeText}`);
      } 
      // 处理网络错误等其他错误
      else if (err?.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
        message.error(errorMessage);
      } else if (err?.message) {
        errorMessage += `: ${err.message}`;
        message.error(errorMessage);
      } else {
        message.error(errorMessage);
      }
    } finally {
      setIsTestingApi(false);
    }
  };


  // 自定义Header JSON格式校验函数
  const validateCustomHeadersJson = (content: string) => {
    if (!content.trim()) {
      return "自定义Header不能为空";
    }
    
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return "自定义Header必须是有效的JSON对象格式";
      }
      return null;
    } catch (error) {
      return "自定义Header的JSON格式不正确，请检查语法是否有误";
    }
  };

  // 解析自定义Header字符串为对象
  const parseCustomHeaders = (content: string): {} => {
    if (!content.trim()) {
      return {};
    }
    
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch (error) {
      return {};
    }
  };

  // 提交任务
  // 校验$$$标记的函数
  const validateDollarMarkers = (content: string, fieldName: string) => {
    // 使用更精确的正则表达式，确保恰好是三个$，前后不能有更多的$
    const exactTripleDollarRegex = /(?<!\$)\$\$\$(?!\$)/g;
    const matches = content.match(exactTripleDollarRegex) || [];
    
    if (matches.length === 0) {
      return `${fieldName}中必须包含一个$$$标记`;
    } else if (matches.length > 1) {
      return `${fieldName}中只能包含一个$$$标记，当前有${matches.length}个`;
    }
    
    return null;
  };

  // 清除指定字段的错误状态
  const clearFieldError = (fieldName: keyof typeof fieldErrors) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  const handleSubmitTask = async () => {
    // 验证必填项并设置错误状态
    const newFieldErrors = {
      taskName: false,
      description: false,
      targetUrl: false,
      apiFormatType: false,
      apiKey: false,
      customHeaders: false,
      requestContent: false,
      responseContent: false,
      selectedTemplates: false
    };
    
    let hasError = false;
    
    // 获取表单值
    const formValues = form.getFieldsValue();
    
    // 验证基本信息
    if (!formValues.taskName || !formValues.taskName.trim()) {
      newFieldErrors.taskName = true;
      hasError = true;
    }
    
    if (!formValues.description || !formValues.description.trim()) {
      newFieldErrors.description = true;
      hasError = true;
    }
    
    // 验证目标URL
    if (!formValues.targetUrl || !formValues.targetUrl.trim()) {
      newFieldErrors.targetUrl = true;
      hasError = true;
    }
    
    // 验证API格式配置
    if (!apiFormatType || (apiFormatType === "builtin" && !selectedBuiltinFormat)) {
      newFieldErrors.apiFormatType = true;
      hasError = true;
    } else if (apiFormatType === "builtin") {
      if (!apiKey.trim()) {
        newFieldErrors.apiKey = true;
        hasError = true;
      }
      
      // 验证自定义Header（内置API格式时为必填）
      const customHeaderError = validateCustomHeadersJson(customHeaders);
      if (customHeaderError) {
        newFieldErrors.customHeaders = true;
        hasError = true;
      }
    } else if (apiFormatType === "custom") {
      if (!requestContent.trim()) {
        newFieldErrors.requestContent = true;
        hasError = true;
      } else {
        // 校验请求格式中的$$$标记
        const requestError = validateDollarMarkers(requestContent, "请求格式");
        if (requestError) {
          newFieldErrors.requestContent = true;
          hasError = true;
        }
      }
      
      if (!responseContent.trim()) {
        newFieldErrors.responseContent = true;
        hasError = true;
      } else {
        // 校验响应格式中的$$$标记
        const responseError = validateDollarMarkers(responseContent, "响应格式");
        if (responseError) {
          newFieldErrors.responseContent = true;
          hasError = true;
        }
      }
    }
    
    // 验证模板选择
    if (selectedTemplates.length === 0) {
      newFieldErrors.selectedTemplates = true;
      hasError = true;
    }
    
    // 更新错误状态
    setFieldErrors(newFieldErrors);
    
    if (hasError) {
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
        description: values.description,
        targetUrl: values.targetUrl,
        type: apiFormatType === "custom" ? 0 : 1, // 0 - 自定义API格式, 1 - 其他内置模型
        modelType: apiFormatType === "builtin" ? selectedBuiltinFormat : undefined,
        apiKey: apiFormatType === "builtin" ? apiKey : undefined,
        customHeaders: customHeaders, // 直接传递字符串
        requestContent: apiFormatType === "custom" ? requestContent : undefined,
        responseContent: apiFormatType === "custom" ? responseContent : undefined,
        selectedTemplates,
        customCorpusFile: undefined // 任务调度中不直接使用自定义语料文件
      };
      
      // 发送任务下发请求
      const response = await dispatchTask(taskParams);
      
      // 成功处理 - 根据code === 1判断成功
      if (response?.code === 1) {
        const taskData = response.data;
        message.success(`任务下发成功！任务ID: ${taskData?.taskId || '已生成'}`);
        
        // 显示详细的成功信息
        if (taskData?.taskId) {
          Modal.success({
            title: '任务创建成功',
            content: (
              <div>
                <p><strong>任务ID:</strong> {taskData.taskId}</p>
                <p><strong>任务名称:</strong> {taskData.taskName}</p>
                <p><strong>任务描述:</strong> {taskData.description}</p>
                <p><strong>目标URL:</strong> {taskData.targetUrl}</p>
                <p><strong>预估时长:</strong> {Math.floor(taskData.estimatedDuration / 60)}分{taskData.estimatedDuration % 60}秒</p>
                <p><strong>模板数量:</strong> {taskData.templateCount}个</p>
                {taskData.customFileCount > 0 && (
                  <p><strong>自定义文件:</strong> {taskData.customFileCount}个</p>
                )}
              </div>
            ),
            width: 500,
            onOk: () => {
              // 任务下发成功后清空页面
              clearPage();
            }
          });
        } else {
          // 如果没有详细数据，直接清空页面
          clearPage();
        }
      } else {
        // 如果code不为1，说明后端返回了错误
        const errorMsg = response?.msg || response?.message || "任务下发失败";
        message.error(errorMsg);
        return;
      }
      
      // 可选：重置表单或跳转页面
      // form.resetFields();
      // history.push('/task'); // 跳转到任务列表页面
      
    } catch (error) {
      
      // 根据错误类型显示不同的错误信息
      let errorMessage = "任务下发失败，请检查配置后重试";
      
      // 类型断言处理错误对象
      const err = error as any;
      
      // 处理来自响应拦截器的code: 0错误（直接是响应体）
      if (err?.code === 0) {
        errorMessage = err?.msg || err?.error || "任务下发失败";
      }
      // 处理网络错误等其他错误
      else if (err?.response?.data?.msg) {
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
              validateStatus={fieldErrors.taskName ? "error" : ""}
              help={fieldErrors.taskName ? "请输入任务名称" : ""}
            >
              <Input 
                placeholder="请输入任务名称" 
                size="large"
                className={`form-input ${fieldErrors.taskName ? 'error-input' : ''}`}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    clearFieldError('taskName');
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="任务描述"
              name="description"
              rules={[
                {
                  required: true,
                  message: '请输入任务描述',
                },
              ]}
              validateStatus={fieldErrors.description ? "error" : ""}
              help={fieldErrors.description ? "请输入任务描述" : ""}
            >
              <TextArea 
                placeholder="请输入任务描述" 
                rows={3}
                className={`form-input ${fieldErrors.description ? 'error-input' : ''}`}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    clearFieldError('description');
                  }
                }}
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
              validateStatus={fieldErrors.targetUrl ? "error" : ""}
              help={fieldErrors.targetUrl ? "请输入目标URL" : ""}
            >
              <Input 
                placeholder="https://example.com/api" 
                size="large"
                className={`form-input ${fieldErrors.targetUrl ? 'error-input' : ''}`}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    clearFieldError('targetUrl');
                  }
                }}
              />
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
                // 清除API格式类型的错误状态
                if (fieldErrors.apiFormatType) {
                  setFieldErrors(prev => ({ ...prev, apiFormatType: false }));
                }
              }}
             placeholder="选择API格式类型"
             size="large"
             className={`format-select ${fieldErrors.apiFormatType ? 'error-select' : ''}`}
             style={{ 
               width: "100%", 
               marginTop: 8
             }}
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
                 onChange={(e) => {
                   setApiKey(e.target.value);
                   // 清除之前的测试结果，因为配置已改变
                   if (apiTestResult) {
                     setApiTestResult(null);
                   }
                   // 清除API密钥的错误状态
                   if (fieldErrors.apiKey) {
                     setFieldErrors(prev => ({ ...prev, apiKey: false }));
                   }
                 }}
                 size="large"
                 className={`form-input ${fieldErrors.apiKey ? 'error-input' : ''}`}
                 style={{ 
                   marginTop: 8
                 }}
               />
              </div>

              <div className="config-item">
                <Text strong>
                  自定义Header <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <TextArea
                  placeholder={`请输入自定义请求头（JSON格式），格式如：
{
  "Authorization": "Bearer your-token",
  "Content-Type": "application/json",
  "X-Custom-Header": "value"
}`}
                  rows={4}
                  value={customHeaders}
                  onChange={(e) => {
                    setCustomHeaders(e.target.value);
                    // 清除之前的测试结果，因为配置已改变
                    if (apiTestResult) {
                      setApiTestResult(null);
                    }
                    // 清除自定义Header的错误状态
                    if (e.target.value.trim() && fieldErrors.customHeaders) {
                      clearFieldError('customHeaders');
                    }
                  }}
                  className={`header-textarea ${fieldErrors.customHeaders ? 'error' : ''}`}
                  style={{ 
                    marginTop: 8,
                    borderColor: fieldErrors.customHeaders ? '#ff4d4f' : undefined
                  }}
                />
                {fieldErrors.customHeaders && (
                  <Text type="danger" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {customHeaders.trim() ? validateCustomHeadersJson(customHeaders) : '自定义Header不能为空'}
                  </Text>
                )}
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
                    </div>
                  
                  <TextArea
                    placeholder={`请输入API请求格式（必须包含JSON格式内容），例如：
POST /test/test.php HTTP/1.1
Host: 192.168.6.141
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Content-Type: application/json
Authorization: Bearer app-U8IR1HcLEo6f5ZVlnxe8gaeZ
Content-Length: 189

{
            "inputs": {},
            "query": "$$$",
            "response_mode": "streaming",
            "conversation_id": "",
            "user": "test002"
        }
                      `}
                    rows={8}
                    value={requestContent}
                    onChange={(e) => {
                      setRequestContent(e.target.value);
                      // 清除之前的测试结果，因为配置已改变
                      if (apiTestResult) {
                        setApiTestResult(null);
                      }
                      // 清除请求格式的错误状态
                      if (fieldErrors.requestContent) {
                        setFieldErrors(prev => ({ ...prev, requestContent: false }));
                      }
                    }}
                    className={`format-textarea ${fieldErrors.requestContent ? 'error-textarea' : ''}`}
                  />

                </div>
              </Col>

              <Col span={12}>
                   <div className="format-upload-section">
                     <div className="section-header">
                       <Text strong>
                         响应格式 <span style={{ color: '#ff4d4f' }}>*</span>
                       </Text>
                  </div>
                  
                  <TextArea
                    placeholder={`请输入API响应格式（必须包含JSON格式内容），例如：
HTTP/1.1 200 OK
Date: Mon, 25 Aug 2025 06:12:44 GMT
Server: Apache/2.4.23 (Win32) OpenSSL/1.0.2j PHP/5.4.45
X-Powered-By: PHP/5.4.45
Connection: close
Content-Type: application/json
Content-Length: 110114

{"event": "message", "conversation_id": "b5", "message_id": "f3", "created_at": 1744275308, "task_id": "66", "id": "f3", "answer": "$$$", "from_variable_selector": null}
                      `}
                    rows={8}
                    value={responseContent}
                    onChange={(e) => {
                      setResponseContent(e.target.value);
                      // 清除之前的测试结果，因为配置已改变
                      if (apiTestResult) {
                        setApiTestResult(null);
                      }
                      // 清除响应格式的错误状态
                      if (fieldErrors.responseContent) {
                        setFieldErrors(prev => ({ ...prev, responseContent: false }));
                      }
                    }}
                    className={`format-textarea ${fieldErrors.responseContent ? 'error-textarea' : ''}`}
                  />

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
                 disabled={
                   isTestingApi || 
                   !apiFormatType || 
                   !customHeaders.trim() || 
                   validateCustomHeadersJson(customHeaders) !== null ||
                   (apiFormatType === "builtin" && (!selectedBuiltinFormat || !apiKey.trim())) || 
                   (apiFormatType === "custom" && (!requestContent.trim() || !responseContent.trim()))
                 }
                 icon={isTestingApi ? <Spin size="small" /> : <WifiOutlined />}
               >
                {isTestingApi ? "测试中..." : "一键测试API请求连通性"}
              </Button>

              {apiTestResult && (
                <Tag color={apiTestResult === "success" ? "green" : "red"}>
                  {apiTestResult === "success" ? (
                    <>
                      <CheckOutlined /> API连接成功
                      {apiTestElapsedTime !== null && ` (${apiTestElapsedTime}ms)`}
                    </>
                  ) : (
                    <>
                      <CloseOutlined /> API连接失败
                      {apiTestElapsedTime !== null && ` (${apiTestElapsedTime}ms)`}
                    </>
                  )}
                </Tag>
              )}
            </Space>
          </div>
        </Card>

         {/* 快速任务模板 */}
         <Card className={`section-card template-card ${fieldErrors.selectedTemplates ? 'error-card' : ''}`}>
           <Title level={3}>
             快速任务模板 <span style={{ color: '#ff4d4f' }}>*</span>
           </Title>
           <Paragraph type="secondary">
             选择预设的任务模板快速创建（支持多选）
           </Paragraph>
           {fieldErrors.selectedTemplates && (
             <div style={{ color: '#ff4d4f', fontSize: '12px', marginBottom: '8px' }}>
               请至少选择一个测试模板
             </div>
           )}

          <Row gutter={[16, 16]} className="template-grid">
            {templatesLoading ? (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin />
                  <Text style={{ marginLeft: '8px' }}>加载模板中...</Text>
                </div>
              </Col>
            ) : (
              quickTemplates.map((template, index) => (
                <Col span={6} key={template.id}>
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
                        {template.type === 'custom' ? '自定义模板' : template.description}
                      </Paragraph>
                    </div>
                  </Card>
                </Col>
              ))
            )}

            <Col span={6}>
              <Card
                size="small"
                className="template-item custom-template"
                onClick={() => history.push('/ai-security/template-management')}
                hoverable
              >
                <div className="template-content">
                  <SettingOutlined className="custom-icon" />
                  <Text strong>自定义模板</Text>
                  <Paragraph type="secondary" className="template-desc">
                    跳转到模板管理页面
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
          onCancel={() => {
            resetCustomTemplateForm();
            setIsCustomDialogOpen(false);
          }}
        footer={[
          <Button key="cancel" onClick={() => {
            resetCustomTemplateForm();
            setIsCustomDialogOpen(false);
          }}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            disabled={!customTemplateName.trim() || !currentCustomCorpusFile}
            onClick={async () => {
              if (customTemplateName.trim() && currentCustomCorpusFile) {
                try {
                  // 发送网络请求保存自定义模板到后端
                  const templateData: SaveCustomTemplateParams = {
                    name: customTemplateName.trim(),
                    corpusFile: currentCustomCorpusFile,
                    corpusFileName: currentCustomCorpusFileName,
                  };

                  const response = await saveCustomTemplate(templateData) as any;
                  
                  if (response.code === 1) {
                    // 保存成功，重新获取模板列表
                    const templateName = response.data?.templateName || customTemplateName.trim();
                    message.success(`自定义模板“${templateName}”保存成功`);
                    
                    // 重新获取模板列表以显示最新数据
                    await fetchTemplates();
                    
                    // 自动选择新创建的模板
                    setSelectedTemplates((prev) => [...prev, customTemplateName.trim()]);
                  } else {
                    message.error(response.message || response.data?.message || "保存自定义模板失败");
                  }
                } catch (error) {
                  const err = error as any;
                  let errorMessage = "保存自定义模板失败";
                  if (err?.response?.data?.message) {
                    errorMessage += `: ${err.response.data.message}`;
                  } else if (err?.message) {
                    errorMessage += `: ${err.message}`;
                  }
                  message.error(errorMessage);
                }
                
                  // 重置自定义模板表单
                  resetCustomTemplateForm();
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
            <Text strong>模板名称</Text>
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
            <Text strong>功能2：上传自定义测试语料</Text>
            
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
                        setCurrentCustomCorpusFile(null);
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
    </div>
  );
};

export default TaskDispatch;
