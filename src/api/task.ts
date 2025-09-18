import request from "../utils/request";
import { mockDispatchTask, printMockStatus } from "./mockTaskDispatch";
import { getMockStatus, logApiSource } from "../utils/mockControl";
import { getUserInfo } from "../utils/auth";
import { SSEEvent, SSETaskProgressEvent, SSETaskCompletedEvent, SSETaskStatusChangeEvent } from "../services/sseService";

export interface ParamsProps {
  page: number;
  pagesize: number;
  search?: string;
  taskField?: string;
  vulField?: string;
}

export interface TaskProps {
  id: number;
  operator: string;
  remarks: string;
  results: string;
  status: string;
  target: string;
}

export interface ResultProps {
  id: number;
  plugin_id: string;
  plugin_name: string;
  task_id: number;
  vul: boolean;
  detail: any;
}

// 任务下发请求参数接口
export interface TaskDispatchParams {
  taskName: string;
  description: string;
  targetUrl: string;
  apiConfig: {
    type: "builtin" | "custom";
    format?: string;
    apiKey?: string;
    customHeaders?: string;
    requestContent?: string;
    responseContent?: string;
  };
  selectedTemplates: string[];
  customCorpusFile?: string[]; // 修改为数组类型，支持多个自定义模板文件
}

// 保存自定义模板请求参数接口
export interface SaveCustomTemplateParams {
  name: string;
  description: string;
  corpusContent: string;
  corpusFileName: string;
}

// 保存自定义模板响应接口
export interface SaveCustomTemplateResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    templateId: string;
    templateName: string;
  };
}

// 编辑模板请求参数接口
export interface EditTemplateParams {
  templateId: string;
  name: string;
  description: string;
  corpusContent?: string;
  corpusFileName?: string;
}

// 编辑模板响应接口
export interface EditTemplateResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    templateId: string;
    templateName: string;
    isModified: boolean;
  };
}

// 删除模板响应接口
export interface DeleteTemplateResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    deletedTemplateId: string;
    deletedTemplateName: string;
    remainingCount: number;
  };
}

// 任务模板接口定义
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  createTime: string;
  type: 'builtin' | 'custom'; // 内置模板或自定义模板
  corpusFileName?: string;
  corpusContent?: string;
}

// 获取任务模板响应接口
export interface GetTaskTemplatesResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    templates: TaskTemplate[];
    total: number;
  };
}

// API连通性测试请求参数接口
export interface ApiTestParams {
  type: "builtin" | "custom";
  format?: string; // 当type为builtin时，表示内置格式类型（如openai、claude等）
  apiKey?: string;
  customHeaders?: string;
  requestContent?: string;
  responseContent?: string;
}

/**
 * 获取任务列表
 * @param params
 */

export const getTaskList = (params: {
  page: number;
  pagesize: number;
  search?: string;
}) => {
  return request({
    url: "v1/task/",
    method: "get",
    params
  });
};

/**
 * 删除任务
 * @param id
 */

export const deleteTask = (id: string) => {
  return request({
    url: `v1/task/${id}/`,
    method: "delete"
  });
};
/**
 * 获取任务列表
 * @param params
 */

export const getResultList = (params: {
  page: number;
  pagesize: number;
  search?: string;
  taskField?: string;
  vulField?: string;
}) => {
  return request({
    url: "v1/result/",
    method: "get",
    params
  });
};

/**
 * 删除任务
 * @param id
 */

export const deleteResult = (id: string) => {
  return request({
    url: `v1/result/${id}/`,
    method: "delete"
  });
};

// 扫描结果详情接口类型定义
export interface ScanResultDetailResponse {
  code: number;
  message: string;
  data: {
    taskInfo: {
      id: string;
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
    };
    template: {
      name: string;
      totalQuestions: number;
    };
    summary: {
      issueQuestions: number;
    };
    categoryStats: Array<{
      category: string;
      answeredQuestions: number;
      passedQuestions: number;
    }>;
    questions: Array<{
      id: string;
      question: string;
      answer: string;
      isAnswered: boolean;
      hasIssue: boolean;
      category: string;
      judgment: string;
    }>;
  };
}

// 人工审核问题请求参数接口
export interface QuestionReviewParams {
  hasIssue: boolean;           // 人工审核后的结论：true-存在问题，false-不存在问题
}

// 人工审核问题响应接口
export interface QuestionReviewResponse {
  code: number;
  message: string;
  success: boolean;               // 审核是否成功
  data: {
    isModified?: boolean;           // 可选：是否修改了原始结论（用于日志）
  };
}

// Mock开关 - 动态从全局状态获取
const getMockEnabled = () => getMockStatus();

/**
 * 任务下发
 * @param data 任务下发参数
 */
export const dispatchTask = (data: TaskDispatchParams) => {
  const useMock = getMockEnabled();
  logApiSource("任务下发", useMock);
  
  if (useMock) {
    // 打印Mock服务状态（仅第一次调用时）
    if (!(window as any).__mockStatusPrinted) {
      printMockStatus();
      (window as any).__mockStatusPrinted = true;
    }
    
    return mockDispatchTask(data);
  }
  
  // 真实API调用
  return request({
    url: "/v1/ai_task/",
    method: "post",
    data
  });
};

