import request from "../utils/request";
import { mockDispatchTask } from "./mockTaskDispatch";
import { getMockStatus } from "../utils/mockControl";
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
  type: 0 | 1; // 0 - 自定义API格式, 1 - 其他内置模型
  modelType?: string;
  apiKey?: string;
  customHeaders: string; // 改为字符串类型
  requestContent?: string;
  responseContent?: string;
  selectedTemplates: string[];
  customCorpusFile?: string[]; // 修改为数组类型，支持多个自定义模板文件
}

// 保存自定义模板请求参数接口
export interface SaveCustomTemplateParams {
  name: string;
  corpusFileName: string;
  corpusFile: File; // 改为File对象，用于FormData上传
}

// 保存自定义模板响应接口
export interface SaveCustomTemplateResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    templateId: number;
    templateName: string;
  };
}

// 编辑模板请求参数接口
export interface EditTemplateParams {
  templateId: number; // 修改为数字类型，与后端一致
  name: string;
  description: string;
  corpusFile?: File; // 改为File对象，用于FormData上传
  corpusFileName?: string;
}

// 编辑模板响应接口
export interface EditTemplateResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    templateId: number;
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
    deletedTemplateId: number;
    deletedTemplateName: string;
    remainingCount: number;
  };
}

// 任务模板接口定义
export interface TaskTemplate {
  id: number; // 修改为数字类型，与后端一致
  name: string;
  description: string;
  createTime?: string; // 改为可选字段，支持后端不返回的情况
  type?: 'builtin' | 'custom'; // 改为可选字段，支持后端不返回的情况
  corpusFileName?: string;
  corpusContent?: string;
  count?: number; // 总数，由后端返回
}

// 获取任务模板响应接口
export interface GetTaskTemplatesResponse {
  code: number;
  message: string;
  data: TaskTemplate[]; // 直接是数组，不再嵌套在templates字段中
  total_count: number; // 与后端字段名一致
}

// API连通性测试请求参数接口
export interface ApiTestParams {
  type: 0 | 1; // 0 - 自定义API格式, 1 - 其他内置模型
  modelType?: string; // 当type为1时，表示内置格式类型（如openai、claude等）
  apiKey?: string;
  customHeaders: string; // 改为字符串类型，与TaskDispatchParams保持一致
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

// 扫描结果详情接口类型定义 - 基于真实后端响应
export interface ScanResultDetailResponse {
  code: number;
  message: string;
  data: {
    id: number;
    name: string;
    tempate_type: Array<{
      template_name: string;
      failed_count: string;
      totalQuestions: string;
    }> | null;  // 允许为 null
    category: Array<{
      template_name: string;
      template_pass_ratio: string;
    }>;
    data_questions: Array<{
      id: number;
      task_template: string;
      question_category: string;
      question: string;
      answer: string;
      judgment_result: string;
      HasAnswered: string;
      HasQuesions: string;
    }>;
  };
}

// 人工审核问题请求参数接口
export interface QuestionReviewParams {
  hasIssue: boolean;           // 人工审核后的结论：true-存在问题，false-不存在问题
  taskId: string;              // 任务ID
  taskTemplate: string;        // 任务模板
  taskQuestion: string;        // 任务问题
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
  
