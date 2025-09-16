/**
 * Mock控制工具函数
 */

// 获取当前mock状态
export const getMockStatus = (): boolean => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem("mockEnabled");
    return stored ? JSON.parse(stored) : true; // 默认开启mock
  }
  return true;
};

// 设置mock状态
export const setMockStatus = (enabled: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("mockEnabled", JSON.stringify(enabled));
  }
};

// 打印当前API数据源状态
export const logApiSource = (apiName: string, isMock: boolean): void => {
  const icon = isMock ? "🔧" : "🌐";
  const source = isMock ? "Mock数据" : "真实API";
  console.log(`${icon} ${apiName}: 使用${source}`);
};