/**
 * 扫描结果详情 - Mock实现
 * @param taskId 任务ID
 */
const mockGetScanResultDetail = (taskId: string): Promise<ScanResultDetailResponse> => {
  console.log("🔧 使用Mock服务获取扫描结果详情", taskId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ScanResultDetailResponse = {
        code: 200,
        message: "获取成功",
        data: {
          taskInfo: {
            id: taskId,
            name: "AI模型安全评估任务",
            status: "completed"
          },
          template: {
            name: "基础安全扫描模板",
            totalQuestions: 45
          },
          summary: {
            issueQuestions: 8
          },
          categoryStats: [
            {
              category: "对抗攻击检测",
              answeredQuestions: 11,
              passedQuestions: 8
            },
            {
              category: "隐私泄露检测", 
              answeredQuestions: 9,
              passedQuestions: 7
            },
            {
              category: "公平性检测",
              answeredQuestions: 8,
              passedQuestions: 6
            },
            {
              category: "后门检测",
              answeredQuestions: 7,
              passedQuestions: 6
            },
            {
              category: "提示安全",
              answeredQuestions: 7,
              passedQuestions: 7
            }
          ],
          questions: [
            {
              id: "1",
              question: "模型是否容易受到对抗样本攻击？",
              answer: "经过测试，模型在面对精心构造的对抗样本时表现出一定的脆弱性，准确率下降约15%。建议增加对抗训练来提高鲁棒性。",
              isAnswered: true,
              hasIssue: true,
              category: "对抗攻击检测",
              judgment: "危害国家安全"
            },
            {
              id: "2", 
              question: "是否存在训练数据泄露风险？",
              answer: "通过成员推理攻击测试，发现模型可能泄露部分训练数据信息，泄露率约为8%。",
              isAnswered: true,
              hasIssue: true,
              category: "隐私泄露检测",
              judgment: "色情"
            },
            {
              id: "3",
              question: "模型输出是否存在偏见？",
              answer: "在性别和种族相关的测试用例中，模型表现出轻微的偏见倾向，但在可接受范围内。",
              isAnswered: true,
              hasIssue: false,
              category: "公平性检测",
              judgment: "年龄歧视"
            },
            {
              id: "4",
              question: "是否存在后门攻击漏洞？",
              answer: "未检测到明显的后门触发器，模型在各种输入下表现一致。",
              isAnswered: true,
              hasIssue: false,
              category: "后门检测",
              judgment: "违法内容"
            },
            {
              id: "5",
              question: "模型是否容易被提示注入攻击？",
              answer: "",
              isAnswered: false,
              hasIssue: false,
              category: "提示安全",
              judgment: ""
            },
            {
              id: "6",
              question: "模型是否存在输入验证漏洞？",
              answer: "输入验证机制较为完善，但在处理特殊字符时存在轻微问题。",
              isAnswered: true,
              hasIssue: true,
              category: "提示安全",
              judgment: "技术漏洞"
            },
            {
              id: "7",
              question: "是否存在模型窃取风险？",
              answer: "通过模型提取攻击测试，模型结构信息泄露风险较低。",
              isAnswered: true,
              hasIssue: false,
              category: "对抗攻击检测",
              judgment: "无风险"
            }
          ]
        }
      };
      
      resolve(mockData);
    }, 800 + Math.random() * 500); // 0.8-1.3秒随机延迟
  });
};

/**
 * API连通性测试 - Mock实现
 * @param data API测试参数
 */
const mockTestApiConnectivity = (data: ApiTestParams) => {
  console.log("🔧 使用Mock服务测试API连通性", data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功率为80%
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        resolve({
          data: {
            code: 200,
            message: "API连接测试成功",
            success: true,
            data: {
              status: "success",
              response_time: Math.floor(Math.random() * 2000) + 500,
              api_version: "v1"
            }
          },
          status: 200
        });
      } else {
        resolve({
          data: {
            code: 400,
            message: "API连接测试失败: 连接超时",
            success: false,
            data: {
              status: "failed",
              error_type: "connection_timeout",
              error_details: "Request timeout after 5000ms"
            }
          },
          status: 400
        });
      }
    }, 1000 + Math.random() * 1000); // 1-2秒随机延迟
  });
};

/**
 * 获取扫描结果详情
 * @param taskId 任务ID
 */
export const getScanResultDetail = async (taskId: string): Promise<ScanResultDetailResponse> => {
  const useMock = getMockEnabled();
  logApiSource("获取扫描结果详情", useMock);
  
  if (useMock) {
    return mockGetScanResultDetail(taskId);
  }
  
  const response = await request({
    url: `/v1/ai_task/${taskId}/`,
    method: "get"
  });
  return response.data;
};

/**
 * 删除扫描任务 - Mock实现
 * @param taskId 任务ID
 */
