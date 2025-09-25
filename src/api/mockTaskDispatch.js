// Mock服务：任务下发接口打桩
import { message } from "antd";

/**
 * 模拟任务下发接口
 * @param {Object} data - 任务下发参数
 * @returns {Promise} 模拟的API响应
 */
export const mockDispatchTask = async (data) => {
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 验证必要参数
  if (!data.taskName || !data.targetUrl || !data.selectedTemplates?.length) {
    const error = new Error("参数验证失败");
    error.details = {
      taskName: !!data.taskName,
      targetUrl: !!data.targetUrl,
      selectedTemplates: !!data.selectedTemplates?.length
    };
    throw error;
  }
  
  // 模拟不同的响应场景
  const scenarios = [
    { success: true, weight: 0.8 }, // 80% 成功率
    { success: false, weight: 0.2 }  // 20% 失败率
  ];
  
  const random = Math.random();
  const isSuccess = random < scenarios[0].weight;
  
  if (isSuccess) {
    // 成功响应
    const mockResponse = {
      code: 1,
      msg: "任务下发成功",
      data: {
        taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskName: data.taskName,
        description: data.description,
        targetUrl: data.targetUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        estimatedDuration: Math.floor(Math.random() * 300) + 60, // 1-5分钟
        templateCount: data.selectedTemplates.length,
        customFileCount: data.customCorpusFile?.length || 0,
        apiConfig: {
          type: data.type,
          modelType: data.modelType || data.type === "builtin" ? "OpenAI GPT" : "自定义格式"
        }
      }
    };
    return mockResponse;
    
  } else {
    // 模拟失败场景
    const errorScenarios = [
      { code: 0, msg: "目标URL无法访问", error: "网络连接超时" },
      { code: 0, msg: "API配置验证失败", error: "API密钥无效" },
      { code: 0, msg: "模板文件格式错误", error: "自定义模板解析失败" },
      { code: 0, msg: "系统繁忙", error: "当前任务队列已满，请稍后重试" }
    ];
    
    const errorResponse = errorScenarios[Math.floor(Math.random() * errorScenarios.length)];
    
    // 抛出错误以模拟真实的API错误处理
    const error = new Error(errorResponse.msg);
    error.response = { data: errorResponse };
    throw error;
  }
};

/**
 * 生成详细的mock任务信息
 * @param {Object} data - 任务参数
 * @returns {Object} 详细的任务信息
 */
export const generateDetailedMockTask = (data) => {
  return {
    // 基本信息
    taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    taskName: data.taskName,
    description: data.description,
    targetUrl: data.targetUrl,
    
    // 状态信息
    status: "pending", // pending, running, completed, failed
    progress: 0,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    
    // 配置信息
    apiConfig: {
      type: data.type,
      modelType: data.modelType || (data.type === "builtin" ? "OpenAI GPT-4" : "自定义格式"),
      hasApiKey: !!data.apiKey,
      hasCustomHeaders: !!data.customHeaders
    },
    
    // 模板信息
    templates: data.selectedTemplates.map(template => ({
      name: template,
      type: template === "自定义模板" ? "custom" : "builtin",
      enabled: true
    })),
    
    // 自定义文件信息
    customFiles: data.customCorpusFile?.map((file, index) => ({
      id: `custom_${index}`,
      name: `自定义模板_${index + 1}.json`,
      size: file.length,
      uploadedAt: new Date().toISOString()
    })) || [],
    
    // 预估信息
    estimatedDuration: Math.floor(Math.random() * 300) + 60, // 秒
    estimatedTests: data.selectedTemplates.length * (10 + Math.floor(Math.random() * 20)),
    
    // 资源使用
    resourceUsage: {
      cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
      memory: Math.floor(Math.random() * 200) + 100, // MB
      network: Math.floor(Math.random() * 50) + 10 // Mbps
    }
  };
};

