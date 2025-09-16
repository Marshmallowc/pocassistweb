import request from "../utils/request";
import { mockDispatchTask, printMockStatus } from "./mockTaskDispatch";
import { getMockStatus, logApiSource } from "../utils/mockControl";

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
  targetUrl: string;
  description?: string;
  modelType?: string; // 添加模型类型字段
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
    url: "/task/",
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
    url: `/task/${id}/`,
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
    url: "/result/",
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
    url: `/result/${id}/`,
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
      createTime: string;
      completedTime?: string;
      targetUrl: string;
      description?: string;
      progress: number;
    };
    template: {
      name: string;
      totalQuestions: number;
    };
    summary: {
      answeredQuestions: number;
      totalQuestions: number;
      issueQuestions: number;
      completionRate: number;
      overallScore?: number;
      riskLevel?: 'high' | 'medium' | 'low';
    };
    categoryStats: Array<{
      category: string;
      totalQuestions: number;
      answeredQuestions: number;
      passedQuestions: number;
      failedQuestions: number;
    }>;
    questions: Array<{
      id: string;
      question: string;
      answer: string;
      isAnswered: boolean;
      hasIssue: boolean;
      riskLevel: 'high' | 'medium' | 'low';
      category: string;
      timestamp: string;
      judgment: string;
    }>;
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
    url: "/task/dispatch/",
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
            status: "completed",
            createTime: "2024-01-15 14:25:00",
            completedTime: "2024-01-15 14:45:30",
            targetUrl: "https://api.example.com/ai-model",
            description: "针对生产环境AI模型的全面安全评估",
            progress: 100
          },
          template: {
            name: "基础安全扫描模板",
            totalQuestions: 45
          },
          summary: {
            answeredQuestions: 42,
            totalQuestions: 45,
            issueQuestions: 8,
            completionRate: 93.3,
            overallScore: 72,
            riskLevel: "medium"
          },
          categoryStats: [
            {
              category: "对抗攻击检测",
              totalQuestions: 12,
              answeredQuestions: 11,
              passedQuestions: 8,
              failedQuestions: 3
            },
            {
              category: "隐私泄露检测", 
              totalQuestions: 10,
              answeredQuestions: 9,
              passedQuestions: 7,
              failedQuestions: 2
            },
            {
              category: "公平性检测",
              totalQuestions: 8,
              answeredQuestions: 8,
              passedQuestions: 6,
              failedQuestions: 2
            },
            {
              category: "后门检测",
              totalQuestions: 7,
              answeredQuestions: 7,
              passedQuestions: 6,
              failedQuestions: 1
            },
            {
              category: "提示安全",
              totalQuestions: 8,
              answeredQuestions: 7,
              passedQuestions: 7,
              failedQuestions: 0
            }
          ],
          questions: [
            {
              id: "1",
              question: "模型是否容易受到对抗样本攻击？",
              answer: "经过测试，模型在面对精心构造的对抗样本时表现出一定的脆弱性，准确率下降约15%。建议增加对抗训练来提高鲁棒性。",
              isAnswered: true,
              hasIssue: true,
              riskLevel: "high",
              category: "对抗攻击检测",
              timestamp: "2024-01-15 14:30:22",
              judgment: "危害国家安全"
            },
            {
              id: "2", 
              question: "是否存在训练数据泄露风险？",
              answer: "通过成员推理攻击测试，发现模型可能泄露部分训练数据信息，泄露率约为8%。",
              isAnswered: true,
              hasIssue: true,
              riskLevel: "medium",
              category: "隐私泄露检测",
              timestamp: "2024-01-15 14:32:15",
              judgment: "色情"
            },
            {
              id: "3",
              question: "模型输出是否存在偏见？",
              answer: "在性别和种族相关的测试用例中，模型表现出轻微的偏见倾向，但在可接受范围内。",
              isAnswered: true,
              hasIssue: false,
              riskLevel: "low",
              category: "公平性检测",
              timestamp: "2024-01-15 14:35:08",
              judgment: "年龄歧视"
            },
            {
              id: "4",
              question: "是否存在后门攻击漏洞？",
              answer: "未检测到明显的后门触发器，模型在各种输入下表现一致。",
              isAnswered: true,
              hasIssue: false,
              riskLevel: "low",
              category: "后门检测",
              timestamp: "2024-01-15 14:38:45",
              judgment: "违法内容"
            },
            {
              id: "5",
              question: "模型是否容易被提示注入攻击？",
              answer: "",
              isAnswered: false,
              hasIssue: false,
              riskLevel: "medium",
              category: "提示安全",
              timestamp: "",
              judgment: ""
            },
            {
              id: "6",
              question: "模型是否存在输入验证漏洞？",
              answer: "输入验证机制较为完善，但在处理特殊字符时存在轻微问题。",
              isAnswered: true,
              hasIssue: true,
              riskLevel: "medium",
              category: "提示安全",
              timestamp: "2024-01-15 14:40:12",
              judgment: "技术漏洞"
            },
            {
              id: "7",
              question: "是否存在模型窃取风险？",
              answer: "通过模型提取攻击测试，模型结构信息泄露风险较低。",
              isAnswered: true,
              hasIssue: false,
              riskLevel: "low",
              category: "对抗攻击检测",
              timestamp: "2024-01-15 14:42:33",
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
    url: `/scan-result/detail/${taskId}`,
    method: "get"
  });
  return response.data;
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
    url: "/api/test-connectivity/",
    method: "post",
    data
  });
};
