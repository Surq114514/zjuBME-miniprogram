const app = getApp();
const AV = app.globalData.AV || require('../../libs/av-core-min.js');

Page({
  data: {
    // 患者基础信息（从patient表格读取）
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    operationDate: '',
    operationType: '',
    nextVisitDate: '',
    doctor: '',
    diagnosis: '',
    side: '',
    
    // 康复指标（从recover表格读取）
    restPain: 0,
    activityPain: 0,
    averagePain: 0, // 疼痛指数平均值
    nightPain: 0,
    flexionAngle: 0,
    extensionAngle: 0,
    quadricepsStrength: 0,
    hamstringStrength: 3,
    swellingLevel: 0,
    JswellDown: '',
    JswellUp: '',
    HswellUp: '',
    HswellDown: '',
    walkingDistance: '',
    woundStatus: '',
    
    // 加载状态
    loading: true,
    error: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log(app.globalData)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查app.globalData是否存在
    if (!app || !app.globalData) {
      console.error('全局应用实例或全局数据未初始化');
      return;
    }
    
    // 检查全局表格ID是否存在
    const hasPatientId = !!app.globalData.patientId;
    const hasRecoverId = !!app.globalData.recoverId;
    const hasPlanId = !!app.globalData.planId;
    
    console.log('全局表格ID状态:');
    console.log('- patientId:', hasPatientId ? app.globalData.patientId : '未设置');
    console.log('- recoverId:', hasRecoverId ? app.globalData.recoverId : '未设置');
    console.log('- planId:', hasPlanId ? app.globalData.planId : '未设置');
    
    // 如果缺少关键ID，给出提示但仍继续尝试加载
    if (!hasPatientId || !hasRecoverId || !hasPlanId) {
      console.warn('缺少部分全局表格ID，可能影响数据加载');
    }
    
    this.setData({ loading: true });
    
    // 检查网络状态
    wx.getNetworkType({
      success: res => {
        const networkType = res.networkType;
        console.log('当前网络类型:', networkType);
        
        if (networkType === 'none') {
          wx.showToast({
            title: '当前无网络连接',
            icon: 'none'
          });
        }
        
        // 无论网络状态如何，都尝试从云端获取数据
        this.loadPatientAndRecoverData();
      },
      fail: err => {
        console.error('检查网络状态失败:', err);
        // 继续尝试获取数据
        this.loadPatientAndRecoverData();
      }
    });
  },

  // 加载患者基础信息和康复数据
  async loadPatientAndRecoverData() {
    try {
      // 显示加载状态
      this.setData({ loading: true, error: '' });
      
      // 同时加载患者信息和康复数据
      await Promise.all([
        this.loadPatientInfoById(),  // 通过ID加载患者信息
        this.loadRecoverDataById()   // 通过ID加载康复数据
      ]);
    } catch (error) {
      console.error('加载数据失败：', error);
      // 细化错误处理
      if (error.code === 100) {
        console.log('网络连接异常，请检查网络设置');
        wx.showToast({
          title: '网络连接异常',
          icon: 'none'
        });
      } else if (error.code === 401) {
        console.log('用户未授权，请重新登录');
        wx.showToast({
          title: '用户未授权，请重新登录',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
      
      this.setData({
        error: '数据加载失败，请稍后重试',
        loading: false
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 通过表格ID加载患者基础信息
  async loadPatientInfoById() {
    try {
      // 检查app.globalData是否存在
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        // 设置默认患者信息
        this.setDefaultPatientInfo();
        return;
      }
      
      // 检查是否有patientId
      if (!app.globalData.patientId) {
        console.log('未找到患者信息ID，使用默认患者信息');
        // 设置默认患者信息
        this.setDefaultPatientInfo();
        return;
      }
      
      console.log('使用患者ID加载数据:', app.globalData.patientId);
      
      //直接通过ID获取特定的患者记录
      const patient = await AV.Object.createWithoutData('Patient', app.globalData.patientId).fetch();
      
      // 更新患者基础信息
      this.setData({
        name: patient.get('name') || '张先生',
        gender: patient.get('gender') || '',
        age: patient.get('age') || '',
        height: patient.get('height') || '',
        weight: patient.get('weight') || '',
        operationDate: patient.get('operationDate') || this.calculateSurgeryDate(28),
        operationType: patient.get('operationType') || '',
        nextVisitDate: patient.get('nextVisitDate') || '',
        doctor: patient.get('doctor') || '',
        diagnosis: patient.get('diagnosis') || '',
        side: patient.get('side') || ''
      });
      
      console.log('患者信息加载成功:', this.data.name);
    } catch (error) {
      console.error('加载患者信息失败：', error);
      // 设置默认患者信息
      this.setDefaultPatientInfo();
    }
  },

  // 设置默认患者信息
  setDefaultPatientInfo() {
    const defaultOperationDate = this.calculateSurgeryDate(28);
    this.setData({
      name: '张先生',
      gender: '',
      age: '',
      height: '',
      weight: '',
      operationDate: defaultOperationDate,
      operationType: '',
      nextVisitDate: '',
      doctor: '',
      diagnosis: '',
      side: ''
    });
    console.log('已设置默认患者信息');
  },

  // 计算手术日期（几天前）
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

  // 通过表格ID加载康复数据
  async loadRecoverDataById() {
    try {
      // 检查app.globalData是否存在
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        // 设置默认康复数据
        this.setDefaultRecoverData();
        return;
      }
      
      // 检查是否有recoverId
      if (!app.globalData.recoverId) {
        console.log('未找到特定的康复记录ID，尝试加载该患者的最新康复记录');
        try {
          await this.loadPatientLatestRecoverData();
        } catch (latestError) {
          console.error('加载患者最新康复数据失败：', latestError);
          // 设置默认康复数据
          this.setDefaultRecoverData();
        }
        return;
      }
      
      console.log('使用康复记录ID加载数据:', app.globalData.recoverId);
      
      // 直接通过ID获取特定的康复记录
      const recover = await AV.Object.createWithoutData('Recover', app.globalData.recoverId).fetch();
      
      // 更新康复指标
      this.setData({
        restPain: recover.get('restPain') || 0,
        activityPain: recover.get('activityPain') || 0,
        averagePain: ((recover.get('restPain') || 0) + (recover.get('activityPain') || 0)) / 2,
        nightPain: recover.get('nightPain') || 0,
        flexionAngle: recover.get('flexionAngle') || 0,
        extensionAngle: recover.get('extensionAngle') || 0,
        quadricepsStrength: recover.get('quadricepsStrength') || 0,
        hamstringStrength: recover.get('hamstringStrength') || 0,
        swellingLevel: recover.get('swellingLevel') || 0,
        JswellDown: recover.get('JswellDown') || '',
        JswellUp: recover.get('JswellUp') || '',
        HswellUp: recover.get('HswellUp') || '',
        HswellDown: recover.get('HswellDown') || '',
        walkingDistance: recover.get('walkingDistance') || '',
        woundStatus: recover.get('woundStatus') || ''
      });
      
      console.log('特定康复记录加载成功');
    } catch (error) {
      console.error('加载特定康复记录失败：', error);
      // 尝试加载该患者的最新康复数据作为备选
      try {
        await this.loadPatientLatestRecoverData();
      } catch (backupError) {
        console.error('加载患者最新康复数据也失败：', backupError);
        // 设置默认康复数据
        this.setDefaultRecoverData();
      }
    }
  },

  // 设置默认康复数据
    setDefaultRecoverData() {
      this.setData({
        restPain: 0,
        activityPain: 0,
        averagePain: 0,
        nightPain: 0,
        flexionAngle: 0,
        extensionAngle: 0,
        quadricepsStrength: 0,
        hamstringStrength: 0,
      swellingLevel: 0,
      JswellDown: '',
      JswellUp: '',
      HswellUp: '',
      HswellDown: '',
      walkingDistance: '',
      woundStatus: ''
    });
    console.log('已设置默认康复数据');
  },

  // 加载特定患者的最新康复数据
  async loadPatientLatestRecoverData() {
    try {
      // 检查app.globalData是否存在
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        // 设置默认康复数据
        this.setDefaultRecoverData();
        return;
      }
      
      // 检查是否有patientId
      if (!app.globalData.patientId) {
        console.log('未找到患者ID，无法加载患者的康复记录');
        // 设置默认康复数据
        this.setDefaultRecoverData();
        return;
      }
      
      console.log('加载患者ID为', app.globalData.patientId, '的最新康复记录');
      
      const query = new AV.Query('Recover');
      // 通过患者ID筛选该患者的记录（关键：将患者ID与康复记录关联）
      query.equalTo('patientId', app.globalData.patientId);
      query.descending('createdAt'); // 按创建时间倒序
      query.limit(1); // 只获取最新的一条
      
      const results = await query.find();
      if (results && results.length > 0) {
        const recover = results[0];
          
          // 更新康复指标
          this.setData({
            restPain: recover.get('restPain') || 0,
            activityPain: recover.get('activityPain') || 0,
            averagePain: ((recover.get('restPain') || 0) + (recover.get('activityPain') || 0)) / 2,
            nightPain: recover.get('nightPain') || 0,
            flexionAngle: recover.get('flexionAngle') || 0,
            extensionAngle: recover.get('extensionAngle') || 0,
            quadricepsStrength: recover.get('quadricepsStrength') || 0,
            hamstringStrength: recover.get('hamstringStrength') || 0,
          swellingLevel: recover.get('swellingLevel') || 0,
          JswellDown: recover.get('JswellDown') || '',
          JswellUp: recover.get('JswellUp') || '',
          HswellUp: recover.get('HswellUp') || '',
          HswellDown: recover.get('HswellDown') || '',
          walkingDistance: recover.get('walkingDistance') || '',
          woundStatus: recover.get('woundStatus') || ''
        });
        
        console.log('患者最新康复记录加载成功');
      } else {
        console.log('未找到该患者的康复记录');
        // 设置默认康复数据
        this.setDefaultRecoverData();
      }
    } catch (error) {
      console.error('加载患者最新康复数据失败：', error);
      // 设置默认康复数据
      this.setDefaultRecoverData();
    }
  },

  // 刷新数据
  refreshData() {
    this.loadPatientAndRecoverData();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
});