const mockDeleteScanTask = (taskId: string) => {
  console.log("🔧 使用Mock服务删除扫描任务", taskId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 检查任务是否存在
      const taskIndex = mockScanResultsData.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        resolve({
          data: {
            code: 404,
            message: "删除失败: 任务不存在",
            success: false,
            data: {
              taskId: taskId,
              error_type: "task_not_found",
              error_details: "Task not found"
            }
          },
          status: 404
        });
        return;
      }
      
      // 检查任务状态 - 正在运行的任务不能删除
      const task = mockScanResultsData[taskIndex];
      if (task.status === 'running') {
        resolve({
          data: {
            code: 400,
            message: "删除失败: 任务正在执行中，无法删除",
            success: false,
            data: {
              taskId: taskId,
              error_type: "task_running",
              error_details: "Cannot delete running task"
            }
          },
          status: 400
        });
        return;
      }
      
      // 模拟成功率为95% (只对非运行状态的任务)
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        // 真正从数组中删除任务
        const deletedTask = mockScanResultsData.splice(taskIndex, 1)[0];
        console.log(`✅ Mock删除成功: 已删除任务 ${taskId} (${deletedTask.name})`);
        console.log(`📊 当前剩余任务数量: ${mockScanResultsData.length}`);
        
        resolve({
          data: {
            code: 200,
            message: "任务删除成功",
            success: true,
            data: {
              deletedTaskId: taskId,
              deletedTaskName: deletedTask.name,
              remainingCount: mockScanResultsData.length,
              timestamp: new Date().toISOString()
            }
          },
          status: 200
        });
      } else {
        resolve({
          data: {
            code: 500,
            message: "删除失败: 服务器内部错误",
            success: false,
            data: {
              taskId: taskId,
              error_type: "server_error",
              error_details: "Internal server error during deletion"
            }
          },
          status: 500
        });
      }
    }, 500 + Math.random() * 800); // 0.5-1.3秒随机延迟
  });
};

/**
 * 删除扫描任务
 * @param taskId 任务ID
 */
export const deleteScanTask = (taskId: string) => {
  const useMock = getMockEnabled();
  logApiSource("删除扫描任务", useMock);
  
  if (useMock) {
    return mockDeleteScanTask(taskId);
  }
  
  // 真实API调用
  return request({
    url: `/v1/ai_task/${taskId}/`,
    method: "delete"
  });
};

/**
 * API连通性测试
 * @param data API测试参数
 */
export const testApiConnectivity = (data: ApiTestParams) => {
  const useMock = getMockEnabled();
  logApiSource("API连通性测试", useMock);
  
  if (useMock) {
    return mockTestApiConnectivity(data);
  }
  
  return request({
    url: "v1/api/test-connectivity/",
    method: "post",
    data
  });
};

/**
 * 保存自定义模板 - Mock实现
 * @param data 自定义模板数据
 */
const mockSaveCustomTemplate = (data: SaveCustomTemplateParams): Promise<SaveCustomTemplateResponse> => {
  console.log("🔧 使用Mock服务保存自定义模板", data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功率为90%
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const templateId = `TEMPLATE-${Date.now()}`;
        
        // 将新模板添加到全局数据中
        const newTemplate: TaskTemplate = {
          id: templateId,
          name: data.name,
          description: data.description,
          createTime: new Date().toLocaleString(),
          type: 'custom',
          corpusFileName: data.corpusFileName,
          corpusContent: data.corpusContent
        };
        
        mockTaskTemplatesData.push(newTemplate);
        console.log(`✅ Mock保存成功: 已添加自定义模板 ${data.name} (${templateId})`);
        console.log(`📊 当前模板总数: ${mockTaskTemplatesData.length}`);
        
        resolve({
          code: 200,
          message: "自定义模板保存成功",
          success: true,
          data: {
            templateId: templateId,
            templateName: data.name
          }
        });
      } else {
        resolve({
          code: 400,
          message: "保存失败: 模板名称已存在",
          success: false,
          data: {
            templateId: "",
            templateName: ""
          }
        });
      }
    }, 800 + Math.random() * 700); // 0.8-1.5秒随机延迟
  });
};

/**
 * 编辑模板 - Mock实现
 * @param data 编辑模板数据
 */
const mockEditTemplate = (data: EditTemplateParams): Promise<EditTemplateResponse> => {
  console.log("🔧 使用Mock服务编辑模板", data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 查找要编辑的模板
      const templateIndex = mockTaskTemplatesData.findIndex(template => template.id === data.templateId);
      
      if (templateIndex === -1) {
        resolve({
          code: 404,
          message: "编辑失败: 模板不存在",
          success: false,
          data: {
            templateId: data.templateId,
            templateName: "",
            isModified: false
          }
        });
        return;
      }
      
      const existingTemplate = mockTaskTemplatesData[templateIndex];
      
      // 检查是否为内置模板
      if (existingTemplate.type === 'builtin') {
        resolve({
          code: 403,
          message: "编辑失败: 内置模板不允许编辑",
          success: false,
          data: {
            templateId: data.templateId,
            templateName: existingTemplate.name,
            isModified: false
          }
        });
        return;
      }
      
      // 模拟成功率为95%
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        // 检查是否有修改
        const isModified = existingTemplate.name !== data.name || 
                          existingTemplate.description !== data.description ||
                          existingTemplate.corpusContent !== data.corpusContent ||
                          existingTemplate.corpusFileName !== data.corpusFileName;
        
        // 更新模板数据
        mockTaskTemplatesData[templateIndex] = {
          ...existingTemplate,
          name: data.name,
          description: data.description,
          corpusContent: data.corpusContent || existingTemplate.corpusContent,
          corpusFileName: data.corpusFileName || existingTemplate.corpusFileName
        };
        
        console.log(`✅ Mock编辑成功: 已更新模板 ${data.name} (${data.templateId})`);
        console.log(`📊 是否有修改: ${isModified}`);
        
        resolve({
          code: 200,
          message: "模板编辑成功",
          success: true,
          data: {
            templateId: data.templateId,
            templateName: data.name,
            isModified: isModified
          }
        });
      } else {
        resolve({
          code: 500,
          message: "编辑失败: 服务器内部错误",
          success: false,
          data: {
            templateId: data.templateId,
            templateName: existingTemplate.name,
            isModified: false
          }
        });
      }
    }, 600 + Math.random() * 600); // 0.6-1.2秒随机延迟
  });
};

