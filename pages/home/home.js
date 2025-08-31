const app = getApp();
const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    name:5,
    patientInfo: {},
    daysAfterSurgery: 0,
    currentRecord: {},
    painTrend: 0,
    romTrend: 0,
    swellingTrend: 0,
    muscleStrengthPercent: 0,
    todayTasks: [],
    tasksCompleted: 0,
    totalTasks: 0,
    dateRanges: ['近7天', '近30天', '全部'],
    selectedDateRange: 0,
    chartRecords: []
  },

  onLoad() {
    // 页面加载时，调用查询云端数据的方法
    this.queryDataByUserId();
  },
  //声明queryPatientTable和queryTodoTable
     // 查询患者表
  async queryPatientTable(userId) {
  const query = new AV.Query('Patient');
                                   // 设置查询条件：匹配当前用户
  query.descending('createdAt');   // 按创建时间降序排列
  return await query.first();       // 执行查询并返回结果
},

    // 查询计划表
  async queryTodoTable(userId) {
const query = new AV.Query('Plan');
                                // 设置查询条件：匹配当前用户
query.ascending('dueDate');      // 按计划日期升序排列
return await query.first();       // 执行查询并返回结果
},
 // 从 LeanCloud 查询患者数据
 async queryPatientData() {
  try {
    //此处补充一个针对UseId的查找

    // 同时查询patient表和计划表
    const [patientInfo, todos] = await Promise.all([
      this.queryPatientTable(userId), // 查询 Patient 表
      this.queryTodoTable(userId)  // 查询 计划 表
    ]);
   

    // 4. 处理查询结果（将 LeanCloud 数据转换为普通数组）
    if (patient) {
      // 解析数据：从云端数据中提取各字段值，若字段为空则用默认值（如"未填写"）
      const patientInfo = {
        pain: patient.get('painScore') || '未填写', // 提取"name"字段，默认"未填写"
        action: patient.get('action') || '未填写',
        // ... 其他字段（年龄、身高、手术信息等）解析逻辑相同
        // 对于多选字段（如病史），用 join('、') 转换为字符串展示
        muscles: patient.get('muscles')?.join('、') || '未填写',
        length: patient.get('length') || '未填写',
        // ... 其他字段
      };
      const todos={
        History:todos.get('history')?.join('、')||'未填写',
      }// 情况1：查询成功，但无数据（表中没有任何患者信息）
    }else {
  wx.showToast({
    title: '暂无患者数据',
    icon: 'none'
  });
}

// 情况2：查询过程中发生错误（如网络问题、权限问题）
}catch (error) {
  wx.showToast({
    title: '查询失败：' + error.message,
    icon: 'none',
    duration: 3000
  });
  console.error('查询云端数据失败：', error); // 在控制台打印详细错误，方便调试
}
    
      // 将解析后的数据更新到页面 data 中，供 WXML 渲染
      this.setData({
        patientInfo
      });
    }

   


  // 加载康复记录
 , loadRecoveryRecords() {
    const records = wx.getStorageSync('recoveryRecords') || [];
    if (records.length === 0) return;
    
    const currentRecord = records[records.length - 1];
    currentRecord.pain.average = Math.round((currentRecord.pain.rest + currentRecord.pain.activity + currentRecord.pain.night) / 3);
    
    let painTrend = 0, romTrend = 0, swellingTrend = 0;
    if (records.length > 1) {
      const previousRecord = records[records.length - 2];
      painTrend = previousRecord.pain.average - currentRecord.pain.average;
      romTrend = currentRecord.rangeOfMotion.flexion - previousRecord.rangeOfMotion.flexion;
      swellingTrend = previousRecord.swelling.difference - currentRecord.swelling.difference;
    }
    
    const muscleStrengthPercent = currentRecord.muscleStrength.quadriceps * 20;
    const chartRecords = this.getChartRecords(records, this.data.selectedDateRange);
    
    this.setData({
      currentRecord,
      painTrend,
      romTrend,
      swellingTrend,
      muscleStrengthPercent,
      chartRecords
    });
  },

  // 根据选择的时间范围获取图表数据
  getChartRecords(allRecords, rangeIndex) {
    let recordsToShow = [...allRecords];
    switch(rangeIndex) {
      case 0: recordsToShow = recordsToShow.slice(-7); break;
      case 1: recordsToShow = recordsToShow.slice(-30); break;
      default: break;
    }
    return recordsToShow;
  },

  // 加载今日任务
  loadTodayTasks() {
    const plans = wx.getStorageSync('trainingPlans') || [];
    const shuffled = [...plans].sort(() => 0.5 - Math.random());
    const todayTasks = shuffled.slice(0, 3).map(plan => ({ ...plan, completed: false }));
    
    const today = new Date().toISOString().split('T')[0];
    const savedTasks = wx.getStorageSync(`tasks_${today}`);
    
    if (savedTasks) {
      this.setData({
        todayTasks: savedTasks,
        totalTasks: savedTasks.length,
        tasksCompleted: savedTasks.filter(task => task.completed).length
      });
    } else {
      this.setData({
        todayTasks,
        totalTasks: todayTasks.length,
        tasksCompleted: 0
      });
      wx.setStorageSync(`tasks_${today}`, todayTasks);
    }
  },

  // 切换任务完成状态
  toggleTaskCompletion(e) {
    const taskId = e.currentTarget.dataset.id;
    const todayTasks = [...this.data.todayTasks];
    const taskIndex = todayTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      todayTasks[taskIndex].completed = !todayTasks[taskIndex].completed;
      const tasksCompleted = todayTasks.filter(task => task.completed).length;
      this.setData({ todayTasks, tasksCompleted });
      
      const today = new Date().toISOString().split('T')[0];
      wx.setStorageSync(`tasks_${today}`, todayTasks);
      
      if (tasksCompleted === this.data.totalTasks) {
        wx.showToast({
          title: '太棒了！完成所有训练',
          icon: 'success',
          duration: 2000
        });
      }
    }
  },

  // 日期范围变化
  onDateRangeChange(e) {
    const selectedDateRange = e.detail.value;
    const records = wx.getStorageSync('recoveryRecords') || [];
    const chartRecords = this.getChartRecords(records, selectedDateRange);
    
    this.setData({
      selectedDateRange,
      chartRecords
    });
  },

  // 页面展示时加载数据
  onShow() {
    this.queryPatientData();
    this.loadRecoveryRecords();
    this.loadTodayTasks();
  }
});