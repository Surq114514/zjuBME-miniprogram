// pages/me/me.js
const app = getApp();
const AV = app.globalData.AV || require('../../libs/av-core-min.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户基本信息
    patientInfo: {
      name: '',
      avatar: '/images/avatar.png',
      patientType: '',
      operationType: '',
      operationDate: '',
      daysAfterSurgery: '',
      nextAppointment: '7天后',
      nextAppointmentDate: '2023-07-20'
    },
    

    // 康复统计
    rehabStats: {
      totalDays: 28,
      recoveryRate: 65,
      totalRecords: 156,
      thisWeekRecords: 7
    },
    
    // 功能菜单
    menuItems: [
      {
        id: 'doctor',
        name: '联系主治医生',
        icon: 'phone',
        image: '/images/ContactDoc.png',
        action: 'contactDoctor'
      },
     
      {
        id: 'knowledge',
        name: '术后康复指南',
        icon: 'book',
        image: '/images/RecovGuide.png',
        action: 'showRehabKnowledge'
      },
      {
        id: 'appointment',
        name: '预约下次复诊',
        icon: 'calendar-o',
        image: '/images/Appoint.png',
        action: 'makeAppointment'
      },
      {
        id: 'privacy',
        name: '隐私与安全',
        icon: 'shield',
        image: '/images/Privacy.png',
        action: 'showPrivacySettings'
      }
    ],
    
    // 家属绑定状态
    familyBinding: {
      isBound: false,
      boundMembers: [
        {
          name: '李女士',
          relation: '配偶',
          bindTime: '2023-06-20',
          lastActive: '2小时前'
        }
      ]
    },
    
    // 应用信息
    appInfo: {
      version: '1.0.0',
      buildNumber: '20230713',
      lastUpdate: '2023-07-13'
    }
  },



  /**
   * 生命周期函数--监听页面加载
   */
  // 从 LeanCloud 查询患者数据（通过patientId定位表格）
  async queryPatientData() {
    console.log(app.globalData.patientId);
    try {
      // 检查app.globalData是否存在
      if (!app || !app.globalData) {
        console.error('全局应用实例或全局数据未初始化');
        this.setData({ loading: false });
        return;
      }
      
      // 初始化状态为加载中
      this.setData({ loading: true });
      
      // 仅从云端获取数据，通过patientId定位表格
      const patientResult = await this.queryPatientTable();
      
      if (patientResult) {
        // 只获取name和operationDate字段
        const patientInfo = {
          name: patientResult.get('name') || '张先生',
          operationDate: patientResult.get('operationDate') || this.calculateSurgeryDate(28),
          operationType: patientResult.get('operationType') 
        };
        
        // 计算术后天数
        const daysAfterSurgery = this.calculateDaysAfterSurgery(patientInfo.operationDate);
        
        // 计算距离下次复诊天数（按每7天检查一次的频率）
        const nextFollowupDays = this.calculateDaysUntilFollowup(null, daysAfterSurgery);
        
        // 更新patientInfo对象，使变量名与wxml中保持一致
        patientInfo.daysAfterSurgery = daysAfterSurgery;
        patientInfo.surgeryType = patientInfo.operationType; // 手术类型
        patientInfo.nextAppointment = `${nextFollowupDays}天后`; // 下次复诊
        
        this.setData({
          patientInfo
        });
        
        console.log('云端患者数据获取成功');
      } else {
        console.log('云端未找到患者数据');
        // 设置默认数据结构
        const defaultOperationDate = this.calculateSurgeryDate(28);
        const daysAfterSurgery = this.calculateDaysAfterSurgery(defaultOperationDate);
        const nextFollowupDays = this.calculateDaysUntilFollowup(null, daysAfterSurgery);
        
        this.setData({
          patientInfo: {
            name: '',
            operationDate: defaultOperationDate,
            daysAfterSurgery: daysAfterSurgery,
            surgeryType: '',
            nextAppointment: `${nextFollowupDays}天后`
          }
        });
      }
      
      // 模拟获取通知数量
      const notificationCount = Math.floor(Math.random() * 5);
      this.setData({
        notificationCount,
        loading: false
      });
    } catch (error) {
      console.error('查询患者数据时发生错误：', error);
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
          title: '获取患者数据失败',
          icon: 'none'
        });
      }
      
      // 设置默认空数据结构
      this.setData({
        patientInfo: {},
        daysAfterSurgery: 0,
        nextFollowupDays: 0,
        loading: false
      });
    }
  },

  // 查询患者表 - 通过patientId定位表格（bingli.js标准的方法1）
  async queryPatientTable() {
    try {
      // 优先使用全局变量中存储的patientId（推荐方式）
      if (app.globalData && app.globalData.patientId) {
        console.log('使用patientId定位表格并查询数据:', app.globalData.patientId);
        try {
          // 方法1: 直接通过ID获取特定的患者记录（推荐方式）
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

  /**
   * 生命周期函数--监听页面显示
   */
    // 页面展示时加载数据 - 通过app.js中的全局ID定位表格（使用bingli.js标准的生命周期管理）
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
          
          // 无论网络状态如何，都尝试从云端获取数据（失败时会显示示例数据）
          this.queryPatientData();
        
         
        },
        fail: err => {
          console.error('检查网络状态失败:', err);
          // 继续尝试获取数据
          this.queryPatientData();
 
        }
      });
    },

  /**
   * 加载用户数据
   */
  loadUserData: function () {
    // 从本地存储或服务器获取用户数据
    console.log('加载用户数据');
    
    // 模拟数据加载
    wx.showLoading({
      title: '加载中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
    }, 1000);
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
  
  // 计算术后天数
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
  
  // 计算下次复诊日期（按每7天检查一次的频率）
  calculateDaysUntilFollowup(nextFollowupDate, daysAfterSurgery) {
    try {
      // 按每7天检查一次的频率计算下次复诊时间
      // 计算术后天数中包含多少个完整的7天周期
      const cycles = Math.floor(daysAfterSurgery / 7);
      // 下次复诊应该是下一个7天的倍数天
      const nextFollowupDay = (cycles + 1) * 7;
      // 计算距离下次复诊的天数
      const daysUntilFollowup = nextFollowupDay - daysAfterSurgery;
      
      return daysUntilFollowup > 0 ? daysUntilFollowup : 7;
    } catch (error) {
      console.error('计算下次复诊时间失败:', error);
      return 7; // 默认返回7天
    }
  },

  /**
   * 刷新用户数据
   */
  refreshUserData: function () {
    // 刷新用户数据和统计信息
    console.log('刷新用户数据');
  },

  /**
   * 菜单项点击处理
   */
  onMenuItemClick: function (e) {
    const action = e.currentTarget.dataset.action;
    
    switch (action) {
      case 'contactDoctor':
        this.contactDoctor();
        break;
      case 'generateReport':
        this.generateReport();
        break;
      case 'showRehabKnowledge':
        this.showRehabKnowledge();
        break;
      case 'makeAppointment':
        this.makeAppointment();
        break;
      case 'showPrivacySettings':
        this.showPrivacySettings();
        break;
    }
  },

  /**
   * 联系主治医生
   */
  contactDoctor: function () {
    wx.showActionSheet({
      itemList: ['拨打电话', '发送消息', '视频通话'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.callDoctor();
            break;
          case 1:
            this.messageDoctor();
            break;
          case 2:
            this.videoCallDoctor();
            break;
        }
      }
    });
  },

  /**
   * 拨打电话
   */
  callDoctor: function () {
    wx.makePhoneCall({
      phoneNumber: '13800138000',
      success: () => {
        console.log('拨打电话成功');
      },
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 发送消息
   */
  messageDoctor: function () {
    wx.showModal({
      title: '发送消息',
      content: '是否要发送消息给主治医生？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({  // 普通页面用这个
            url: '/pages/chat/chat',
          });
        }
      }
    });
  },

  /**
   * 视频通话
   */
  videoCallDoctor: function () {
    wx.showModal({
      title: '视频通话',
      content: '是否要发起视频通话？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在连接...',
            icon: 'loading'
          });
        }
      }
    });
  },

  /**
   * 生成康复报告
   */
  generateReport: function () {
    wx.showModal({
      title: '生成报告',
      content: '是否生成康复数据报告？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '生成中...'
          });
          
          setTimeout(() => {
            wx.hideLoading();
            wx.showModal({
              title: '报告生成完成',
              content: '康复报告已生成，是否查看？',
              success: (result) => {
                if (result.confirm) {
                  this.viewReport();
                }
              }
            });
          }, 2000);
        }
      }
    });
  },

  /**
   * 查看报告
   */
  viewReport: function () {
    // 跳转到报告页面或显示报告弹窗
    wx.showToast({
      title: '报告页面开发中',
      icon: 'none'
    });
  },

  /**
   * 显示康复知识
   */
  showRehabKnowledge: function () {
    wx.showModal({
      title: '康复指南',
      content: '康复知识页面正在开发中，敬请期待！',
      showCancel: false
    });
  },

  /**
   * 预约复诊
   */
  makeAppointment: function () {
    wx.showModal({
      title: '预约复诊',
      content: '是否要预约下次复诊？',
      success: (res) => {
        if (res.confirm) {
          this.showAppointmentForm();
        }
      }
    });
  },

  /**
   * 显示预约表单
   */
  showAppointmentForm: function () {
    wx.showModal({
      title: '预约功能',
      content: '预约功能正在开发中，请稍后再试！',
      showCancel: false
    });
  },

  /**
   * 显示隐私设置
   */
  showPrivacySettings: function () {
    wx.showModal({
      title: '隐私设置',
      content: '隐私设置功能正在开发中，请稍后再试！',
      showCancel: false
    });
  },

  /**
 

  /**
   * 显示二维码弹窗
   */
  showQRCodeModal: function () {
    wx.showModal({
      title: '二维码生成',
      content: '二维码功能正在开发中，请稍后再试！',
      showCancel: false
    });
  },

  /**
   * 管理家属绑定
   */
  manageFamilyBinding: function () {
    wx.showActionSheet({
      itemList: ['查看绑定成员', '解绑成员', '添加新成员'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.viewBoundMembers();
            break;
          case 1:
            this.unbindMember();
            break;
          case 2:
            this.addNewMember();
            break;
        }
      }
    });
  },

  /**
   * 查看绑定成员
   */
  viewBoundMembers: function () {
    wx.showModal({
      title: '绑定成员',
      content: `当前绑定成员：${this.data.familyBinding.boundMembers[0].name}（${this.data.familyBinding.boundMembers[0].relation}）`,
      showCancel: false
    });
  },

  /**
   * 解绑成员
   */
  unbindMember: function () {
    wx.showModal({
      title: '解绑确认',
      content: '是否要解绑该家属成员？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '解绑成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 添加新成员
   */
  addNewMember: function () {
    wx.showModal({
      title: '添加成员',
      content: '添加新成员功能正在开发中，请稍后再试！',
      showCancel: false
    });
  },

  /**
   * 编辑个人信息
   */
  editProfile: function () {
    wx.showModal({
      title: '编辑信息',
      content: '个人信息编辑功能正在开发中，请稍后再试！',
      showCancel: false
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'KneeRecover - 膝关节术后康复助手',
      path: '/pages/home/home',
      imageUrl: '/images/share-cover.png'
    };
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshUserData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 加载更多数据
    console.log('加载更多数据');
  }
});
