// pages/plan/plan.js
const app = getApp();
const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    currentDay: 0, // 0-6 代表周一到周日
    currentStage: 0, // 0-3 代表阶段一到阶段四
    weeklyPlan: [], // 每周训练计划
    showModal: false,
    modalDesc: '',
    modalDiffic: '',
    oldDay: 0,
    realStage: 0,
    planInfo:{},
    lastUpdateDate: '', //用于跟踪数据更新状态
    lastExerIndex: [],
    doctorTip:'',
    completedArray: [], // 存储所有completed状态的一维数组
    contentArray: []    // 存储所有content拆分后的二级数组
  },

  async queryPlanInfo(){
    try{
      const query = new AV.Query('Plan');
      query.descending('createdAt');
      const plan = await query.first();
      
      // 获取当前日期（格式：yyyy-mm-dd）
      const today = new Date().toISOString().split('T')[0];
      // 从缓存获取上次更新信息
      const lastUpdateDate = wx.getStorageSync('planLastUpdateDate') || '';
      const lastExerIndex = wx.getStorageSync('planLastExerIndex') || [];

      if(plan){
        const stageStartDate = plan.get('stageStartDate') 
        ? new Date(plan.get('stageStartDate')).toLocaleDateString() // 转换为本地日期字符串
        : null;
      
        const stageEndDate = plan.get('stageEndDate') 
        ? new Date(plan.get('stageEndDate')).toLocaleDateString() 
        : null;

        const currentExerIndex = plan.get('exerIndex')||null;
        const planInfo = {
          stageIndex: plan.get('stageIndex')||null,
          stageGoal: plan.get('stageGoal')||null,
          stageRate: plan.get('stageRate')||null,
          exerIndex: currentExerIndex,
          exerStatus: plan.get('exerStatus')||null,
        };

        this.setData({
            planInfo,
            stageStartDate,
            stageEndDate,
            lastUpdateDate,
            lastExerIndex,
            plan: plan           
        });

        // 检查是否跨天且数据未更新
        if (lastUpdateDate && lastUpdateDate !== today) {
            // 确保两者都是数组再进行对比
            const isArrayEqual = Array.isArray(lastExerIndex) && Array.isArray(currentExerIndex) &&
              JSON.stringify(lastExerIndex) === JSON.stringify(currentExerIndex);
            
            if (isArrayEqual) {
              wx.showToast({
                title: '今日训练计划未更新',
                icon: 'none',
                duration: 3000
              });
            }
          }
  
          // 更新缓存中的上次更新信息
          wx.setStorageSync('planLastUpdateDate', today);
          wx.setStorageSync('planLastExerIndex', currentExerIndex);        

      } else {
        console.log('没有查询到计划数据');
        this.setData({planInfo: null});
      }
    }catch(error){
      console.error('查询计划信息失败:',error);
    }
  },
  
  // 加载今日任务
  loadTodayTasks() {
    // 1. 获取本地缓存的所有训练计划（基础数据来源）
    const allExercises = wx.getStorageSync('trainingPlans') || [];
    // 2. 从云端计划信息中获取目标任务ID数组（exerIndex）
    const { exerIndex,exerStatus } = this.data.planInfo || {};
    let todayTasks = [];

    // 3. 按云端exerIndex匹配任务（核心逻辑）
    if (Array.isArray(exerIndex) && exerIndex.length > 0) {
      // 检查exerStatus是否为有效数组且长度匹配
      const isValidStatus = Array.isArray(exerStatus) && exerStatus.length === exerIndex.length;
      todayTasks = exerIndex
        .map((taskId, index) => {
          // 按ID匹配本地训练计划中的任务
          const exercise = allExercises.find(ex => ex.id === taskId);
          if (!exercise) return null;
          // 从exerStatus取对应索引的完成状态，默认未完成
          return { ...exercise, completed: isValidStatus ? exerStatus[index] : false };
        })
        .filter(Boolean) // 过滤无效任务（如ID不存在于本地）

        if(!isValidStatus){
          // 尝试从本地缓存加载任务完成状态
          const today = new Date().toISOString().split('T')[0];
          const savedTasks = wx.getStorageSync(`tasks_${today}`) || [];
          if (savedTasks.length > 0) {
            todayTasks = todayTasks.map(task => {
              const savedTask = savedTasks.find(t => t.id === task.id);
              return savedTask ? { ...task, completed: savedTask.completed } : task;
            });
          }        
        }
    }

    this.setData({
        todayTasks: todayTasks,
        totalTasks: todayTasks.length,
        tasksCompleted: todayTasks.filter(task => task.completed).length
      });
    
    // 数据加载完成后，同步到全局
    app.globalData.planTodayTasks = this.data.todayTasks;
  },

  // 上传exerStatus到云端
  async updateExerStatusToCloud(exerStatus) {
    try {
      const plan = this.data.plan;
      if (!plan) {
        console.error('未找到计划实例，无法更新');
        return;
      }
      // 更新云端exerStatus字段
      plan.set('exerStatus', exerStatus);
      await plan.save();
      console.log('计划完成情况已同步到云端');
    } catch (error) {
      console.error('同步计划完成情况到云端失败:', error);
      wx.showToast({
        title: '同步失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 切换任务完成状态
  toggleTaskCompletion(e) {
  const taskId = e.currentTarget.dataset.id;
  const todayTasks = [...this.data.todayTasks];
  const taskIndex = todayTasks.findIndex(task => task.id === taskId);
  app.globalData.planTodayTasks = this.data.todayTasks;
  
  if (taskIndex !== -1) {
    // 更新本地任务状态
    todayTasks[taskIndex].completed = !todayTasks[taskIndex].completed;   
    const tasksCompleted = todayTasks.filter(task => task.completed).length;
    // 更新exerStatus数组（与todayTasks顺序一致）
    const { exerStatus } = this.data.planInfo;
    const newExerStatus = Array.isArray(exerStatus) 
      ? [...exerStatus] 
      : todayTasks.map(() => false); // 初始化默认值
    newExerStatus[taskIndex] = todayTasks[taskIndex].completed;
    // 更新本地数据
    this.setData({
      todayTasks: todayTasks,
      tasksCompleted: tasksCompleted,
      'planInfo.exerStatus': newExerStatus // 更新本地planInfo中的状态
    });
    // 上传到云端
    this.updateExerStatusToCloud(newExerStatus); 
    
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
    const diffic = e.currentTarget.dataset.diffic;
    this.setData({ 
      showModal: true,
      modalDesc: desc, // 存到 data 方便弹窗里用
      modalDiffic: diffic
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
      url: '/pages/chat/chat' // 这里换成你的聊天页面路径
    });
  },

  async onLoad() {
    await this.queryPlanInfo();
    // 获取今天是星期几（0是周日，转换为1-7，再转为0-6代表周一到周日）
    const today = new Date().getDay();
    const currentDay = today === 0 ? 6 : today - 1;
    const planInfo = this.data.planInfo;
    const currentStage = planInfo.stageIndex - 1;

    // 1. 提取所有completed状态到一维数组
    const completedArray = this.data.plan.todo.map(item => item.completed);
    
    // 2. 拆分所有content并生成二级数组
    const contentArray = this.data.plan.todo.map(item => {
      return item.content.split('，'); // 按中文逗号拆分单个content
    });

    // 更新数据
    this.setData({
      completedArray,
      contentArray
    });
    
    // 加载训练计划
    this.loadTrainingPlan();

  // 加载今日任务（和 home 页面逻辑一致）
  this.loadTodayTasks();
    this.setData({
      currentDay: currentDay,
      oldDay:currentDay,
      currentStage: currentStage,
      realStage:currentStage
    });
  },

  // 扣子函数
  getDoctorTip() {
    wx.request({
      url: 'https://api.coze.cn/v3/chat',
      method: 'POST',
      header: {
        'Authorization': 'Bearer pat_AK6vk0ZYDKO1E9jMYsqDeWjjBIaAHP1nUf0blLCwAM8kEJsv2HoUeFaOUTWTBU5w', // 注意是 Bearer
        'Content-Type': 'application/json'
      },
      data:{
        bot_id: '7545780444190031926',
        user_id: 'test_user',
        additional_messages: [
          {
            role: 'user',
            type: 'question',
            content_type: 'text',
            content:  `屈曲度10°，膝盖轻微疼痛，术后1周`
          }
        ],
        stream: false
      },
      success:(res)=>{
        let conversation_id=res.data.data.conversation_id
        let chat_id = res.data.data.id
        //轮询智能体调用状态
        this.pollStatus(chat_id, conversation_id)
      },
      fail:(err)=>{
        wx.showToast({
        title:'请求失败',
        icon: 'none'
        })
      }
      //  发起对话成功后使用轮询查看智能体对当前会话的处理情况
    });
  },

  pollStatus(chat_id, conversation_id) {
    // 每隔 3 秒查询一次状态
    let intervalId = setInterval(() => {
      wx.request({
        url: 'https://api.coze.cn/v3/chat/retrieve',
        method: 'GET',
        header: {
          'Authorization': `Bearer pat_AK6vk0ZYDKO1E9jMYsqDeWjjBIaAHP1nUf0blLCwAM8kEJsv2HoUeFaOUTWTBU5w`, // 确保 token 有权限
          'Content-Type': 'application/json'
        },
        data: {
          conversation_id: conversation_id,
          chat_id: chat_id
        },
        success: (res) => {
            let status = res.data.data.status;
            if (status === 'completed') {
              // 状态完成，停止轮询，获取最终消息
              clearInterval(intervalId);
              this.getAgentMessage(chat_id, conversation_id);
            } else if (status === 'in_progress') {
              // 状态进行中
              wx.showToast({
                title: '等待加载...',
                icon: 'loading',
                duration: 1000
              });
            } else {
              // 其他状态，停止轮询并提示
              clearInterval(intervalId);
              wx.showToast({
                title: `Agent调用失败: ${status}`,
                icon: 'none'
              });
            }
        },
        fail: (err) => {
          clearInterval(intervalId);
          console.error('状态查询接口失败', err);
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    }, 3000); // 3 秒间隔
  },
  
  getAgentMessage(chat_id, conversation_id) {
    wx.request({
      url: 'https://api.coze.cn/v3/chat/message/list',
      method: 'GET',
      header: {
        'Authorization': `Bearer pat_AK6vk0ZYDKO1E9jMYsqDeWjjBIaAHP1nUf0blLCwAM8kEJsv2HoUeFaOUTWTBU5w`, // 确保 Token 有权限
        'Content-Type': 'application/json'
      },
      data: {
        conversation_id: conversation_id,
        chat_id: chat_id
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          const messages = res.data.data;
          // 假设返回是数组，找第一个智能体回答
          const answerMsg = messages.find(m => m.role === 'assistant');
          
          if (answerMsg) {
            this.setData({
              doctorTip: answerMsg.content
            });
          } else {
            wx.showToast({
              title: '未获取到医生提示',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: `消息获取失败(${res.statusCode})`,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('消息列表请求失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
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
          id: 0,
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
