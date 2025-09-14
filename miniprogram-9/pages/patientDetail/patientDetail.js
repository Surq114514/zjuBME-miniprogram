const app = getApp();
const AV = require('../../libs/av-core-min');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    basicinfo:{
      name:'',
      gender:'',
      age:'',
      phone:'',
      surgerytime:'',
      surgerytype:'',
      doctor: ''
    },
    // 康复指标
    recoveryMetrics: {
      flexionangle: '', // 屈膝角度
      extentionangle: '', // 伸膝角度
      pain: '', // 疼痛评分
      strength: '', // 肌肉力量
      swell: '' // 肿胀程度
    },
    isEditMode: false,
    patient: {
      status: '',
      postOp: '',
      followUp: '',
      progressBarClass: '',
      progressBarWidth: '',
      statusClass: '' // 状态标签样式
    },
    // 康复计划数据
    recoveryPlan: {
      planItems: [
        { id: 1, content: '每日进行膝关节屈伸练习', completed: false },
        { id: 2, content: '开始进行轻度负重训练', completed: false },
        { id: 3, content: '进行股四头肌力量训练', completed: false }
      ],
      planId: ''
    },
    // 当前患者ID
    currentPatientId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取当前病患ID并加载数据
    const patientId = app.getCurrentPatientId();
    if (patientId) {
      this.setData({ currentPatientId: patientId });
      console.log('当前患者ID:', patientId);
      // 并行加载患者基本信息和康复指标
      this.loadPatientInfo(patientId);
      this.loadRecoveryMetrics(patientId);
      this.loadRecoveryPlan(patientId);
    } else {
      console.error('无法获取患者ID');
      // 如果没有病患ID，返回上一页
      wx.navigateBack();
    }
  },

  /**
   * 加载患者基本信息
   */
  loadPatientInfo(patientId) {
    const query = new AV.Query('Patient');
    query.get(patientId).then(result => {
      const patientData = result.toJSON();
      console.log('患者基本信息:', patientData);
      
      // 计算下次随访日期（每7天一次，从手术日期开始算）
      const followUpDate = this.calculateNextFollowUpDate(patientData.operationDate);
      
      // 处理数据并设置到页面
      this.setData({
        patient: {
          status: patientData.status || '',
          postOp: patientData.postOp || '',
          followUp: followUpDate || '',
          progressBarClass: patientData.progressBarClass || '',
          progressBarWidth: patientData.progressBarWidth || '',
          statusClass: patientData.statusClass || ''
        },
        basicinfo: {
          name: patientData.name || '',
          gender: patientData.gender || '',
          age: patientData.age || '',
          phone: patientData.phone || '',
          surgerytime: patientData.operationDate ? this.formatDate(new Date(patientData.operationDate)) : '',
          surgerytype: patientData.surgery || '',
          doctor: patientData.doctor || ''
        }
      });
    }).catch(error => {
      console.error('获取病患详情失败:', error);
      wx.showToast({
        title: '加载病患详情失败',
        icon: 'none'
      });
    });
  },

  /**
   * 加载康复指标 - 使用与查询Patient表格相同的方式
   */
  loadRecoveryMetrics(patientId) {
    // 先从Patient表格获取recoverId
    const patientQuery = new AV.Query('Patient');
    patientQuery.get(patientId).then(patientResult => {
      const patientData = patientResult.toJSON();
      // 假设Patient表格中有一个字段指向对应的Recover记录ID
      const recoverId = patientData.recoverId || patientData.objectId; // 尝试使用相同ID或特定字段
      
      if (recoverId) {
        console.log('使用recoverId查询:', recoverId);
        const recoverQuery = new AV.Query('Recover');
        recoverQuery.get(recoverId).then(recoverResult => {
          const recoverData = recoverResult.toJSON();
          console.log('康复指标数据:', recoverData);
          this.setData({
            recoveryMetrics: {
              flexionangle: recoverData.flexionAngle || '',
              extentionangle: recoverData.extensionAngle || '',
              pain: recoverData.painLevel || '',
              strength: recoverData.quadricepsStrength || '',
              swell: recoverData.swellingLevel || ''
            }
          });
        }).catch(recoverError => {
          console.error('通过ID获取康复指标失败:', recoverError);
          // 如果通过ID查询失败，尝试使用equalTo查询
          this.tryLoadRecoveryMetricsWithEqual(patientId);
        });
      } else {
        console.log('患者记录中未找到recoverId，尝试其他方式');
        this.tryLoadRecoveryMetricsWithEqual(patientId);
      }
    }).catch(patientError => {
      console.error('获取患者信息失败:', patientError);
      // 如果获取患者信息失败，直接尝试使用equalTo查询
      this.tryLoadRecoveryMetricsWithEqual(patientId);
    });
  },

  /**
   * 尝试使用equalTo查询康复指标
   */
  tryLoadRecoveryMetricsWithEqual(patientId) {
    const query = new AV.Query('Recover');
    query.equalTo('patientId', patientId);
    query.descending('createdAt'); // 获取最新的记录
    query.first().then(result => {
      if (result) {
        const recoverData = result.toJSON();
        console.log('通过equalTo查询到康复指标数据:', recoverData);
        this.setData({
          recoveryMetrics: {
            flexionangle: recoverData.flexionAngle || '',
            extentionangle: recoverData.extensionAngle || '',
            pain: recoverData.painLevel || '',
            strength: recoverData.quadricepsStrength || '',
            swell: recoverData.swellingLevel || ''
          }
        });
      } else {
        console.log('未找到该患者的康复指标记录');
      }
    }).catch(error => {
      console.error('获取康复指标失败:', error);
      wx.showToast({
        title: '加载康复指标失败',
        icon: 'none'
      });
    });
  },

  /**
   * 加载康复计划 - 使用与查询Patient表格相同的方式
   */
  loadRecoveryPlan(patientId) {
    // 先从Patient表格获取planId
    const patientQuery = new AV.Query('Patient');
    patientQuery.get(patientId).then(patientResult => {
      const patientData = patientResult.toJSON();
      // 假设Patient表格中有一个字段指向对应的Plan记录ID
      const planId = patientData.planId || patientData.objectId; // 尝试使用相同ID或特定字段
      
      if (planId) {
        console.log('使用planId查询:', planId);
        const planQuery = new AV.Query('Plan');
        planQuery.get(planId).then(planResult => {
          const planData = planResult.toJSON();
          console.log('康复计划数据:', planData);
          this.setData({
            recoveryPlan: {
              planItems: planData.planItems || [
                { id: 1, content: '', completed: false },
                { id: 2, content: '', completed: false },
                { id: 3, content: '', completed: false }
              ],
              planId: planData.objectId
            }
          });
        }).catch(planError => {
          console.error('通过ID获取康复计划失败:', planError);
          // 如果通过ID查询失败，尝试使用equalTo查询
          this.tryLoadRecoveryPlanWithEqual(patientId);
        });
      } else {
        console.log('患者记录中未找到planId，尝试其他方式');
        this.tryLoadRecoveryPlanWithEqual(patientId);
      }
    }).catch(patientError => {
      console.error('获取患者信息失败:', patientError);
      // 如果获取患者信息失败，直接尝试使用equalTo查询
      this.tryLoadRecoveryPlanWithEqual(patientId);
    });
  },

  /**
   * 尝试使用equalTo查询康复计划
   */
  tryLoadRecoveryPlanWithEqual(patientId) {
    const query = new AV.Query('Plan');
    query.equalTo('patientId', patientId);
    query.first().then(result => {
      if (result) {
        const planData = result.toJSON();
        console.log('通过equalTo查询到康复计划数据:', planData);
        this.setData({
          recoveryPlan: {
            planItems: planData.planItems || [
              { id: 1, content: '', completed: false },
              { id: 2, content: '', completed: false },
              { id: 3, content: '', completed: false }
            ],
            planId: planData.objectId
          }
        });
      } else {
        console.log('未找到该患者的康复计划记录');
      }
    }).catch(error => {
      console.error('获取康复计划失败:', error);
      wx.showToast({
        title: '加载康复计划失败',
        icon: 'none'
      });
    });
  },

  /**
   * 计算下次随访日期
   */
  calculateNextFollowUpDate(operationDate) {
    if (!operationDate) return '';
    
    const surgeryDate = new Date(operationDate);
    const today = new Date();
    
    // 计算从手术日期到今天的天数
    const daysSinceSurgery = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));
    
    // 计算下一个随访日期（每7天一次）
    let nextFollowUpDate;
    if (daysSinceSurgery % 7 === 0) {
      // 今天正好是随访日，下一次是7天后
      nextFollowUpDate = new Date(surgeryDate);
      nextFollowUpDate.setDate(surgeryDate.getDate() + daysSinceSurgery + 7);
    } else {
      // 找到距离今天最近的下一个随访日
      const daysUntilNextFollowUp = 7 - (daysSinceSurgery % 7);
      nextFollowUpDate = new Date(today);
      nextFollowUpDate.setDate(today.getDate() + daysUntilNextFollowUp);
    }
    
    return this.formatDate(nextFollowUpDate);
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 返回按钮点击事件
   */
  handleBackTap() {
    wx.navigateBack();
  },

  /**
   * 编辑计划按钮点击事件
   */
  handleEditPlanTap() {
    this.setData({
      isEditMode: !this.data.isEditMode
    });
  },

  /**
   * 取消编辑按钮点击事件
   */
  handleCancelEditTap() {
    this.setData({
      isEditMode: false
    });
  },

  /**
   * 保存编辑按钮点击事件 - 只保存到已有plan表中，不创建新记录
   */
  handleSaveEditTap() {
    const patientId = this.data.currentPatientId;
    
    // 先查找该患者是否已有plan记录
    const query = new AV.Query('Plan');
    query.equalTo('patientId', patientId);
    query.first().then(result => {
      if (result) {
        // 如果已有记录，更新现有记录
        const planObject = AV.Object.createWithoutData('Plan', result.id);
        // 设置计划数据
        planObject.set('planItems', this.data.recoveryPlan.planItems);
        // 保存到LeanCloud
        return planObject.save();
      } else {
        // 如果没有记录，不创建新记录，只显示提示
        wx.showToast({
          title: '该患者暂无计划记录',
          icon: 'none'
        });
        // 返回Promise避免后续代码执行
        return Promise.reject(new Error('No plan record found'));
      }
    }).then(savedResult => {
      this.setData({
        isEditMode: false,
        'recoveryPlan.planId': savedResult.id
      });
      
      // 显示保存成功提示
      wx.showToast({
        title: '康复计划已保存',
        icon: 'success',
        duration: 1500
      });
    }).catch(error => {
      if (error.message !== 'No plan record found') {
        console.error('保存康复计划失败:', error);
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 添加计划项目点击事件
   */
  handleAddPlanItemTap() {
    const planItems = [...this.data.recoveryPlan.planItems];
    const newId = Math.max(...planItems.map(item => item.id)) + 1;
    planItems.push({ id: newId, content: '', completed: false });
    
    this.setData({
      'recoveryPlan.planItems': planItems
    });
  },

  /**
   * 更新计划项目内容
   */
  onPlanItemInput(e) {
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    const planItems = [...this.data.recoveryPlan.planItems];
    const index = planItems.findIndex(item => item.id === id);
    
    if (index !== -1) {
      planItems[index].content = value;
      this.setData({
        'recoveryPlan.planItems': planItems
      });
    }
  },

  /**
   * 切换计划项目完成状态
   */
  onPlanItemToggle(e) {
    const { id } = e.currentTarget.dataset;
    const { completed } = e.detail;
    const planItems = [...this.data.recoveryPlan.planItems];
    const index = planItems.findIndex(item => item.id === id);
    
    if (index !== -1) {
      planItems[index].completed = !planItems[index].completed;
      this.setData({
        'recoveryPlan.planItems': planItems
      });
    }
  }
});