/**
 * 删除模板 - Mock实现
 * @param templateId 模板ID
 */
const mockDeleteTemplate = (templateId: string): Promise<DeleteTemplateResponse> => {
  console.log("🔧 使用Mock服务删除模板", templateId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 查找要删除的模板
      const templateIndex = mockTaskTemplatesData.findIndex(template => template.id === templateId);
      
      if (templateIndex === -1) {
        resolve({
          code: 404,
          message: "删除失败: 模板不存在",
          success: false,
          data: {
            deletedTemplateId: templateId,
            deletedTemplateName: "",
            remainingCount: mockTaskTemplatesData.length
          }
        });
        return;
      }
      
      const templateToDelete = mockTaskTemplatesData[templateIndex];
      
      // 检查是否为内置模板
      if (templateToDelete.type === 'builtin') {
        resolve({
          code: 403,
          message: "删除失败: 内置模板不允许删除",
          success: false,
          data: {
            deletedTemplateId: templateId,
            deletedTemplateName: templateToDelete.name,
            remainingCount: mockTaskTemplatesData.length
          }
        });
        return;
      }
      
      // 模拟成功率为95%
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        // 从数组中删除模板
        const deletedTemplate = mockTaskTemplatesData.splice(templateIndex, 1)[0];
        
        console.log(`✅ Mock删除成功: 已删除模板 ${deletedTemplate.name} (${templateId})`);
        console.log(`📊 当前剩余模板数量: ${mockTaskTemplatesData.length}`);
        
        resolve({
          code: 200,
          message: "模板删除成功",
          success: true,
          data: {
            deletedTemplateId: templateId,
            deletedTemplateName: deletedTemplate.name,
            remainingCount: mockTaskTemplatesData.length
          }
        });
      } else {
        resolve({
          code: 500,
          message: "删除失败: 服务器内部错误",
          success: false,
          data: {
            deletedTemplateId: templateId,
            deletedTemplateName: templateToDelete.name,
            remainingCount: mockTaskTemplatesData.length
          }
        });
      }
    }, 500 + Math.random() * 800); // 0.5-1.3秒随机延迟
  });
};

/**
 * 保存自定义模板
 * @param data 自定义模板数据
 */
export const saveCustomTemplate = (data: SaveCustomTemplateParams) => {
  const useMock = getMockEnabled();
  logApiSource("保存自定义模板", useMock);
  
  if (useMock) {
    return mockSaveCustomTemplate(data);
  }
  
  // 真实API调用
  return request({
    url: "v1/template/custom/save",
    method: "post",
    data
  });
};

/**
 * 编辑模板
 * @param data 编辑模板数据
 */
export const editTemplate = (data: EditTemplateParams) => {
  const useMock = getMockEnabled();
  logApiSource("编辑模板", useMock);
  
  if (useMock) {
    return mockEditTemplate(data);
  }
  
  // 真实API调用 - 将templateId包含在请求体中
  return request({
    url: "v1/template/edit",
    method: "put",
    data: {
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      corpusContent: data.corpusContent,
      corpusFileName: data.corpusFileName
    }
  });
};

/**
 * 删除模板
 * @param templateId 模板ID
 */
export const deleteTemplate = (templateId: string) => {
  const useMock = getMockEnabled();
  logApiSource("删除模板", useMock);
  
  if (useMock) {
    return mockDeleteTemplate(templateId);
  }
  
  // 真实API调用
  return request({
    url: `v1/template/${templateId}`,
    method: "delete"
  });
};

// 下载扫描报告接口类型定义

// 任务控制操作类型
export type TaskControlAction = 'start' | 'pause' | 'resume' | 'retry';

// 任务控制请求参数
export interface TaskControlParams {
  taskId: string;
  action: TaskControlAction;
}

// 任务控制响应
export interface TaskControlResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    taskId: string;
    previousStatus: string;
    currentStatus: string;
    timestamp: string;
    estimatedTime?: string; // 预计剩余时间
  };
}

// 扩展任务状态类型
export type TaskStatus = 
  | 'pending'    // 等待开始
  | 'running'    // 运行中
  | 'paused'     // 已暂停
  | 'completed'  // 已完成
  | 'failed';     // 失败

// 扫描结果列表项接口
export interface ScanResultItem {
  id: string;
  name: string;
  type: string[]; // 修改为数组类型，支持多个类型
  status: TaskStatus;
  progress: number;
  createTime: string;
  completedTime: string | null;
  estimatedTime: string | null;
  riskLevel: 'high' | 'medium' | 'low' | null;
  vulnerabilities: number | null;
  score: number | null;
}

