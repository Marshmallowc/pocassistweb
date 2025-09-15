# 任务下发接口文档 (Task Dispatch API)

## 接口概述

**接口名称**: 任务下发  
**接口路径**: `POST /task/dispatch/`  
**功能描述**: 创建并下发安全扫描任务，支持多种配置选项包括自定义模板、API格式配置等

---

## 请求参数

### 基本参数结构

```typescript
interface TaskDispatchParams {
  taskName: string;                    // 任务名称（必填）
  targetUrl: string;                   // 目标URL（必填）
  description?: string;                // 任务描述（可选）
  modelType?: string;                  // 模型类型（可选）
  apiConfig: ApiConfig;                // API配置（必填）
  selectedTemplates: string[];         // 选中的模板列表（必填）
  customCorpusFile?: string[];         // 自定义模板文件内容数组（可选）
}

interface ApiConfig {
  type: "builtin" | "custom";          // API类型：内置或自定义
  format?: string;                     // API格式（自定义时必填）
  apiKey?: string;                     // API密钥（可选）
  customHeaders?: string;              // 自定义请求头（可选）
  requestContent?: string;             // 自定义请求内容（可选）
  responseContent?: string;            // 自定义响应内容（可选）
}
```

### 字段详细说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `taskName` | string | ✅ | 任务名称，用于标识此次扫描任务 |
| `targetUrl` | string | ✅ | 扫描目标URL，支持单个URL |
| `description` | string | ❌ | 任务描述信息，便于后续管理 |
| `modelType` | string | ❌ | 使用的AI模型类型 |
| `apiConfig` | object | ✅ | API配置信息 |
| `apiConfig.type` | string | ✅ | API类型，可选值：`builtin`（内置）、`custom`（自定义） |
| `apiConfig.format` | string | 🔶 | API格式，当type为custom时必填 |
| `apiConfig.apiKey` | string | ❌ | API密钥 |
| `apiConfig.customHeaders` | string | ❌ | 自定义HTTP请求头 |
| `apiConfig.requestContent` | string | ❌ | 自定义请求内容模板 |
| `apiConfig.responseContent` | string | ❌ | 自定义响应内容模板 |
| `selectedTemplates` | string[] | ✅ | 选中的扫描模板列表 |
| `customCorpusFile` | string[] | ❌ | 自定义模板文件内容数组，每个元素为一个文件的完整文本内容 |

---

## 使用场景示例

### 场景1：使用内置API格式，无自定义模板

```json
{
  "taskName": "网站安全扫描-基础版",
  "targetUrl": "https://example.com",
  "description": "对目标网站进行基础安全扫描",
  "modelType": "gpt-4",
  "apiConfig": {
    "type": "builtin",
    "apiKey": "sk-xxxxxxxxxxxxxxxx"
  },
  "selectedTemplates": ["SQL注入检测", "XSS检测", "文件包含检测"],
}
```

### 场景2：使用内置API格式，包含单个自定义模板

```json
{
  "taskName": "网站安全扫描-含自定义模板",
  "targetUrl": "https://example.com",
  "description": "使用自定义模板进行专项扫描",
  "modelType": "gpt-4",
  "apiConfig": {
    "type": "builtin",
    "apiKey": "sk-xxxxxxxxxxxxxxxx"
  },
  "selectedTemplates": ["SQL注入检测", "XSS检测", "自定义模板"],
  "customCorpusFile": [
    "# 自定义安全检测模板\n\n## 检测目标\n检测目标网站是否存在业务逻辑漏洞\n\n## 检测方法\n1. 分析登录流程\n2. 测试权限绕过\n3. 检查数据验证\n\n## 期望结果\n发现并报告所有业务逻辑相关的安全问题"
  ]
}
```

### 场景3：使用内置API格式，包含多个自定义模板

```json
{
  "taskName": "全面安全扫描-多自定义模板",
  "targetUrl": "https://example.com",
  "description": "使用多个自定义模板进行全面安全扫描",
  "modelType": "gpt-4",
  "apiConfig": {
    "type": "builtin",
    "apiKey": "sk-xxxxxxxxxxxxxxxx"
  },
  "selectedTemplates": ["SQL注入检测", "自定义模板"],
  "customCorpusFile": [
    "# 业务逻辑检测模板\n检测各种业务逻辑漏洞，包括权限绕过、支付逻辑缺陷等...",
    "# API安全检测模板\n专门用于检测REST API的安全问题，包括认证绕过、参数污染等...",
    "# 移动端安全检测模板\n针对移动应用的安全检测，包括客户端安全、通信安全等..."
  ]
}
```

### 场景4：使用自定义API格式

