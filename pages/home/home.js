const app = getApp();
const AV = app.globalData.AV || require('../../libs/av-core-min.js');
Page({
  data: {
    patientInfo: {
      name: '',
      operationDate: ''
    },
    daysAfterSurgery: 0,
    currentRecord: {
      pain: { average: 0, rest: 0, activity: 0 },
      rangeOfMotion: { flexion: 0, extension: 0 },
      muscleStrength: { quadriceps: 0 },
      swellingLevel: 0
    },
    painTrend: 0,
    romTrend: 0,
    swellingTrend: 0,
    muscleStrengthPercent: 0,
    todayTasks: [],
    tasksCompleted: 0,
    totalTasks: 0,
    dateRanges: ['近7天', '近30天', '全部'],
    selectedDateRange: 0,
    chartRecords: [],
    notificationCount: 0,
    nextFollowupDays: 0,
    loading: true,
    // 新增：用于跟踪任务完成状态数组（与plan.js保持一致）
    exerStatus: [],
    // 新增：保存当前Plan记录实例
    currentPlan: null
  },

  async queryPatientData() {
    try {
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        this.setData({ loading: false });
        return;
      }
      
      this.setData({ loading: true });
      const patientResult = await this.queryPatientTable();
      
      if (patientResult) {
        const patientInfo = {
          name: patientResult.get('name'),
          operationDate: patientResult.get('operationDate') || this.calculateSurgeryDate(28)
        };
        const daysAfterSurgery = this.calculateDaysAfterSurgery(patientInfo.operationDate);
        const nextFollowupDays = this.calculateDaysUntilFollowup(null, daysAfterSurgery);
        
        this.setData({
          patientInfo,
          daysAfterSurgery,
          nextFollowupDays
        });
        console.log('云端患者数据获取成功');
      } else {
        console.log('云端未找到患者数据');
        const defaultOperationDate = this.calculateSurgeryDate(28);
        const daysAfterSurgery = this.calculateDaysAfterSurgery(defaultOperationDate);
        const nextFollowupDays = this.calculateDaysUntilFollowup(null, daysAfterSurgery);
        
        this.setData({
          patientInfo: {
            name: '',
            operationDate: defaultOperationDate
          },
          daysAfterSurgery,
          nextFollowupDays
        });
      }
      
      const notificationCount = Math.floor(Math.random() * 5);
      this.setData({
        notificationCount,
        loading: false
      });
    } catch (error) {
      console.error('查询患者数据时发生错误：', error);
      if (error.code === 100) {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
      } else if (error.code === 401) {
        wx.showToast({ title: '用户未授权，请重新登录', icon: 'none' });
      } else {
        wx.showToast({ title: '获取患者数据失败', icon: 'none' });
      }
      
      this.setData({
        patientInfo: {},
        daysAfterSurgery: 0,
        nextFollowupDays: 0,
        loading: false
      });
    }
  },

  async queryPatientTable() {
    try {
      if (app.globalData && app.globalData.patientId) {
        console.log('使用patientId定位表格并查询数据:', app.globalData.patientId);
        try {
          return await AV.Object.createWithoutData('Patient', app.globalData.patientId).fetch();
        } catch (idError) {
          console.warn('通过patientId查询患者表失败:', idError);
          throw idError;
        }
      } else {
        console.error('未找到全局变量patientId');
        return null;
      }
    } catch (error) {
      console.error('查询患者表失败:', error);
      return null;
    }
  },

  async loadRecoveryRecords() {
    try {
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        this.setData({ loading: false });
        return;
      }
      
      this.setData({ loading: true });
      const recoverId = app.globalData.recoverId;
      console.log('尝试获取康复记录 - recoverId:', recoverId);
      
      let records = [];
      
      if (recoverId) {
        console.log('使用recoverId定位表格并查询数据:', recoverId);
        try {
          const recover = await AV.Object.createWithoutData('Recover', recoverId).fetch();
          records = [recover];
        } catch (idError) {
          console.warn('通过recoverId查询康复记录失败:', idError);
        }
      }
      
      if (records.length === 0 && app.globalData.patientId) {
        console.log('尝试通过patientId关联查询康复记录:', app.globalData.patientId);
        try {
          const query = new AV.Query('Recover');
          query.equalTo('patientId', app.globalData.patientId);
          query.descending('createdAt');
          query.limit(7);
          records = await query.find();
          
          if (records.length > 0) {
            console.log('通过patientId关联查询到康复记录:', records.length, '条');
          }
        } catch (patientError) {
          console.warn('通过patientId关联查询康复记录失败:', patientError);
        }
      }
      
      if (records.length === 0) {
        console.log('尝试查询所有康复记录（仅用于调试）');
        try {
          const query = new AV.Query('Recover');
          query.descending('createdAt');
          query.limit(7);
          records = await query.find();
        } catch (allError) {
          console.warn('查询所有康复记录失败:', allError);
        }
      }
      
      const formattedRecords = records.map(record => {
        const rest = record.get('restPain') || 0;
        const activity = record.get('activityPain') || 0;
        const data = {
          pain: {
            rest: rest,
            activity: activity,
            average: Math.round((rest + activity) * 0.5)
          },
          rangeOfMotion: {
            flexion: record.get('flexionAngle') || record.get('flexionangle') || 0,
            extension: record.get('extensionAngle') || record.get('extensionangle') || 0
          },
          muscleStrength: {
            quadriceps: record.get('quadricepsStrength') || 0
          },
          swellingLevel: record.get('swellingLevel') || 0,
          date: record.get('createdAt') ? record.get('createdAt').toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
        data.createdAt = record.getCreatedAt() || new Date();
        return data;
      });
      
      if (formattedRecords.length > 0) {
        this.processRecoveryRecords(formattedRecords);
        console.log('云端康复记录获取成功');
      } else {
        console.log('云端没有找到康复记录，使用固定示例数据');
        const mockRecords = this.generateFixedMockRecoveryRecords();
        this.processRecoveryRecords(mockRecords);
        wx.showToast({
          title: '使用示例康复数据',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('加载康复记录时出错:', error);
      if (error.code === 100) {
        wx.showToast({
          title: '网络连接异常，请检查网络设置',
          icon: 'none',
          duration: 3000
        });
      } else {
        wx.showToast({
          title: '获取康复记录失败：' + (error.message || error.code),
          icon: 'none'
        });
      }
      
      const mockRecords = this.generateFixedMockRecoveryRecords();
      this.processRecoveryRecords(mockRecords);
    }
  },

  generateFixedMockRecoveryRecords() {
    const records = [];
    const today = new Date();
    
    const fixedData = [
      { rest: 3, activity: 4, flexion: 114, extension: 0, quadriceps: 4, swelling: 1.4 },
      { rest: 3, activity: 5, flexion: 112, extension: 0, quadriceps: 4, swelling: 1.5 },
      { rest: 2, activity: 4, flexion: 110, extension: 0, quadriceps: 4, swelling: 1.6 },
      { rest: 2, activity: 5, flexion: 108, extension: 0, quadriceps: 3, swelling: 1.7 },
      { rest: 3, activity: 5, flexion: 106, extension: 0, quadriceps: 3, swelling: 1.8 },
      { rest: 3, activity: 6, flexion: 104, extension: 0, quadriceps: 3, swelling: 1.9 },
      { rest: 4, activity: 6, flexion: 102, extension: 0, quadriceps: 3, swelling: 2.0 }
    ];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const data = fixedData[i];
      
      records.push({
        date: dateStr,
        pain: {
          rest: data.rest,
          activity: data.activity,
          average: Math.round((data.rest + data.activity) / 2)
        },
        rangeOfMotion: {
          flexion: data.flexion,
          extension: data.extension
        },
        muscleStrength: {
          quadriceps: data.quadriceps
        },
        swelling: {
          difference: data.swelling
        },
        createdAt: date
      });
    }
    
    return records;
  },

  async queryRecoveryRecordsByUserId(userId) {
    try {
      const query = new AV.Query('Recover');
      query.equalTo('userId', userId);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.greaterThanOrEqualTo('createdAt', sevenDaysAgo);
      
      query.descending('createdAt');
      return await query.find();
    } catch (error) {
      console.error('通过用户ID查询康复记录失败:', error);
      return [];
    }
  },

  generateMockRecoveryRecords() {
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
          average: 0
        },
        rangeOfMotion: {
          flexion: 100 + i * 2,
          extension: 0
        },
        muscleStrength: {
          quadriceps: 3 + Math.floor(i / 3)
        },
        swelling: {
          difference: 2.0 - i * 0.2
        },
        createdAt: date
      });
    }
    
    records.forEach(record => {
      record.pain.average = Math.round(
        (record.pain.rest + record.pain.activity) / 2
      );
    });
    
    return records;
  },

  processRecoveryRecords(records) {
    if (records.length === 0) return;
    
    const sortedRecords = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const currentRecord = sortedRecords[0];
    currentRecord.pain.average = Math.round(
      (currentRecord.pain.rest + currentRecord.pain.activity) / 2
    );
    
    let painTrend = 0, romTrend = 0, swellingTrend = 0;
    if (sortedRecords.length > 1) {
      const previousRecord = sortedRecords[1];
      painTrend = previousRecord.pain.average - currentRecord.pain.average;
      romTrend = currentRecord.rangeOfMotion.flexion - previousRecord.rangeOfMotion.flexion;
      swellingTrend = previousRecord.swelling.difference - currentRecord.swelling.difference;
    }
    
    const muscleStrengthPercent = currentRecord.muscleStrength.quadriceps ? currentRecord.muscleStrength.quadriceps * 20 : 70;
    const chartRecords = sortedRecords.slice(0, 7);
    
    const formattedChartData = chartRecords.map(record => {
      const painAvg = typeof record.pain.average === 'number' ? record.pain.average : parseFloat(record.pain.average) || 0;
      const flexion = typeof record.rangeOfMotion.flexion === 'number' ? record.rangeOfMotion.flexion : parseFloat(record.rangeOfMotion.flexion) || 0;
      const quadriceps = typeof record.muscleStrength.quadriceps === 'number' ? record.muscleStrength.quadriceps : parseInt(record.muscleStrength.quadriceps) || 0;
      
      return {
        date: record.date,
        pain: {
          average: painAvg,
          rest: typeof record.pain.rest === 'number' ? record.pain.rest : parseFloat(record.pain.rest) || 0,
          activity: typeof record.pain.activity === 'number' ? record.pain.activity : parseFloat(record.pain.activity) || 0
        },
        rangeOfMotion: {
          flexion: flexion,
          extension: typeof record.rangeOfMotion.extension === 'number' ? record.rangeOfMotion.extension : parseFloat(record.rangeOfMotion.extension) || 0
        },
        muscleStrength: {
          quadriceps: quadriceps
        },
        swellingLevel: typeof record.swellingLevel === 'number' 
        ? record.swellingLevel 
        : parseFloat(record.swellingLevel) || 0,
        createdAt: record.createdAt
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    this.setData({
      currentRecord,
      painTrend,
      romTrend,
      swellingTrend,
      muscleStrengthPercent,
      chartRecords: formattedChartData,
      loading: false
    });
  },

  updateTaskCounts(tasks) {
    const tasksCompleted = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    
    this.setData({
      todayTasks: tasks,
      tasksCompleted,
      totalTasks
    });
  },

  // 切换任务完成状态（同步plan.js逻辑）
  toggleTaskCompletion(e) {
    const { id } = e.currentTarget.dataset;
    const todayTasks = [...this.data.todayTasks];
    const taskIndex = todayTasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      // 更新本地任务状态
      todayTasks[taskIndex].completed = !todayTasks[taskIndex].completed;
      const tasksCompleted = todayTasks.filter(task => task.completed).length;
      
      // 更新exerStatus数组（与plan.js保持一致）
      const newExerStatus = [...this.data.exerStatus];
      newExerStatus[taskIndex] = todayTasks[taskIndex].completed;
      
      // 更新本地数据
      this.setData({
        todayTasks: todayTasks,
        tasksCompleted: tasksCompleted,
        exerStatus: newExerStatus
      });
      
      // 同步到云端（核心修改）
      this.updateExerStatusToCloud(newExerStatus);
      
      // 同步到本地缓存
      wx.setStorageSync('currentPlanTasks', todayTasks);
      
      // 全完成提示
      if (tasksCompleted === this.data.totalTasks) {
        wx.showToast({
          title: '太棒了！完成所有训练',
          icon: 'success',
          duration: 2000
        });
      }
    }
  },

  // 上传exerStatus到云端（复用plan.js核心逻辑）
  async updateExerStatusToCloud(exerStatus) {
    try {
      const plan = this.data.currentPlan;
      if (!plan) {
        console.error('未找到计划实例，无法更新');
        wx.showToast({
          title: '同步失败：未找到计划',
          icon: 'none'
        });
        return;
      }
      
      // 更新云端exerStatus字段
      plan.set('exerStatus', exerStatus);
      
      // 同时更新todo字段中的completed状态（如果是用户特定的数据结构）
      const todoData = plan.get('todo') || [];
      if (Array.isArray(todoData) && todoData.length > 0) {
        const hasCustomStructure = typeof todoData[0] === 'object' && 
                                 'completed' in todoData[0] && 
                                 'content' in todoData[0];
        
        if (hasCustomStructure) {
          // 确保todoData的长度与exerStatus一致
          const updatedTodoData = [...todoData];
          exerStatus.forEach((completed, index) => {
            if (index < updatedTodoData.length) {
              updatedTodoData[index].completed = completed;
            }
          });
          
          plan.set('todo', updatedTodoData);
          console.log('同步更新todo字段中的任务状态');
        }
      }
      
      await plan.save();
      console.log('Plan表任务状态同步成功:', exerStatus);

    } catch (error) {
      console.error('同步计划完成情况到云端失败:', error);
      wx.showToast({
        title: error.code === 100 ? '网络异常，同步失败' : '同步失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  retryCloudSync() {
    this.setData({ loading: true });
    console.log('开始重新同步云端数据...');
    this.queryPatientData();
    this.loadRecoveryRecords();
    this.loadTodayTasks();
  },

  getChartRecords(records, rangeIndex) {
    let filteredRecords = [...records];
    
    switch (rangeIndex) {
      case 0:
        filteredRecords = records.slice(0, 7);
        break;
      case 1:
        filteredRecords = records.slice(0, 30);
        break;
      case 2:
      default:
        break;
    }
    
    return filteredRecords;
  },

  onDateRangeChange(e) {
    const { index } = e.detail;
    const chartRecords = this.getChartRecords(this.data.chartRecords, index);
    
    this.setData({
      selectedDateRange: index,
      chartRecords
    });
  },

  calculateSurgeryDate(daysAgo) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('日期计算错误:', error);
      return '';
    }
  },

  calculateDaysAfterSurgery(surgeryDate) {
    try {
      const surgery = new Date(surgeryDate);
      const today = new Date();
      const diffTime = Math.abs(today - surgery);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('日期计算错误:', error);
      return 0;
    }
  },

  calculateDaysUntilFollowup(nextFollowupDate, daysAfterSurgery) {
    try {
      const cycles = Math.floor(daysAfterSurgery / 7);
      const nextFollowupDay = (cycles + 1) * 7;
      const daysUntilFollowup = nextFollowupDay - daysAfterSurgery;
      
      return daysUntilFollowup > 0 ? daysUntilFollowup : 7;
    } catch (error) {
      console.error('计算下次复诊时间失败:', error);
      return 7;
    }
  },

  async loadTodayTasks() {
    try {
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        this.setData({ loading: false });
        return;
      }
      
      this.setData({ loading: true });
      const planId = app.globalData.planId;
      let planRecords = null;
      let currentPlan = null;
      
      try {
        console.log('尝试从云端Plan表获取今日任务数据');
        
        if (planId) {
          console.log('使用planId定位表格并查询数据:', planId);
          try {
            // 获取Plan实例（用于后续更新）
            currentPlan = await AV.Object.createWithoutData('Plan', planId).fetch();
            planRecords = [currentPlan];
          } catch (idError) {
            console.warn('通过planId查询Plan表失败:', idError);
            throw idError;
          }
        } else {
          console.error('未找到全局变量planId');
          planRecords = null;
        }
        
        if (!planRecords) {
          const today = new Date().toISOString().split('T')[0];
          const query = new AV.Query('Plan');
          query.equalTo('date', today);
          planRecords = await query.find();
          currentPlan = planRecords.length > 0 ? planRecords[0] : null;
        }
        
        if (planRecords && planRecords.length > 0) {
          const planData = planRecords[0];
          
          // 优先尝试读取todo数据结构
          const todoData = planData.get('todo') || [];
          
          // 检查todo数据是否为有效的数组且包含正确的结构
          if (Array.isArray(todoData) && todoData.length > 0) {
            const hasCustomStructure = typeof todoData[0] === 'object' && 
                                     'completed' in todoData[0] && 
                                     'content' in todoData[0];
            
            if (hasCustomStructure) {
              // 使用todo数据构建任务列表
              const formattedTasks = todoData.map((todoItem, index) => {
                // 从content中提取任务内容和任务量信息
                // 支持中文逗号和英文逗号
                const contentParts = todoItem.content.split(/[,，]/);
                let taskName = todoItem.content; // 默认使用全部内容作为任务名称
                let taskAmount = ''; // 任务量信息
                let sets = 0;
                let reps = '';
                
                // 处理逗号分隔的三小句格式
                if (contentParts.length >= 3) {
                  // 第一小句作为任务内容
                  taskName = contentParts[0].trim();
                  
                  // 提取时间和组数信息
                  const timeInfo = contentParts[1].trim();
                  const setsInfo = contentParts[2].trim();
                  
                  // 提取数字信息
                  const timeMatch = timeInfo.match(/\d+/);
                  const setsMatch = setsInfo.match(/\d+/);
                  
                  const time = timeMatch ? parseInt(timeMatch[0]) : 0;
                  sets = setsMatch ? parseInt(setsMatch[0]) : 0;
                  
                  // 计算并格式化任务量（组数*时间）
                  if (time > 0 && sets > 0) {
                    taskAmount = `${sets}组 × ${time}秒`;
                    reps = `${time}秒/组`;
                  } else if (time > 0) {
                    // 只有时间信息的情况
                    taskAmount = `${time}秒/次`;
                    reps = `${time}秒/次`;
                  } else if (sets > 0) {
                    // 只有组数信息的情况
                    taskAmount = `${sets}组`;
                    reps = `${sets}组`;
                  }
                } else if (contentParts.length === 2) {
                  // 处理逗号分隔的两小句格式
                  taskName = contentParts[0].trim();
                  const detailInfo = contentParts[1].trim();
                  
                  // 尝试提取时间和组数信息
                  const timeMatch = detailInfo.match(/\d+分钟|\d+秒/);
                  const setsMatch = detailInfo.match(/\d+次|\d+组/);
                  
                  if (timeMatch || setsMatch) {
                    taskAmount = detailInfo;
                  }
                }
                
                return {
                  id: `plan-${planData.id}-todo-${index}`,
                  planId: planData.id,
                  taskIndex: index,
                  name: taskName, // 任务内容作为主词条
                  description: taskAmount, // 任务量作为副词条
                  sets: sets,
                  reps: reps,
                  completed: todoItem.completed || false
                };
              });
              
              // 初始化exerStatus数组（与todo数据保持一致）
              const initExerStatus = todoData.map(item => item.completed || false);
              
              this.setData({
                currentPlan: planData, // 保存Plan实例用于后续更新
                exerStatus: initExerStatus
              });
              this.updateTaskCounts(formattedTasks);
              wx.setStorageSync('currentPlanTasks', formattedTasks);
              console.log('从Plan表获取todo任务数据成功');
              return;
            }
          }
          
          // 如果没有有效的todo数据，则回退到原有的处理逻辑
          const exerciseTasks = planData.get('exerIndex') || [];
          const exerciseStatus = planData.get('exerStatus') || [];
          
          // 获取本地训练计划数据
          const allExercises = wx.getStorageSync('trainingPlans') || [];
          
          if (exerciseTasks.length > 0) {
            // 初始化exerStatus数组（与plan.js保持一致）
            const initExerStatus = Array.isArray(exerciseStatus) 
              ? exerciseStatus 
              : exerciseTasks.map(() => false);
            
            const formattedTasks = exerciseTasks.map((taskId, index) => {
              const matchedExercise = allExercises.find(ex => ex.id == taskId);
              return {
                id: `plan-${planData.id}-task-${index}`,
                planId: planData.id,
                taskIndex: index,
                name: matchedExercise?.name || `训练任务${index + 1}`,
                description: planData.get('exerDesc')?.[index] || matchedExercise?.description || '',
                sets: matchedExercise?.sets || 0,
                reps: matchedExercise?.reps || '',
                completed: initExerStatus[index] || false
              };
            });
            
            this.setData({
              currentPlan: planData, // 保存Plan实例用于后续更新
              exerStatus: initExerStatus
            });
            this.updateTaskCounts(formattedTasks);
            wx.setStorageSync('currentPlanTasks', formattedTasks);
            console.log('从Plan表获取今日任务数据成功');
            return;
          }
        }
      } catch (dbError) {
        console.log('Plan表查询出错或表不存在:', dbError);
      }
      
      console.log('云端没有找到任务数据，不显示任何任务');
      
      // 当云端没有数据时，显示空任务列表
      this.setData({
        exerStatus: [],
        currentPlan: null
      });
      this.updateTaskCounts([]);
      wx.setStorageSync('currentPlanTasks', []);
    } catch (error) {
      console.error('加载任务数据时发生错误:', error);
      wx.showToast({
        title: '加载任务数据失败',
        icon: 'none'
      });
      
      this.setData({
        todayTasks: [],
        tasksCompleted: 0,
        totalTasks: 0,
        exerStatus: []
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/me/me'
    });
  },

  openDoctorChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  generateReport() {
    wx.navigateTo({
      url: '/pages/baogao/baogao'
    });
  },

  onShow() {
    if (!app || !app.globalData) {
      console.error('全局应用实例或全局数据未初始化');
      return;
    }
    
    const hasPatientId = !!app.globalData.patientId;
    const hasRecoverId = !!app.globalData.recoverId;
    const hasPlanId = !!app.globalData.planId;
    
    console.log('全局表格ID状态:');
    console.log('- patientId:', hasPatientId ? app.globalData.patientId : '未设置');
    console.log('- recoverId:', hasRecoverId ? app.globalData.recoverId : '未设置');
    console.log('- planId:', hasPlanId ? app.globalData.planId : '未设置');
    
    if (!hasPatientId || !hasRecoverId || !hasPlanId) {
      console.warn('缺少部分全局表格ID，可能影响数据加载');
    }
    
    this.setData({ loading: true });
    
    wx.getNetworkType({
      success: res => {
        const networkType = res.networkType;
        console.log('当前网络类型:', networkType);
        
        if (networkType === 'none') {
          wx.showToast({
            title: '当前无网络连接',
            icon: 'none'
          });
          // 不使用缓存任务数据，确保只显示云端数据
          this.setData({
            todayTasks: [],
            tasksCompleted: 0,
            totalTasks: 0,
            loading: false
          });
        } else {
          // 有网络时，清理旧的缓存数据
          wx.setStorageSync('currentPlanTasks', []);
          this.queryPatientData();
          this.loadRecoveryRecords();
          this.loadTodayTasks();
        }
      },
      fail: err => {
        console.error('检查网络状态失败:', err);
        // 失败时也不使用缓存，而是尝试加载云端数据
        this.queryPatientData();
        this.loadRecoveryRecords();
        this.loadTodayTasks();
      }
    });
  },
});