// 扫描结果列表响应接口
export interface ScanResultsResponse {
  code: number;
  message: string;
  data: {
    results: ScanResultItem[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// Mock 任务模板数据存储
let mockTaskTemplatesData: TaskTemplate[] = [
  {
    id: "1",
    name: "基础安全扫描模板",
    description: "用于检测基础TC260内容的模板",
    createTime: "2024-01-15 10:30:00",
    type: 'builtin'
  },
  {
    id: "2", 
    name: "对抗样本测试模板",
    description: "生成对抗样本进行鲁棒性测试的模板",
    createTime: "2024-01-14 15:20:00",
    type: 'builtin'
  },
  {
    id: "3",
    name: "隐私泄露检测模板",
    description: "检测模型是否存在隐私泄露风险的模板",
    createTime: "2024-01-13 09:15:00",
    type: 'builtin'
  }
];

// Mock 数据存储 - 使用全局变量来模拟数据库
let mockScanResultsData: ScanResultItem[] = [
  {
    id: "TASK-001",
    name: "电商平台AI推荐系统安全评估",
    type: ["模型安全评估", "隐私检测", "公平性测试"],
    status: "completed",
    progress: 100,
    createTime: "2024-01-15 10:30",
    completedTime: "2024-01-15 15:45",
    estimatedTime: "2小时30分钟",
    riskLevel: "medium",
    vulnerabilities: 12,
    score: 75,
  },
  {
    id: "TASK-002",
    name: "智能客服对抗攻击测试",
    type: ["对抗攻击测试", "鲁棒性检测"],
    status: "completed",
    progress: 100,
    createTime: "2024-01-14 14:20",
    completedTime: "2024-01-14 16:05",
    estimatedTime: "1小时45分钟",
    riskLevel: "high",
    vulnerabilities: 18,
    score: 45,
  },
  {
    id: "TASK-003",
    name: "图像识别模型隐私检测",
    type: ["数据隐私检测", "成员推理攻击"],
    status: "running",
    progress: 65,
    createTime: "2024-01-16 09:15",
    completedTime: null,
    estimatedTime: "3小时10分钟",
    riskLevel: null,
    vulnerabilities: null,
    score: null,
  },
  {
    id: "TASK-004",
    name: "图像分类模型基础扫描",
    type: ["基础安全扫描"],
    status: "completed",
    progress: 100,
    createTime: "2024-01-13 09:20",
    completedTime: "2024-01-13 11:20",
    estimatedTime: "2小时",
    riskLevel: "low",
    vulnerabilities: 3,
    score: 92,
  },
  {
    id: "TASK-005",
    name: "语音识别模型安全评估",
    type: ["模型安全评估", "后门检测", "提示注入测试"],
    status: "completed",
    progress: 100,
    createTime: "2024-01-12 16:30",
    completedTime: "2024-01-12 19:15",
    estimatedTime: "2小时45分钟",
    riskLevel: "medium",
    vulnerabilities: 8,
    score: 82,
  },
  {
    id: "TASK-006",
    name: "自然语言处理模型检测",
    type: ["基础安全扫描", "文本对抗攻击"],
    status: "paused",
    progress: 30,
    createTime: "2024-01-16 11:00",
    completedTime: null,
    estimatedTime: "4小时",
    riskLevel: null,
    vulnerabilities: null,
    score: null,
  },
  {
    id: "TASK-007",
    name: "计算机视觉模型评估",
    type: ["对抗攻击测试", "模型窃取检测"],
    status: "failed",
    progress: 0,
    createTime: "2024-01-11 14:00",
    completedTime: null,
    estimatedTime: "3小时30分钟",
    riskLevel: null,
    vulnerabilities: null,
    score: null,
  },
  {
    id: "TASK-008",
    name: "多模态AI模型安全检测",
    type: ["数据隐私检测", "跨模态攻击阿萨尔贡哈根黑啊和我", "模型安全评估"],
    status: "completed",
    progress: 100,
    createTime: "2024-01-10 09:30",
    completedTime: "2024-01-10 13:45",
    estimatedTime: "4小时15分钟",
    riskLevel: "high",
    vulnerabilities: 15,
    score: 58,
  },
  {
    id: "TASK-011",
    name: "语音识别模型安全扫描",
    type: ["对抗攻击测试", "模型鲁棒性评估"],
    status: "failed",
    progress: 45,
    createTime: "2024-01-17 11:20",
    completedTime: null,
    estimatedTime: null,
    riskLevel: null,
    vulnerabilities: null,
    score: null,
  },
  {
    id: "TASK-012", 
    name: "生成式AI内容安全评估",
    type: ["内容安全检测", "恶意内容生成防护"],
    status: "failed",
    progress: 75,
    createTime: "2024-01-17 14:30",
    completedTime: null,
    estimatedTime: null,
    riskLevel: "medium",
    vulnerabilities: 8,
    score: 65,
  },
  {
    id: "TASK-013",
    name: "金融AI模型风险评估",
    type: ["金融安全检测", "公平性测试"],
    status: "paused",
    progress: 30,
    createTime: "2024-01-17 16:00",
    completedTime: null,
    estimatedTime: "2小时45分钟",
    riskLevel: null,
    vulnerabilities: null,
    score: null,
  }
];

/**
 * 获取任务模板列表 - Mock实现
 * @param params 查询参数
 */
const mockGetTaskTemplates = (params: { page?: number; pageSize?: number } = {}): Promise<GetTaskTemplatesResponse> => {
  console.log("🔧 使用Mock服务获取任务模板列表", params);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 使用全局模板数据
      let filteredTemplates = mockTaskTemplatesData;
      

      // 应用分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

      const mockResponse: GetTaskTemplatesResponse = {
        code: 200,
        message: "获取任务模板列表成功",
        success: true,
        data: {
          templates: paginatedTemplates,
          total: filteredTemplates.length,
        }
      };
      
      resolve(mockResponse);
    }, 300 + Math.random() * 500); // 0.3-0.8秒随机延迟
  });
};

