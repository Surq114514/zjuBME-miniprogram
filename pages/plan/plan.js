// pages/plan/plan.js
Page({
  data: {
    currentDay: 0, // 0-6 代表周一到周日
    currentStage: 0, // 0-3 代表阶段一到阶段四
    weeklyPlan: [], // 每周训练计划
    showModal: false,
    stagelyPlan: [], // 每阶段训练计划(还没写)
    modalDesc: '',
    oldDay: 0
  },
  
// 加载今日任务
loadTodayTasks() {
  const plans = wx.getStorageSync('trainingPlans') || [];
  // 随机选择3个计划作为今日任务
  const shuffled = [...plans].sort(() => 0.5 - Math.random());
  const todayTasks = shuffled.slice(0, 3).map(plan => ({
    ...plan,
    completed: false
  }));
  
  // 检查是否有已保存的今日任务状态
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
      todayTasks: todayTasks,
      totalTasks: todayTasks.length,
      tasksCompleted: 0
    });
    // 保存初始任务状态
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
    
    this.setData({
      todayTasks: todayTasks,
      tasksCompleted: tasksCompleted
    });
    
    // 保存任务状态
    const today = new Date().toISOString().split('T')[0];
    wx.setStorageSync(`tasks_${today}`, todayTasks);
    
    // 如果所有任务都完成了，显示鼓励信息
    if (tasksCompleted === this.data.totalTasks) {
      wx.showToast({
        title: '太棒了！完成所有训练',
        icon: 'success',
        duration: 2000
      });
    }
  }
},

  // 点击按钮打开弹窗
  openModal(e) {
    const desc = e.currentTarget.dataset.desc; // 获取传来的 description
    this.setData({ 
      showModal: true,
      modalDesc: desc // 存到 data 方便弹窗里用
    });
  },
  

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  // 确认操作
  goDoctorChat() {
    this.setData({ showModal: false });
    wx.navigateTo({
      url: '/pages/doctorChat/doctorChat' // 这里换成你的聊天页面路径
    });
  },

  onLoad() {
    // 获取今天是星期几（0是周日，转换为1-7，再转为0-6代表周一到周日）
    const today = new Date().getDay();
    const currentDay = today === 0 ? 6 : today - 1;
    
    // 加载训练计划
    this.loadTrainingPlan();

  // 加载今日任务（和 home 页面逻辑一致）
  this.loadTodayTasks();
    this.setData({
      currentDay: currentDay,
      oldDay:currentDay
    });
  },
 //计划同步
  onShow() {
    this.loadTodayTasks();
  },
  
  

  
  // 加载训练计划
  loadTrainingPlan() {
    const allExercises = wx.getStorageSync('trainingPlans') || [];
    
    // 创建每周计划，每天安排不同的训练组合
    const weeklyPlan = [
      // 周一
      [
        allExercises.find(item => item.id === 1), // 直腿抬高训练
        allExercises.find(item => item.id === 4)  // 踝关节泵
      ],
      // 周二
      [
        allExercises.find(item => item.id === 2), // 屈膝训练
        allExercises.find(item => item.id === 5)  // 侧抬腿
      ],
      // 周三（轻度训练日）
      [
        allExercises.find(item => item.id === 1), // 直腿抬高训练（减少组数）
        allExercises.find(item => item.id === 4)  // 踝关节泵
      ],
      // 周四
      [
        allExercises.find(item => item.id === 3), // 靠墙静蹲
        allExercises.find(item => item.id === 5)  // 侧抬腿
      ],
      // 周五
      [
        allExercises.find(item => item.id === 1), // 直腿抬高训练
        allExercises.find(item => item.id === 2)  // 屈膝训练
      ],
      // 周六
      [
        allExercises.find(item => item.id === 3), // 靠墙静蹲
        allExercises.find(item => item.id === 4)  // 踝关节泵
      ],
      // 周日（休息/轻度活动）
      [
        {
          id: 99,
          name: "散步活动",
          description: "缓慢散步10-15分钟，以不引起明显疼痛为宜",
          sets: 1,
          reps: "10-15分钟",
          restTime: 0,
          difficulty: "初级",
          target: "整体活动度，促进血液循环",
          videoUrl: ""
        }
      ]
    ];
    
    this.setData({
      weeklyPlan: weeklyPlan
    });
  },
  
  // 切换日期
  switchDay(e) {
    const day = parseInt(e.currentTarget.dataset.day);
    this.setData({
      currentDay: day
    });
  },
  // 切换阶段
  switchStage(e) {
    const stage = parseInt(e.currentTarget.dataset.stage);
    this.setData({
      currentStage: stage
    });
  },
  
  // 播放训练视频
  playExerciseVideo(e) {
    const exerciseId = e.currentTarget.dataset.id;
    const allExercises = wx.getStorageSync('trainingPlans') || [];
    const exercise = allExercises.find(item => item.id === exerciseId) || 
                     (exerciseId === 99 ? {name: "散步活动"} : null);
    
    if (exercise) {
      wx.showModal({
        title: '训练示范',
        content: `即将播放《${exercise.name}》的示范视频`,
        confirmText: '观看',
        cancelText: '取消',
        success(res) {
          if (res.confirm) {
            // 实际项目中这里应该跳转到视频播放页
            wx.showToast({
              title: '视频加载中...',
              icon: 'loading',
              duration: 1500
            });
          }
        }
      });
    }
  },
  
  // 前往记录训练
  goToLogExercise(e) {
    const exerciseId = e.currentTarget.dataset.id;
    // 跳转到记录页面，并携带训练ID
    wx.navigateTo({
      url: `/pages/log/log?exerciseId=${exerciseId}`
    });
  },
  
  // 获取当前日期的训练
  get currentDayExercises() {
    return this.data.weeklyPlan[this.data.currentDay] || [];
  }

});