```json
{
  "taskName": "自定义API格式扫描",
  "targetUrl": "https://example.com",
  "description": "使用自定义API配置进行扫描",
  "modelType": "claude-3",
  "apiConfig": {
    "type": "custom",
    "format": "OpenAI Compatible",
    "apiKey": "custom-api-key-xxxxxxxx",
    "customHeaders": "{\n  \"Authorization\": \"Bearer custom-token\",\n  \"Content-Type\": \"application/json\",\n  \"User-Agent\": \"SecurityScanner/1.0\"\n}",
    "requestContent": "{\n  \"model\": \"custom-model\",\n  \"messages\": [\n    {\"role\": \"system\", \"content\": \"You are a security expert.\"},\n    {\"role\": \"user\", \"content\": \"{{prompt}}\"}\n  ],\n  \"temperature\": 0.1,\n  \"max_tokens\": 2000\n}",
    "responseContent": "{\n  \"choices\": [\n    {\n      \"message\": {\n        \"content\": \"{{response}}\"\n      }\n    }\n  ]\n}"
  },
  "selectedTemplates": ["SQL注入检测", "XSS检测"],
  "customCorpusFile": [
    "# 针对特定框架的检测模板\n专门检测Spring Boot应用的安全问题..."
  ]
}
```

### 场景5：复杂场景 - 自定义API + 多个自定义模板

```json
{
  "taskName": "企业级全面安全扫描",
  "targetUrl": "https://enterprise.example.com",
  "description": "企业级应用的全面安全评估，包含多个专项检测模板",
  "modelType": "custom-enterprise-model",
  "apiConfig": {
    "type": "custom",
    "format": "Enterprise API v2.0",
    "apiKey": "enterprise-key-xxxxxxxxxxxxxxxx",
    "customHeaders": "{\n  \"Authorization\": \"Bearer enterprise-token\",\n  \"X-Enterprise-ID\": \"12345\",\n  \"Content-Type\": \"application/json\"\n}",
    "requestContent": "{\n  \"model\": \"enterprise-security-model\",\n  \"prompt\": \"{{prompt}}\",\n  \"context\": \"enterprise_security_scan\",\n  \"parameters\": {\n    \"temperature\": 0.05,\n    \"max_tokens\": 4000,\n    \"top_p\": 0.95\n  }\n}",
    "responseContent": "{\n  \"result\": {\n    \"content\": \"{{response}}\",\n    \"confidence\": \"{{confidence}}\"\n  }\n}"
  },
  "selectedTemplates": [
    "SQL注入检测",
    "XSS检测", 
    "CSRF检测",
    "自定义模板"
  ],
  "customCorpusFile": [
    "# 企业级权限管理检测\n## 检测范围\n- RBAC权限模型验证\n- 多租户隔离检测\n- 管理员权限滥用检测\n\n## 检测方法\n...",
    "# 数据泄露风险评估\n## 敏感数据识别\n- 个人信息泄露检测\n- 商业机密保护验证\n- 数据传输安全检查\n\n## 评估标准\n...",
    "# 第三方组件安全检测\n## 依赖库安全扫描\n- 已知漏洞组件识别\n- 过期组件检测\n- 许可证合规检查\n\n## 风险等级评估\n...",
    "# 业务连续性安全评估\n## 可用性测试\n- DDoS防护能力\n- 系统容错机制\n- 灾难恢复能力\n\n## 评估指标\n..."
  ]
}
```

---

## 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "任务创建成功",
  "data": {
    "taskId": "task_20241215_001",
    "status": "created",
    "createTime": "2024-12-15T10:30:00Z"
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "参数错误：taskName不能为空",
  "data": null
}
```

---

## 注意事项

### 1. 自定义模板文件 (customCorpusFile)
- **数据类型**: 字符串数组，每个元素代表一个完整的模板文件内容
- **文件格式**: 支持纯文本格式，通常为Markdown或纯文本
- **数量限制**: 建议单次请求不超过10个自定义模板文件
- **大小限制**: 每个模板文件内容建议不超过50KB
- **编码格式**: UTF-8编码

### 2. API配置 (apiConfig)
- **内置类型 (builtin)**: 使用系统预定义的API格式，只需提供apiKey
- **自定义类型 (custom)**: 需要完整配置API调用格式，包括请求和响应模板
- **模板变量**: 在自定义格式中可使用 `{{prompt}}` 和 `{{response}}` 作为占位符

### 3. 模板选择 (selectedTemplates)
- 当包含"自定义模板"时，必须同时提供 `customCorpusFile` 数组
- 系统会按照模板顺序依次执行检测
- 自定义模板会与选中的内置模板组合使用

### 4. 请求限制
- 单次请求总大小不超过10MB
- 并发请求限制：每个用户同时最多5个活跃任务
- 频率限制：每分钟最多创建10个新任务

---

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查必填字段和数据格式 |
| 401 | 认证失败 | 检查API密钥是否正确 |
| 403 | 权限不足 | 联系管理员分配相应权限 |
| 413 | 请求体过大 | 减少自定义模板文件大小或数量 |
| 429 | 请求频率超限 | 降低请求频率，稍后重试 |
| 500 | 服务器内部错误 | 联系技术支持 |

---

## 开发建议

1. **渐进式测试**: 建议先使用简单的内置配置测试接口连通性，再逐步添加自定义配置
2. **模板验证**: 自定义模板建议先在小范围测试，确认效果后再大规模使用
3. **错误处理**: 实现完善的错误处理机制，特别是网络超时和参数验证
4. **日志记录**: 记录关键参数和响应信息，便于问题排查
5. **异步处理**: 考虑到扫描任务可能耗时较长，建议采用异步方式处理

---

*文档版本: v1.0*  
*最后更新: 2024-12-15*