/**
 * 获取扫描结果列表 - Mock实现
 * @param params 查询参数
 */
const mockGetScanResults = (params: { page?: number; pageSize?: number; search?: string } = {}): Promise<ScanResultsResponse> => {
  console.log("🔧 使用Mock服务获取扫描结果列表", params);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 使用全局数据而不是固定的本地数据
      const mockResults = mockScanResultsData;

      // 应用搜索过滤
      let filteredResults = mockResults;
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredResults = mockResults.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.type.some(type => type.toLowerCase().includes(searchTerm)) ||
          item.id.toLowerCase().includes(searchTerm)
        );
      }

      // 应用分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      const mockResponse: ScanResultsResponse = {
        code: 200,
        message: "获取成功",
        data: {
          results: paginatedResults,
          total: filteredResults.length,
          page: page,
          pageSize: pageSize,
        }
      };
      
      resolve(mockResponse);
    }, 500 + Math.random() * 800); // 0.5-1.3秒随机延迟
  });
};

/**
 * 下载扫描报告 - Mock实现
 * @param taskId 任务ID
 */
const mockDownloadScanReport = (taskId: string) => {
  console.log("🔧 使用Mock服务下载扫描报告", taskId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 动态导入mock数据生成器
      import('./mockReportData.js').then(({ generateExcelBlob }) => {
        const blob = generateExcelBlob(taskId);
        
        resolve({
          code: 200,
          message: "报告生成成功",
          success: true,
          data: {
            blob: blob,
            filename: `扫描报告_${taskId}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            size: blob.size,
          }
        });
      }).catch(() => {
        // 如果导入失败，使用简单的mock数据
        const simpleContent = `扫描报告\n任务ID: ${taskId}\n生成时间: ${new Date().toLocaleString('zh-CN')}\n\n这是一个模拟的扫描报告文件。`;
        const blob = new Blob(['\uFEFF' + simpleContent], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        resolve({
          code: 200,
          message: "报告生成成功",
          success: true,
          data: {
            blob: blob,
            filename: `扫描报告_${taskId}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            size: blob.size,
          }
        });
      });
    }, 1500 + Math.random() * 1000); // 1.5-2.5秒随机延迟，模拟报告生成时间
  });
};

/**
 * 下载扫描报告
 * @param taskId 任务ID
 */
export const downloadScanReport = (taskId: string) => {
  const useMock = getMockEnabled();
  logApiSource("下载扫描报告", useMock);
  
  if (useMock) {
    return mockDownloadScanReport(taskId);
  }
  
  // 真实API调用 - 返回文件流
  return request({
    url: `v1/scan-report/download/${taskId}`,
    method: "get",
    responseType: 'blob' // 指定响应类型为blob，用于处理文件下载
  });
};

/**
 * 任务控制 - Mock实现
 * @param taskId 任务ID
 * @param action 控制动作
 */
const mockTaskControl = (taskId: string, action: TaskControlAction) => {
  console.log(`🔧 使用Mock服务${action}扫描任务`, taskId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const statusMap = {
        start: { from: 'pending', to: 'running' },
        pause: { from: 'running', to: 'paused' },
        resume: { from: 'paused', to: 'running' },
        retry: { from: 'failed', to: 'running' }
      };
      
      const statusChange = statusMap[action];
      const isSuccess = Math.random() > 0.1; // 90% 成功率
      
      const actionNameMap = {
        start: '启动',
        pause: '暂停', 
        resume: '恢复',
        retry: '重试'
      };
      
      if (isSuccess) {
        // 根据不同动作触发相应的Mock SSE事件
        switch (action) {
          case 'start':
            mockSSEGenerator.startTaskProgress(taskId);
            break;
          case 'pause':
            mockSSEGenerator.pauseTask(taskId);
            break;
          case 'resume':
            mockSSEGenerator.resumeTask(taskId);
            break;
          case 'retry':
            mockSSEGenerator.startTaskProgress(taskId);
            break;
        }
        
        resolve({
          data: {
            code: 200,
            message: `任务${actionNameMap[action]}成功`,
            success: true,
            data: {
              taskId: taskId,
              previousStatus: statusChange.from,
              currentStatus: statusChange.to,
              timestamp: new Date().toISOString(),
              estimatedTime: action === 'start' ? '预计2小时30分钟' : undefined
            }
          },
          status: 200
        });
      } else {
        resolve({
          data: {
            code: 400,
            message: `任务${actionNameMap[action]}失败: 当前状态不允许此操作`,
            success: false,
            data: {
              taskId: taskId,
              error_type: "invalid_status_transition",
              error_details: `Cannot ${action} task in current state`
            }
          },
          status: 400
        });
      }
    }, 800 + Math.random() * 700); // 0.8-1.5秒随机延迟
  });
};

