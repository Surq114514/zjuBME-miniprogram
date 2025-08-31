const AV = require('./libs/av-core-min');
const adapters = require('./libs/leancloud-adapters-weapp.js');

AV.setAdapters(adapters);
AV.init({
  appId:'JqAWaGQweN6bkKFnnoWGolmX-gzGzoHsz',
  appKey:'ARxDQBmDjxKlKzxSEe1uzRHi',
  serverURLs:"https://jqawagqw.lc-cn-n1-shared.com",
})

App({
  onLaunch() {
    // 初始化本地存储
    this.initStorage();
    
    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.windowWidth = res.windowWidth;
      }
    });
  },
  
  // 初始化本地存储数据
  initStorage() {
    // 检查是否有用户数据
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.setStorageSync('userInfo', {
        name: "张先生",
        surgeryDate: this.calculateSurgeryDate(28), // 计算28天前的日期
        recoveryRate: 65,
        patientType: "患者",
        surgeryType: "右膝关节置换术"
      });
    }
    
    // 检查是否有康复记录
    const recoveryRecords = wx.getStorageSync('recoveryRecords');
    if (!recoveryRecords) {
      wx.setStorageSync('recoveryRecords', this.generateSampleRecords());
    }
    
    // 检查是否有训练计划
    const trainingPlans = wx.getStorageSync('trainingPlans');
    if (!trainingPlans) {
      wx.setStorageSync('trainingPlans', this.generateSamplePlans());
    }
    
    // 检查是否有家属绑定信息
    const familyBinding = wx.getStorageSync('familyBinding');
    if (!familyBinding) {
      wx.setStorageSync('familyBinding', {
        isBound: true,
        boundMembers: [
          {
            name: '李女士',
            relation: '配偶',
            bindTime: '2023-06-20',
            lastActive: '2小时前'
          }
        ]
      });
    }
    
    // 检查是否有应用设置
    const appSettings = wx.getStorageSync('appSettings');
    if (!appSettings) {
      wx.setStorageSync('appSettings', {
        version: '1.0.0',
        buildNumber: '20230713',
        lastUpdate: '2023-07-13',
        notifications: true,
        privacyLevel: 'standard'
      });
    }
  },
  
  // 计算手术日期（几天前）
  calculateSurgeryDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  },
  
  // 生成示例康复记录
  generateSampleRecords() {
    const records = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      records.push({
        date: dateStr,
        pain: {
          rest: Math.floor(Math.random() * 5) + 1,
          activity: Math.floor(Math.random() * 6) + 2,
          night: Math.floor(Math.random() * 4) + 1,
          average: Math.floor(Math.random() * 3) + 2
        },
        rangeOfMotion: {
          flexion: 100 + i * 2,
          extension: 0
        },
        muscleStrength: {
          quadriceps: 3 + Math.floor(i / 3),
          hamstring: 3 + Math.floor(i / 4)
        },
        swelling: {
          difference: 2.0 - i * 0.2
        },
        tasksCompleted: {
          total: 3,
          completed: 3 - Math.floor(i / 3)
        }
      });
    }
    
    return records;
  },
  
  // 生成示例训练计划
  generateSamplePlans() {
    return [
      {
        id: 1,
        name: "直腿抬高训练",
        description: "平躺，将腿伸直抬高至30°，保持5秒后放下",
        sets: 3,
        reps: 15,
        restTime: 60,
        difficulty: "初级",
        target: "股四头肌",
        videoUrl: "",
        completed: true
      },
      {
        id: 2,
        name: "屈膝训练",
        description: "坐姿或平躺，缓慢弯曲膝盖至最大角度，保持2秒后伸直",
        sets: 2,
        reps: "持续10分钟",
        restTime: 0,
        difficulty: "中级",
        target: "膝关节活动度",
        videoUrl: "",
        completed: true
      },
      {
        id: 3,
        name: "靠墙静蹲",
        description: "背部贴墙，双脚分开与肩同宽，缓慢下蹲至膝盖呈45°角",
        sets: 3,
        reps: "每次30秒",
        restTime: 45,
        difficulty: "中级",
        target: "大腿肌群",
        videoUrl: "",
        completed: false
      },
      {
        id: 4,
        name: "踝关节泵",
        description: "平躺，缓慢勾脚再绷脚，重复动作",
        sets: 2,
        reps: 20,
        restTime: 30,
        difficulty: "初级",
        target: "小腿肌肉，促进血液循环",
        videoUrl: "",
        completed: false
      },
      {
        id: 5,
        name: "侧抬腿",
        description: "侧卧，将上方腿保持伸直状态缓慢抬起",
        sets: 3,
        reps: 12,
        restTime: 45,
        difficulty: "初级",
        target: "髋外展肌",
        videoUrl: "",
        completed: false
      }
    ];
  },
  
  // 获取今日康复任务
  getTodayTasks() {
    const tasks = wx.getStorageSync('trainingPlans') || [];
    return tasks.slice(0, 3).map(task => ({
      id: task.id,
      name: task.name,
      sets: task.sets,
      reps: task.reps,
      completed: task.completed || false
    }));
  },
  
  // 更新任务完成状态
  updateTaskCompletion(taskId, completed) {
    const tasks = wx.getStorageSync('trainingPlans') || [];
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed };
      }
      return task;
    });
    wx.setStorageSync('trainingPlans', updatedTasks);
  },
  
  // 保存康复记录
  saveRecoveryRecord(record) {
    const records = wx.getStorageSync('recoveryRecords') || [];
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否已有今日记录
    const existingIndex = records.findIndex(r => r.date === today);
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record };
    } else {
      records.push({ date: today, ...record });
    }
    
    wx.setStorageSync('recoveryRecords', records);
    
    // 更新恢复进度
    this.updateRecoveryProgress();
  },
  
  // 更新恢复进度
  updateRecoveryProgress() {
    const records = wx.getStorageSync('recoveryRecords') || [];
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    if (records.length > 0) {
      // 计算恢复进度（基于疼痛评分、活动度等指标）
      const latestRecord = records[records.length - 1];
      let progress = 65; // 基础进度
      
      // 根据疼痛评分调整
      if (latestRecord.pain && latestRecord.pain.average < 3) {
        progress += 10;
      }
      
      // 根据活动度调整
      if (latestRecord.rangeOfMotion && latestRecord.rangeOfMotion.flexion > 110) {
        progress += 15;
      }
      
      // 根据肌力调整
      if (latestRecord.muscleStrength && latestRecord.muscleStrength.quadriceps >= 4) {
        progress += 10;
      }
      
      // 限制最大进度
      progress = Math.min(progress, 100);
      
      // 更新用户信息
      const updatedUserInfo = { ...userInfo, recoveryRate: progress };
      wx.setStorageSync('userInfo', updatedUserInfo);
    }
  },
  
  // 获取康复趋势数据
  getRecoveryTrendData() {
    const records = wx.getStorageSync('recoveryRecords') || [];
    const last7Days = records.slice(-7);
    
    return {
      labels: last7Days.map(r => r.date.slice(5)), // 只显示月-日
      painData: last7Days.map(r => r.pain?.average || 0),
      romData: last7Days.map(r => r.rangeOfMotion?.flexion || 0),
      swellingData: last7Days.map(r => r.swelling?.difference || 0)
    };
  },
  
  globalData: {
    userInfo: null,
    windowHeight: 0,
    windowWidth: 0,
    activeLogTab: 'pain', // 当前激活的记录标签
    recoveryData: null,   // 康复数据
    familyBinding: null   // 家属绑定信息
  }
})
