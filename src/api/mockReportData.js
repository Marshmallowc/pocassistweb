/**
 * 扫描报告Mock数据生成器
 * 用于生成真实的EXCEL格式报告数据
 */

// 生成模拟的EXCEL文件内容（简化版）
export const generateMockExcelData = (taskId) => {
  // 报告基本信息
  const reportInfo = {
    taskId: taskId,
    taskName: getTaskNameById(taskId),
    reportDate: new Date().toLocaleDateString('zh-CN'),
    reportTime: new Date().toLocaleTimeString('zh-CN'),
    totalQuestions: 45,
    answeredQuestions: 38,
    issueQuestions: 12,
    passRate: '73.7%',
    securityScore: 75
  };

  // 风险分类统计
  const riskStats = [
    { level: '高风险', count: 3, percentage: '7.9%' },
    { level: '中风险', count: 5, percentage: '13.2%' },
    { level: '低风险', count: 4, percentage: '10.5%' }
  ];

  // 详细问题列表
  const questionDetails = [
    {
      id: 1,
      category: '对抗攻击检测',
      question: '模型是否容易受到对抗样本攻击？',
      result: '存在风险',
      riskLevel: '高',
      description: '经过测试，模型在面对精心构造的对抗样本时表现出一定的脆弱性，准确率下降约15%。',
      suggestion: '建议增加对抗训练来提高鲁棒性，使用数据增强技术提升模型的抗干扰能力。'
    },
    {
      id: 2,
      category: '隐私泄露检测',
      question: '是否存在训练数据泄露风险？',
      result: '存在风险',
      riskLevel: '中',
      description: '通过成员推理攻击测试，发现模型可能泄露部分训练数据信息，泄露率约为8%。',
      suggestion: '实施差分隐私技术，在训练过程中加入噪声保护隐私数据。'
    },
    {
      id: 3,
      category: '公平性检测',
      question: '模型输出是否存在偏见？',
      result: '轻微问题',
      riskLevel: '低',
      description: '在性别和种族相关的测试用例中，模型表现出轻微的偏见倾向，但在可接受范围内。',
      suggestion: '优化训练数据集的平衡性，加强公平性约束。'
    },
    {
      id: 4,
      category: '后门检测',
      question: '是否存在后门攻击漏洞？',
      result: '通过',
      riskLevel: '无',
      description: '未检测到明显的后门触发器，模型在各种输入下表现一致。',
      suggestion: '继续保持良好的安全实践。'
    },
    {
      id: 5,
      category: '提示安全',
      question: '模型是否容易被提示注入攻击？',
      result: '存在风险',
      riskLevel: '高',
      description: '在特定提示注入测试中，模型可能被诱导生成不当内容。',
      suggestion: '加强输入验证和过滤机制，实施更严格的提示安全策略。'
    },
    {
      id: 6,
      category: '提示安全',
      question: '模型是否存在输入验证漏洞？',
      result: '存在问题',
      riskLevel: '中',
      description: '输入验证机制较为完善，但在处理特殊字符时存在轻微问题。',
      suggestion: '完善输入验证规则，增强对特殊字符的处理能力。'
    }
  ];

  // 安全建议汇总
  const securityRecommendations = [
    '实施对抗训练提高模型鲁棒性',
    '采用差分隐私技术保护训练数据',
    '建立完善的输入验证机制',
    '定期进行安全评估和监控',
    '建立安全事件响应流程'
  ];

  return {
    reportInfo,
    riskStats,
    questionDetails,
    securityRecommendations
  };
};

// 根据任务ID获取任务名称
const getTaskNameById = (taskId) => {
  const taskNames = {
    'TASK-001': '电商平台AI推荐系统安全评估',
    'TASK-002': '智能客服对抗攻击测试',
    'TASK-003': '图像识别模型隐私检测',
    'TASK-004': '图像分类模型基础扫描',
    'TASK-005': '语音识别模型安全评估'
  };
  return taskNames[taskId] || `AI模型安全评估任务 - ${taskId}`;
};

// 生成简化的CSV格式数据（模拟EXCEL内容）
export const generateCSVContent = (taskId) => {
  const data = generateMockExcelData(taskId);
  
  let csvContent = '';
  
  // 报告头部信息
  csvContent += '扫描报告\n';
  csvContent += `任务ID,${data.reportInfo.taskId}\n`;
  csvContent += `任务名称,${data.reportInfo.taskName}\n`;
  csvContent += `生成日期,${data.reportInfo.reportDate}\n`;
  csvContent += `生成时间,${data.reportInfo.reportTime}\n`;
  csvContent += `安全评分,${data.reportInfo.securityScore}\n`;
  csvContent += '\n';
  
  // 统计信息
  csvContent += '统计信息\n';
  csvContent += `总问题数,${data.reportInfo.totalQuestions}\n`;
  csvContent += `已回答问题,${data.reportInfo.answeredQuestions}\n`;
  csvContent += `发现问题,${data.reportInfo.issueQuestions}\n`;
  csvContent += `通过率,${data.reportInfo.passRate}\n`;
  csvContent += '\n';
  
  // 风险分布
  csvContent += '风险分布\n';
  csvContent += '风险等级,数量,占比\n';
  data.riskStats.forEach(risk => {
    csvContent += `${risk.level},${risk.count},${risk.percentage}\n`;
  });
  csvContent += '\n';
  
  // 详细问题列表
  csvContent += '详细问题列表\n';
  csvContent += '序号,分类,问题,结果,风险等级,描述,建议\n';
  data.questionDetails.forEach(item => {
    csvContent += `${item.id},"${item.category}","${item.question}","${item.result}","${item.riskLevel}","${item.description}","${item.suggestion}"\n`;
  });
  csvContent += '\n';
  
  // 安全建议
  csvContent += '安全建议\n';
  data.securityRecommendations.forEach((rec, index) => {
    csvContent += `${index + 1},"${rec}"\n`;
  });
  
  return csvContent;
};

// 生成EXCEL格式的Blob对象
export const generateExcelBlob = (taskId) => {
  const csvContent = generateCSVContent(taskId);
  
  // 添加UTF-8 BOM以确保中文显示正确
  const BOM = '\uFEFF';
  const contentWithBOM = BOM + csvContent;
  
  // 创建Blob对象，使用EXCEL兼容的MIME类型
  const blob = new Blob([contentWithBOM], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  
  return blob;
};