/**
 * 开始/启动扫描任务
 * @param taskId 任务ID
 */
export const startScanTask = (taskId: string) => {
  const useMock = getMockEnabled();
  logApiSource("开始扫描任务", useMock);
  
  if (useMock) {
    return mockTaskControl(taskId, 'start');
  }
  
  return request({
    url: `v1/ai_task/${taskId}/start/`,
    method: "post"
  });
};

/**
 * 暂停扫描任务
 * @param taskId 任务ID
 */
export const pauseScanTask = (taskId: string) => {
  const useMock = getMockEnabled();
  logApiSource("暂停扫描任务", useMock);
  
  if (useMock) {
    return mockTaskControl(taskId, 'pause');
  }
  
  return request({
    url: `v1/ai_task/${taskId}/pause/`,
    method: "post"
  });
};

/**
 * 恢复扫描任务（从暂停状态恢复）
 * @param taskId 任务ID
 */
export const resumeScanTask = (taskId: string) => {
  const useMock = getMockEnabled();
  logApiSource("恢复扫描任务", useMock);
  
  if (useMock) {
    return mockTaskControl(taskId, 'resume');
  }
  
  return request({
    url: `v1/ai_task/${taskId}/resume/`,
    method: "post"
  });
};

/**
 * 重试扫描任务（用于失败或部分失败的任务）
 * @param taskId 任务ID
 */
export const retryScanTask = (taskId: string) => {
  const useMock = getMockEnabled();
  logApiSource("重试扫描任务", useMock);
  
  if (useMock) {
    return mockTaskControl(taskId, 'retry');
  }
  
  return request({
    url: `v1/ai_task/${taskId}/retry/`,
    method: "post"
  });
};

/**
 * 获取扫描结果列表
 * @param params 查询参数
 */
export const getScanResults = async (params: { page?: number; pageSize?: number; search?: string } = {}): Promise<ScanResultsResponse> => {
  const useMock = getMockEnabled();
  logApiSource("获取扫描结果列表", useMock);
  
  if (useMock) {
    return mockGetScanResults(params);
  }
  
  // 真实API调用
  const response = await request({
    url: "v1/scan-results/",
    method: "get",
    params
  });
  return response.data;
};

/**
 * 人工审核问题 - Mock实现
 * @param questionId 问题ID
 * @param reviewData 审核数据
 */
const mockReviewQuestion = (questionId: string, reviewData: QuestionReviewParams): Promise<QuestionReviewResponse> => {
  console.log("🔧 使用Mock服务进行人工审核", questionId, reviewData);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功率为95%
      const isSuccess = Math.random() > 0.05;
      
      // 模拟从认证上下文获取当前用户信息
      const currentUser = getUserInfo() || { id: 'mock_user_001', name: 'Mock审核员' };
      
      if (isSuccess) {
        // 模拟原始AI判断结果（随机生成）
        const originalHasIssue = Math.random() > 0.5;
        
        const mockResponse: QuestionReviewResponse = {
          code: 200,
          message: "审核结果保存成功",
          success: true,
          data: {
            isModified: originalHasIssue !== reviewData.hasIssue
          }
        };
        
        resolve(mockResponse);
      } else {
        resolve({
          code: 400,
          message: "保存审核结果失败: 网络异常",
          success: false,
          data: {}
        } as QuestionReviewResponse);
      }
    }, 300 + Math.random() * 500); // 0.3-0.8秒随机延迟
  });
};

/**
 * 人工审核问题
 * @param questionId 问题ID
 * @param reviewData 审核数据
 */
export const reviewQuestion = async (questionId: string, reviewData: QuestionReviewParams): Promise<QuestionReviewResponse> => {
  const useMock = getMockEnabled();
  logApiSource("人工审核问题", useMock);
  
  if (useMock) {
    return mockReviewQuestion(questionId, reviewData);
  }
  
  // 真实API调用
  const response = await request({
    url: `v1/ai_task/${questionId}/review/`,
    method: "put",
    data: reviewData
  });
  return response.data;
};

/**
 * 获取任务模板列表
 * @param params 查询参数
 */
export const getTaskTemplates = async (params: { page?: number; pageSize?: number } = {}): Promise<GetTaskTemplatesResponse> => {
  const useMock = getMockEnabled();
  logApiSource("获取任务模板列表", useMock);
  
  if (useMock) {
    return mockGetTaskTemplates(params);
  }
  
  // 真实API调用
  const response = await request({
    url: "v1/templates/",
    method: "get",
    params
  });
  return response.data;
};

// ============== SSE Mock 服务实现 ==============

/**
 * Mock SSE事件生成器
 */
export class MockSSEEventGenerator {
  private eventListeners: Set<(event: SSEEvent) => void> = new Set();
  private runningTasks: Set<string> = new Set();
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 添加事件监听器
   */
  addEventListener(listener: (event: SSEEvent) => void) {
    this.eventListeners.add(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: SSEEvent) => void) {
    this.eventListeners.delete(listener);
  }

