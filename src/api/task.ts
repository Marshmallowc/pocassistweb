import request from "../utils/request";
import { mockDispatchTask, printMockStatus } from "./mockTaskDispatch";

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

// Mock开关 - 开发环境下可以设置为true来使用mock数据
const USE_MOCK = true; // 设置为false使用真实API

/**
 * 任务下发
 * @param data 任务下发参数
 */
export const dispatchTask = (data: TaskDispatchParams) => {
  if (USE_MOCK) {
    // 打印Mock服务状态（仅第一次调用时）
    if (!(window as any).__mockStatusPrinted) {
      printMockStatus();
      (window as any).__mockStatusPrinted = true;
    }
    
    console.log("🔧 使用Mock服务处理任务下发请求");
    return mockDispatchTask(data);
  }
  
  // 真实API调用
  console.log("🌐 使用真实API处理任务下发请求");
  return request({
    url: "/task/dispatch/",
    method: "post",
    data
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
 * API连通性测试
 * @param data API测试参数
 */
export const testApiConnectivity = (data: ApiTestParams) => {
  if (USE_MOCK) {
    return mockTestApiConnectivity(data);
  }
  
  console.log("🌐 使用真实API测试连通性", data);
  return request({
    url: "/api/test-connectivity/",
    method: "post",
    data
  });
};
