// pages/care/care.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 患者基本信息
    patientInfo: {
      name: '张先生',
      surgeryDate: '2023-06-15',
      daysAfterSurgery: 28,
      recoveryRate: 65
    },
    
    // 今日康复指标
    todayMetrics: {
      pain: {
        average: 2,
        trend: -1,
        trendText: '较昨日降 1 分'
      },
      rangeOfMotion: {
        flexion: 115,
        extension: 0,
        trend: 5,
        trendText: '较昨日增 5°'
      },
      muscleStrength: {
        quadriceps: 4,
        percent: 80
      },
      swelling: {
        difference: 1.2,
        trend: -0.3,
        trendText: '较昨日缩 0.3cm'
      }
    },
    
    // 今日任务完成情况
    todayTasks: [
      {
        id: 1,
        name: '直腿抬高训练',
        detail: '3 组 × 15 次',
        completed: true
      },
      {
        id: 2,
        name: '屈膝训练',
        detail: '10 分钟',
        completed: true
      },
      {
        id: 3,
        name: '伤口拍照记录',
        detail: '上传今日伤口照片',
        completed: false
      }
    ],
    
    // 异常提醒
    abnormalAlerts: [
      {
        type: 'info',
        message: '过去7天内未发现明显异常，患者恢复情况良好。',
        hasAlert: false
      }
    ],
    
    // 协助记录功能
    assistFunctions: [
      {
        id: 'pain',
        name: '记录疼痛',
        icon: 'heartbeat',
        color: '#FF6B6B',
        bgColor: '#FF6B6B1A'
      },
      {
        id: 'wound',
        name: '拍摄伤口',
        icon: 'camera',
        color: '#6E6E73',
        bgColor: '#6E6E731A'
      },
      {
        id: 'rom',
        name: '活动度测量',
        icon: 'arrows-v',
        color: '#4A90E2',
        bgColor: '#4A90E21A'
      },
      {
        id: 'training',
        name: '标记训练完成',
        icon: 'check-square-o',
        color: '#4CD964',
        bgColor: '#4CD9641A'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadPatientData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.refreshData();
  },

  /**
   * 加载患者数据
   */
  loadPatientData: function () {
    // 这里可以从本地存储或服务器获取患者数据
    console.log('加载患者数据');
  },

  /**
   * 刷新数据
   */
  refreshData: function () {
    // 刷新今日数据和任务状态
    console.log('刷新数据');
  },

  /**
   * 协助记录功能
   */
  onAssistFunction: function (e) {
    const functionId = e.currentTarget.dataset.id;
    
    switch (functionId) {
      case 'pain':
        this.goToPainLog();
        break;
      case 'wound':
        this.goToWoundLog();
        break;
      case 'rom':
        this.goToRomLog();
        break;
      case 'training':
        this.markTrainingComplete();
        break;
    }
  },

  /**
   * 跳转到疼痛记录页面
   */
  goToPainLog: function () {
    wx.switchTab({
      url: '/pages/log/log',
      success: () => {
        // 通过全局数据传递要激活的标签
        getApp().globalData.activeLogTab = 'pain';
      }
    });
  },

  /**
   * 跳转到伤口记录页面
   */
  goToWoundLog: function () {
    wx.switchTab({
      url: '/pages/log/log',
      success: () => {
        getApp().globalData.activeLogTab = 'wound';
      }
    });
  },

  /**
   * 跳转到活动度记录页面
   */
  goToRomLog: function () {
    wx.switchTab({
      url: '/pages/log/log',
      success: () => {
        getApp().globalData.activeLogTab = 'rom';
      }
    });
  },

  /**
   * 标记训练完成
   */
  markTrainingComplete: function () {
    wx.showModal({
      title: '确认操作',
      content: '是否将所有未完成的训练标记为已完成？',
      success: (res) => {
        if (res.confirm) {
          // 更新任务状态
          const updatedTasks = this.data.todayTasks.map(task => ({
            ...task,
            completed: true
          }));
          
          this.setData({
            todayTasks: updatedTasks
          });
          
          wx.showToast({
            title: '已标记完成',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 联系医生
   */
  contactDoctor: function () {
    wx.showModal({
      title: '联系医生',
      content: '是否要联系主治医生？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以实现拨打电话或发送消息的功能
          wx.showToast({
            title: '正在连接...',
            icon: 'loading'
          });
        }
      }
    });
  },

  /**
   * 查看详细报告
   */
  viewDetailedReport: function () {
    wx.showModal({
      title: '康复报告',
      content: '是否查看详细的康复报告？',
      success: (res) => {
        if (res.confirm) {
          // 跳转到报告页面或显示报告弹窗
          wx.showToast({
            title: '报告生成中...',
            icon: 'loading'
          });
        }
      }
    });
  },

  /**
   * 分享患者状态
   */
  sharePatientStatus: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `${this.data.patientInfo.name}的康复进展`,
      path: '/pages/care/care',
      imageUrl: '/images/share-cover.png'
    };
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshData();
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