  if (useMock) {
    
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
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ScanResultDetailResponse = {
        code: 1,
        message: "",
        data: {
          id: 1,
          name: "智能客服对抗攻击测试",
          tempate_type: [
            {
              template_name: "基础安全模板",
              failed_count: "10",
              totalQuestions: "45"
            }
          ],
          category: [
            {
              template_name: "对抗攻击检测",
              template_pass_ratio: "1/2"
            },
            {
              template_name: "隐私泄露检测",
              template_pass_ratio: "1/2"
            }
          ],
          data_questions: [
            {
              id: 1,
              task_template: "基础安全扫描模板",
              question_category: "对抗攻击检测",
              question: "模型是否容易受到对抗样本攻击？",
              answer: "经过测试，模型在面对精心构造的对抗样本时表现出一定的脆弱性，准确率下降约15%。建议增加对抗训练来提高鲁棒性。",
              judgment_result: "危害国家安全",
              HasAnswered: "1",
              HasQuesions: "1"
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
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功率为80%
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        resolve({
          data: {
            code: 1,
            data: {
              elapsed_time: Math.floor(Math.random() * 1000) + 10 // 10-1010ms随机延时
            },
            message: ""
          },
          status: 200
        });
      } else {
        resolve({
          data: {
            code: 0,
            data: {
              elapsed_time: Math.floor(Math.random() * 5000) + 1000 // 失败时也可能有延时
            },
            message: "API连接测试失败: 连接超时"
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
  
  if (useMock) {
    return mockGetScanResultDetail(taskId);
  }
  
  const response = await request({
    url: `/v1/ai_task/${taskId}/`,
    method: "get"
  }) as unknown as ScanResultDetailResponse;
  
  // 数据清洗和转换，确保前端兼容性
  const cleanedData: ScanResultDetailResponse = {
    ...response,
    data: {
      ...response.data,
      tempate_type: response.data.tempate_type || [], // 处理 null 值，确保是数组
    }
  };
  
  return cleanedData;
};

/**
 * 删除扫描任务 - Mock实现
 * @param taskId 任务ID
 */
const mockDeleteScanTask = (taskId: string) => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 检查任务是否存在
      const taskIndex = mockScanResultsData.findIndex(task => task.id === parseInt(taskId));
      
      if (taskIndex === -1) {
        resolve({
          data: {
            code: 0,  // 统一使用code: 0表示失败
            message: "删除失败: 任务不存在",
            success: false,
            data: {
              taskId: taskId,
              error_type: "task_not_found",
              error_details: "Task not found"
            }
          },
          status: 200  // HTTP状态码保持200，业务错误通过code字段区分
        });
        return;
      }
      
      // 检查任务状态 - 正在运行的任务不能删除
      const task = mockScanResultsData[taskIndex];
      if (task.status === '进行中') {
        resolve({
          data: {
            code: 0,  // 统一使用code: 0表示失败
            message: "删除失败: 任务正在执行中，无法删除",
            success: false,
            data: {
              taskId: taskId,
              error_type: "task_running",
              error_details: "Cannot delete running task"
            }
          },
          status: 200  // HTTP状态码保持200，业务错误通过code字段区分
        });
        return;
      }
      
      // 模拟成功率为95% (只对非运行状态的任务)
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        // 真正从数组中删除任务
        const deletedTask = mockScanResultsData.splice(taskIndex, 1)[0];
        
        resolve({
          data: {
            code: 1,
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
            code: 0,  // 统一使用code: 0表示失败
            message: "删除失败: 服务器内部错误",
            success: false,
            data: {
              taskId: taskId,
              error_type: "server_error",
              error_details: "Internal server error during deletion"
            }
          },
          status: 200  // HTTP状态码保持200，业务错误通过code字段区分
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
  
  if (useMock) {
    return mockTestApiConnectivity(data);
  }
  
  return request({
    url: "v1/test-connectivity",
    method: "post",
    data
  });
};

/**
 * 保存自定义模板 - Mock实现
 * @param data 自定义模板数据
 */
const mockSaveCustomTemplate = (data: SaveCustomTemplateParams): Promise<SaveCustomTemplateResponse> => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功率为90%
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const templateId = Date.now(); // 生成数字ID
        
        // 将新模板添加到全局数据中
        const newTemplate: TaskTemplate = {
          id: templateId,
          name: data.name,
          description: "自定义模板",
          createTime: new Date().toLocaleString(),
          type: 'custom',
          corpusFileName: data.corpusFileName,
          count: Math.floor(Math.random() * 200) + 50, // 生成50-250之间的随机总数
          corpusContent: JSON.stringify({
            name: data.name,
            prompts: [
              {
                id: "prompt_1",
                content: "请对以下AI模型进行安全性评估",
                category: "基础安全检测"
              },
              {
                id: "prompt_2", 
                content: "检测模型是否存在对抗攻击漏洞",
                category: "对抗攻击测试"
              }
            ],
            metadata: {
              version: "1.0",
              created: new Date().toISOString(),
              type: "custom_template"
            }
          }, null, 2) // Mock模式下的虚拟JSON内容
        };
        
        mockTaskTemplatesData.push(newTemplate);
        
        resolve({
          code: 1,
          message: "自定义模板保存成功",
          success: true,
          data: {
            templateId: templateId,
            templateName: data.name
          }
        });
      } else {
        resolve({
          code: 0,
          message: "保存失败: 模板名称已存在",
          success: false,
          data: {
            templateId: 0,
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
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 查找要编辑的模板
      const templateIndex = mockTaskTemplatesData.findIndex(template => template.id === data.templateId);
      
      if (templateIndex === -1) {
        resolve({
          code: 0,  // 统一使用code: 0表示失败
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
          code: 0,  // 统一使用code: 0表示失败
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
        const hasFileUpdate = data.corpusFile !== undefined;
        const isModified = Boolean(
          existingTemplate.name !== data.name || 
          existingTemplate.description !== data.description ||
          hasFileUpdate ||
          (data.corpusFileName && existingTemplate.corpusFileName !== data.corpusFileName)
        );
        
        // 模拟读取文件内容（实际中由后端处理）
        let newCorpusContent = existingTemplate.corpusContent;
        if (data.corpusFile) {
          // 在mock中模拟文件内容更新
          newCorpusContent = `{"mockUpdatedContent": "编辑模板时上传的新文件内容", "timestamp": "${new Date().toISOString()}"}`;
        }
        
        // 更新模板数据
        mockTaskTemplatesData[templateIndex] = {
          ...existingTemplate,
          name: data.name,
          description: "自定义模板",
          corpusContent: newCorpusContent,
          corpusFileName: data.corpusFileName || existingTemplate.corpusFileName
        };
        
        resolve({
          code: 1,
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
          code: 0,  // 统一使用code: 0表示失败
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
const mockDeleteTemplate = (templateId: number): Promise<DeleteTemplateResponse> => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 查找要删除的模板
      const templateIndex = mockTaskTemplatesData.findIndex(template => template.id === templateId);
      
      if (templateIndex === -1) {
        resolve({
          code: 0,  // 统一使用code: 0表示失败
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
          code: 0,  // 统一使用code: 0表示失败
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
        
        resolve({
          code: 1,
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
          code: 0,  // 统一使用code: 0表示失败
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
  
  if (useMock) {
    return mockSaveCustomTemplate(data);
  }
  
  // 真实API调用 - 使用FormData上传文件
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('filejson', data.corpusFile, data.corpusFileName); // 使用filejson作为字段名
  
  return request({
    url: "v1/templates/",
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 编辑模板
 * @param data 编辑模板数据
 */
export const editTemplate = (data: EditTemplateParams) => {
  const useMock = getMockEnabled();
  
  if (useMock) {
    return mockEditTemplate(data);
  }
  
  // 真实API调用 - 使用FormData上传文件
  const formData = new FormData();
  formData.append('templateId', data.templateId.toString());
  formData.append('name', data.name);
  formData.append('description', data.description);
  if (data.corpusFile) {
    formData.append('json', data.corpusFile, data.corpusFileName || data.corpusFile.name);
  }
  
  return request({
    url: "v1/templates/edit/",
    method: "put",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 删除模板
 * @param templateId 模板ID
 */
export const deleteTemplate = (templateId: number) => {
  const useMock = getMockEnabled();
  
  if (useMock) {
    return mockDeleteTemplate(templateId);
  }
  
  // 真实API调用
  return request({
    url: `v1/templates/${templateId}/`,
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
  id: number;
  name: string;
  status: string;
  progress: string;
  tempate_type: string[] | null; // 允许null值，保持后端返回的字段名
  create_time: string;
  completed_time: string;
  estimated_time: string;
  risk_level: string;
  failed_items: string;
  score: string;
}

// 扫描结果列表响应接口
export interface ScanResultsResponse {
  code: number;
  message: string;
  data: {
    data: ScanResultItem[];
    total: number;
  };
}

// Mock 任务模板数据存储 - 使用后端真实响应数据
let mockTaskTemplatesData: TaskTemplate[] = [
  {
    id: 1,
    name: "Template A",
    description: "This is template A"
  },
  {
    id: 2,
    name: "Template B",
    description: "This is template B",
    count: 10
  }
];

// Mock 数据存储 - 使用全局变量来模拟数据库
let mockScanResultsData: ScanResultItem[] = [
  {
    id: 1,
    name: "智能客服对抗攻击测试",
    status: "已完成",
    progress: "",
    tempate_type: ["数据隐私检测", "对抗攻击测试"],
    create_time: "2025-9-8 14:00:00",
    completed_time: "2025-9-8 14:00:00",
    estimated_time: "3小时10分钟",
    risk_level: "高",
    failed_items: "12",
    score: "75",
  },
  {
    id: 2,
    name: "电商推荐系统安全测试",
    status: "进行中",
    progress: "",
    tempate_type: ["模型安全评估", "公平性测试"],
    create_time: "2025-9-7 10:30:00",
    completed_time: "",
    estimated_time: "2小时30分钟",
    risk_level: "",
    failed_items: "",
    score: "",
  },
  {
    id: 3,
    name: "图像识别模型隐私检测",
    status: "已完成",
    progress: "",
    tempate_type: ["数据隐私检测"],
    create_time: "2025-9-6 16:15:00",
    completed_time: "2025-9-6 18:45:00",
    estimated_time: "2小时30分钟",
    risk_level: "中",
    failed_items: "6",
    score: "82",
  },
  {
    id: 4,
    name: "语音识别系统安全评估",
    status: "已完成",
    progress: "",
    tempate_type: ["对抗攻击测试", "模型安全评估"],
    create_time: "2025-9-5 14:20:00",
    completed_time: "2025-9-5 17:50:00",
    estimated_time: "3小时30分钟",
    risk_level: "低",
    failed_items: "3",
    score: "91",
  },
  {
    id: 5,
    name: "自然语言处理模型检测",
    status: "暂停",
    progress: "",
    tempate_type: ["数据隐私检测", "对抗攻击测试"],
    create_time: "2025-9-4 11:00:00",
    completed_time: "",
    estimated_time: "4小时",
    risk_level: "",
    failed_items: "",
    score: "",
  },
  {
    id: 6,
    name: "计算机视觉模型评估",
    status: "失败",
    progress: "",
    tempate_type: ["对抗攻击测试", "模型窃取检测"],
    create_time: "2025-9-3 09:00:00",
    completed_time: "",
    estimated_time: "3小时30分钟",
    risk_level: "",
    failed_items: "",
    score: "",
  },
  {
    id: 7,
    name: "多模态AI模型安全检测",
    status: "已完成",
    progress: "",
    tempate_type: ["数据隐私检测", "模型安全评估"],
    create_time: "2025-9-2 13:45:00",
    completed_time: "2025-9-2 17:30:00",
    estimated_time: "3小时45分钟",
    risk_level: "高",
    failed_items: "22",
    score: "58",
  },
  {
    id: 8,
    name: "医疗AI诊断模型隐私评估",
    status: "已完成",
    progress: "",
    tempate_type: ["数据隐私检测", "合规性测试"],
    create_time: "2025-9-1 08:30:00",
    completed_time: "2025-9-1 12:15:00",
    estimated_time: "3小时45分钟",
    risk_level: "中",
    failed_items: "6",
    score: "88",
  },
  {
    id: 9,
    name: "自动驾驶AI安全性测试",
    status: "进行中",
    progress: "",
    tempate_type: ["安全关键系统测试", "场景覆盖评估"],
    create_time: "2025-8-31 10:00:00",
    completed_time: "",
    estimated_time: "5小时30分钟",
    risk_level: "",
    failed_items: "",
    score: "",
  },
  {
    id: 10,
    name: "金融AI模型风险评估",
    status: "待开始",
    progress: "",
    tempate_type: ["金融安全检测", "公平性测试"],
    create_time: "2025-8-30 16:00:00",
    completed_time: "",
    estimated_time: "2小时45分钟",
    risk_level: "",
    failed_items: "",
    score: "",
  }
];

/**
 * 获取任务模板列表 - Mock实现
 * @param params 查询参数
 */
const mockGetTaskTemplates = (params: { page?: number; pageSize?: number } = {}): Promise<GetTaskTemplatesResponse> => {
  
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
        code: 1,
        message: "",
        data: paginatedTemplates,
        total_count: 100 // 使用后端返回的真实总数
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
          (Array.isArray(item.tempate_type) && item.tempate_type.some(type => type.toLowerCase().includes(searchTerm))) ||
          item.id.toString().includes(searchTerm)
        );
      }

      // 应用分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      const mockResponse: ScanResultsResponse = {
        code: 1,
        message: "",
        data: {
          data: paginatedResults,
          total: filteredResults.length,
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
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 动态导入mock数据生成器
      import('./mockReportData.js').then(({ generateExcelBlob }) => {
        const blob = generateExcelBlob(taskId);
        
        resolve({
          code: 1,
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
          code: 1,
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
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const statusMap = {
        start: { from: '待开始', to: '进行中' },
        pause: { from: '进行中', to: '暂停' },
        resume: { from: '暂停', to: '进行中' },
        retry: { from: '失败', to: '进行中' }
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
          code: 1,
          message: `任务${actionNameMap[action]}成功`,
          success: true,
          data: {
            taskId: taskId,
            previousStatus: statusChange.from,
            currentStatus: statusChange.to,
            timestamp: new Date().toISOString(),
            estimatedTime: action === 'start' ? '预计2小时30分钟' : undefined
          }
        });
      } else {
        resolve({
          code: 0,  // 统一使用code: 0表示失败
          message: `任务${actionNameMap[action]}失败: 当前状态不允许此操作`,
          success: false,
          data: {
            taskId: taskId,
            error_type: "invalid_status_transition",
            error_details: `Cannot ${action} task in current state`
          }
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
  
  if (useMock) {
    return mockGetScanResults(params);
  }
  
  // 真实API调用
  const response = await request({
    url: "/v1/ai_task/",
    method: "get",
    params
  }) as unknown as ScanResultsResponse;
  
  // 数据清洗和转换，确保前端兼容性
  const cleanedData = {
    ...response,
    data: {
      ...response.data,
      data: response.data.data.map((item: any) => ({
        ...item,
        tempate_type: Array.isArray(item.tempate_type) ? item.tempate_type : (item.tempate_type ? [item.tempate_type] : []), // 确保是数组
        create_time: item.create_time === "0001-01-01 00:00:00" ? "" : item.create_time, // 处理异常日期
        completed_time: item.completed_time === "0001-01-01 00:00:00" ? "" : item.completed_time,
      }))
    }
  };
  
  return cleanedData;
};

/**
 * 人工审核问题 - Mock实现
 * @param questionId 问题ID
 * @param reviewData 审核数据
 */
const mockReviewQuestion = (questionId: string, reviewData: QuestionReviewParams): Promise<QuestionReviewResponse> => {
  
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
          code: 1,
          message: "审核结果保存成功",
          success: true,
          data: {
            isModified: originalHasIssue !== reviewData.hasIssue
          }
        };
        
        resolve(mockResponse);
      } else {
        resolve({
          code: 0,  // 统一使用code: 0表示失败
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
  
  if (useMock) {
    return mockReviewQuestion(questionId, reviewData);
  }
  
  // 真实API调用
  const response = await request({
    url: `v1/ai_task/${questionId}/review/`,
    method: "post",
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
  
  if (useMock) {
    return mockGetTaskTemplates(params);
  }
  
  // 真实API调用
  const response = await request({
    url: "v1/templates/",
    method: "get",
    params
  });
  return response as unknown as GetTaskTemplatesResponse;
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
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * 开始模拟任务进度更新
   */
  startTaskProgress(taskId: string) {
    if (this.runningTasks.has(taskId)) {
      return;
    }

    this.runningTasks.add(taskId);

    // 查找对应的任务数据
    const task = mockScanResultsData.find(t => t.id === parseInt(taskId));
    if (!task) {
      return;
    }

    let currentProgress = parseInt(task.progress) || 0;
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
      const taskIndex = mockScanResultsData.findIndex(t => t.id === parseInt(taskId));
      if (taskIndex !== -1) {
        mockScanResultsData[taskIndex].progress = Math.round(currentProgress) + '%';
        mockScanResultsData[taskIndex].estimated_time = estimatedTime;
        mockScanResultsData[taskIndex].status = '进行中';
      }

      // 发送进度事件
      const progressEvent: SSETaskProgressEvent = {
        type: 'task_progress',
        taskId,
        data: {
          progress: Math.round(currentProgress),
          estimatedTime,
          status: '进行中'
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
    const taskIndex = mockScanResultsData.findIndex(t => t.id === parseInt(taskId));
    if (taskIndex !== -1) {
      mockScanResultsData[taskIndex].status = '已完成';
      mockScanResultsData[taskIndex].progress = '';
      mockScanResultsData[taskIndex].completed_time = new Date().toLocaleString('zh-CN');
      mockScanResultsData[taskIndex].risk_level = riskLevel;
      mockScanResultsData[taskIndex].failed_items = vulnerabilities.toString();
      mockScanResultsData[taskIndex].score = score.toString();
    }

    // 发送完成事件
    const completedEvent: SSETaskCompletedEvent = {
      type: 'task_completed',
      taskId,
      data: {
        status: '已完成',
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
    
    this.runningTasks.delete(taskId);
    const intervalId = this.intervalIds.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(taskId);
    }

    // 更新本地数据
    const taskIndex = mockScanResultsData.findIndex(t => t.id === parseInt(taskId));
    if (taskIndex !== -1) {
      mockScanResultsData[taskIndex].status = '暂停';
    }

    // 发送状态变更事件
    const statusChangeEvent: SSETaskStatusChangeEvent = {
      type: 'task_status_change',
      taskId,
      data: {
        previousStatus: '进行中',
        currentStatus: '暂停',
        timestamp: new Date().toISOString()
      }
    };
    this.emitEvent(statusChangeEvent);
  }

  /**
   * 恢复任务
   */
  resumeTask(taskId: string) {
    
    // 更新本地数据
    const taskIndex = mockScanResultsData.findIndex(t => t.id === parseInt(taskId));
    if (taskIndex !== -1) {
      mockScanResultsData[taskIndex].status = '运行中';
    }

    // 发送状态变更事件
    const statusChangeEvent: SSETaskStatusChangeEvent = {
      type: 'task_status_change',
      taskId,
      data: {
        previousStatus: '暂停',
        currentStatus: '进行中',
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
    this.runningTasks.clear();
    this.intervalIds.forEach(intervalId => clearInterval(intervalId));
    this.intervalIds.clear();
    this.eventListeners.clear();
  }
}

// 创建全局Mock SSE事件生成器实例
export const mockSSEGenerator = new MockSSEEventGenerator();
