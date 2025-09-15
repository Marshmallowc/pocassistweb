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
