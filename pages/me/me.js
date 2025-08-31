// pages/me/me.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户基本信息
    userInfo: {
      name: '',
      avatar: '/images/avatar.png',
      patientType: '患者',
      surgeryType: '右膝关节置换术'
    },
    
    // 手术信息
    surgeryInfo: {
      surgeryDate: '2023-06-15',
      daysAfterSurgery: 28,
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
        color: '#4A90E2',
        bgColor: '#E8F4FD',
        action: 'contactDoctor'
      },
     
      {
        id: 'knowledge',
        name: '术后康复指南',
        icon: 'book',
        color: '#4CD964',
        bgColor: '#E6F7F0',
        action: 'showRehabKnowledge'
      },
      {
        id: 'appointment',
        name: '预约下次复诊',
        icon: 'calendar-o',
        color: '#FFB86C',
        bgColor: '#FFF4E5',
        action: 'makeAppointment'
      },
      {
        id: 'privacy',
        name: '隐私与安全',
        icon: 'shield',
        color: '#9D4EDD',
        bgColor: '#F3EFFF',
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.refreshUserData();
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