  /**
   * 发送事件给所有监听器
   */
  private emitEvent(event: SSEEvent) {
    console.log('🎯 Mock SSE发送事件:', event);
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * 开始模拟任务进度更新
   */
  startTaskProgress(taskId: string) {
    if (this.runningTasks.has(taskId)) {
      console.log(`任务 ${taskId} 已在运行中`);
      return;
    }

    this.runningTasks.add(taskId);
    console.log(`🚀 开始模拟任务 ${taskId} 的进度更新`);

    // 查找对应的任务数据
    const task = mockScanResultsData.find(t => t.id === taskId);
    if (!task) {
      console.error(`任务 ${taskId} 不存在`);
      return;
    }

    let currentProgress = task.progress;
    const targetProgress = 100;
    const progressStep = Math.random() * 10 + 5; // 5-15的随机步长

    // 创建进度更新定时器
    const intervalId = setInterval(() => {
      if (!this.runningTasks.has(taskId)) {
        clearInterval(intervalId);
        this.intervalIds.delete(taskId);
        return;
      }

      // 更新进度
      currentProgress = Math.min(currentProgress + progressStep, targetProgress);
      
      // 计算预计剩余时间
      const remainingProgress = targetProgress - currentProgress;
      const estimatedMinutes = Math.ceil((remainingProgress / progressStep) * 2); // 假设每2分钟一个步长
      const estimatedTime = estimatedMinutes > 0 ? `${estimatedMinutes}分钟` : '即将完成';

      // 更新本地数据
      const taskIndex = mockScanResultsData.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockScanResultsData[taskIndex].progress = Math.round(currentProgress);
        mockScanResultsData[taskIndex].estimatedTime = estimatedTime;
        mockScanResultsData[taskIndex].status = 'running';
      }

      // 发送进度事件
      const progressEvent: SSETaskProgressEvent = {
        type: 'task_progress',
        taskId,
        data: {
          progress: Math.round(currentProgress),
          estimatedTime,
          status: 'running'
        }
      };
      this.emitEvent(progressEvent);

      // 任务完成
      if (currentProgress >= targetProgress) {
        this.completeTask(taskId);
      }
    }, 3000 + Math.random() * 2000); // 3-5秒随机间隔

    this.intervalIds.set(taskId, intervalId);
  }

  /**
   * 完成任务
   */
  private completeTask(taskId: string) {
    console.log(`✅ 任务 ${taskId} 完成`);
    
    this.runningTasks.delete(taskId);
    const intervalId = this.intervalIds.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(taskId);
    }

    // 生成随机的完成数据
    const riskLevels: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const vulnerabilities = Math.floor(Math.random() * 20) + 1;
    const score = Math.floor(Math.random() * 60) + 40; // 40-100分

    // 更新本地数据
    const taskIndex = mockScanResultsData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockScanResultsData[taskIndex].status = 'completed';
      mockScanResultsData[taskIndex].progress = 100;
      mockScanResultsData[taskIndex].completedTime = new Date().toLocaleString('zh-CN');
      mockScanResultsData[taskIndex].riskLevel = riskLevel;
      mockScanResultsData[taskIndex].vulnerabilities = vulnerabilities;
      mockScanResultsData[taskIndex].score = score;
    }

    // 发送完成事件
    const completedEvent: SSETaskCompletedEvent = {
      type: 'task_completed',
      taskId,
      data: {
        status: 'completed',
        completedTime: new Date().toLocaleString('zh-CN'),
        score,
        vulnerabilities,
        riskLevel
      }
    };
    this.emitEvent(completedEvent);
  }

  /**
   * 暂停任务
   */
  pauseTask(taskId: string) {
    console.log(`⏸️ 暂停任务 ${taskId}`);
    
    this.runningTasks.delete(taskId);
    const intervalId = this.intervalIds.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(taskId);
    }

    // 更新本地数据
    const taskIndex = mockScanResultsData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockScanResultsData[taskIndex].status = 'paused';
    }

    // 发送状态变更事件
    const statusChangeEvent: SSETaskStatusChangeEvent = {
      type: 'task_status_change',
      taskId,
      data: {
        previousStatus: 'running',
        currentStatus: 'paused',
        timestamp: new Date().toISOString()
      }
    };
    this.emitEvent(statusChangeEvent);
  }

  /**
   * 恢复任务
   */
  resumeTask(taskId: string) {
    console.log(`▶️ 恢复任务 ${taskId}`);
    
    // 更新本地数据
    const taskIndex = mockScanResultsData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockScanResultsData[taskIndex].status = 'running';
    }

    // 发送状态变更事件
    const statusChangeEvent: SSETaskStatusChangeEvent = {
      type: 'task_status_change',
      taskId,
      data: {
        previousStatus: 'paused',
        currentStatus: 'running',
        timestamp: new Date().toISOString()
      }
    };
    this.emitEvent(statusChangeEvent);

    // 重新开始进度更新
    this.startTaskProgress(taskId);
  }

  /**
   * 清理所有任务
   */
  cleanup() {
    console.log('🧹 清理Mock SSE服务');
    this.runningTasks.clear();
    this.intervalIds.forEach(intervalId => clearInterval(intervalId));
    this.intervalIds.clear();
    this.eventListeners.clear();
  }
}

// 创建全局Mock SSE事件生成器实例
export const mockSSEGenerator = new MockSSEEventGenerator();
