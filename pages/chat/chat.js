// pages/chat/chat.js
Page({
  data: {
    // 聊天信息
    chatInfo: {
      doctorName: '李医生',
      doctorAvatar: '/images/doctor-avatar.png',
      doctorTitle: '主治医师',
      department: '骨科',
      hospital: '浙江大学医学院附属第一医院'
    },
    
    // 消息列表
    messages: [
      {
        id: 1,
        type: 'system',
        content: '已连接到李医生，开始咨询吧',
        time: '14:30',
        timestamp: Date.now()
      }
    ],
    
    // 输入框内容
    inputContent: '',
    
    // 快速回复选项
    quickReplies: [
      '疼痛情况咨询',
      '康复进度询问',
      '训练计划调整',
      '复诊时间安排',
      '药物使用咨询'
    ],
    
    // 聊天状态
    isTyping: false,
    isConnected: true,
    
    // 更多功能
    moreFunctions: [
      { id: 'photo', name: '拍照', icon: 'camera', color: '#4A90E2' },
      { id: 'album', name: '相册', icon: 'image', color: '#4CD964' },
      { id: 'voice', name: '语音', icon: 'mic', color: '#FFB86C' },
      { id: 'file', name: '文件', icon: 'file', color: '#9D4EDD' }
    ]
  },

  onLoad: function (options) {
    this.loadChatHistory();
    this.scrollToBottom();
  },

  onShow: function () {
    // 页面显示时滚动到底部
    this.scrollToBottom();
  },

  // 加载聊天历史
  loadChatHistory: function () {
    // 这里可以从本地存储或服务器加载聊天历史
    const chatHistory = wx.getStorageSync('chatHistory') || [];
    if (chatHistory.length > 0) {
      this.setData({
        messages: chatHistory
      });
    }
  },

  // 保存聊天记录
  saveChatHistory: function () {
    wx.setStorageSync('chatHistory', this.data.messages);
  },

  // 输入框内容变化
  onInputChange: function (e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  // 发送消息
  sendMessage: function () {
    if (!this.data.inputContent.trim()) {
      return;
    }

    const message = {
      id: Date.now(),
      type: 'user',
      content: this.data.inputContent,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    };

    this.addMessage(message);
    this.setData({ inputContent: '' });
    
    // 模拟医生回复
    this.simulateDoctorReply();
  },

  // 快速回复
  onQuickReply: function (e) {
    const content = e.currentTarget.dataset.content;
    const message = {
      id: Date.now(),
      type: 'user',
      content: content,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    };

    this.addMessage(message);
    this.simulateDoctorReply();
  },

  // 添加消息到列表
  addMessage: function (message) {
    const messages = [...this.data.messages, message];
    this.setData({ messages });
    this.saveChatHistory();
    this.scrollToBottom();
  },

  // 模拟医生回复
  simulateDoctorReply: function () {
    this.setData({ isTyping: true });
    
    setTimeout(() => {
      const replies = [
        '好的，我了解了。请继续描述一下具体情况。',
        '这个情况比较常见，建议您...',
        '根据您的描述，我建议调整训练计划...',
        '疼痛评分有下降是好事，继续保持...',
        '如果情况持续，建议来医院复查一下。'
      ];
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const message = {
        id: Date.now(),
        type: 'doctor',
        content: randomReply,
        time: this.formatTime(new Date()),
        timestamp: Date.now()
      };

      this.addMessage(message);
      this.setData({ isTyping: false });
    }, 1500 + Math.random() * 2000); // 1.5-3.5秒随机延迟
  },

  // 更多功能点击
  onMoreFunction: function (e) {
    const functionId = e.currentTarget.dataset.id;
    
    switch (functionId) {
      case 'photo':
        this.takePhoto();
        break;
      case 'album':
        this.chooseFromAlbum();
        break;
      case 'voice':
        this.startVoiceRecord();
        break;
      case 'file':
        this.chooseFile();
        break;
    }
  },

  // 拍照
  takePhoto: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.sendImageMessage(res.tempFilePaths[0]);
      }
    });
  },

  // 从相册选择
  chooseFromAlbum: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.sendImageMessage(res.tempFilePaths[0]);
      }
    });
  },

  // 发送图片消息
  sendImageMessage: function (imagePath) {
    const message = {
      id: Date.now(),
      type: 'user',
      content: '[图片]',
      image: imagePath,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    };

    this.addMessage(message);
    this.simulateDoctorReply();
  },

  // 开始语音录制
  startVoiceRecord: function () {
    wx.showToast({
      title: '语音功能开发中',
      icon: 'none'
    });
  },

  // 选择文件
  chooseFile: function () {
    wx.showToast({
      title: '文件功能开发中',
      icon: 'none'
    });
  },

  // 拨打电话
  callDoctor: function () {
    wx.showActionSheet({
      itemList: ['拨打电话', '视频通话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({
            phoneNumber: '13800138000',
            success: () => {
              console.log('拨打电话成功');
            }
          });
        } else if (res.tapIndex === 1) {
          wx.showToast({
            title: '视频通话功能开发中',
            icon: 'none'
          });
        }
      }
    });
  },

  // 查看医生信息
  viewDoctorInfo: function () {
    wx.showModal({
      title: '医生信息',
      content: `${this.data.chatInfo.doctorName}\n${this.data.chatInfo.doctorTitle}\n${this.data.chatInfo.department}\n${this.data.chatInfo.hospital}`,
      showCancel: false
    });
  },

  // 结束咨询
  endConsultation: function () {
    wx.showModal({
      title: '结束咨询',
      content: '确定要结束本次咨询吗？',
      success: (res) => {
        if (res.confirm) {
          const message = {
            id: Date.now(),
            type: 'system',
            content: '咨询已结束，感谢您的使用',
            time: this.formatTime(new Date()),
            timestamp: Date.now()
          };
          
          this.addMessage(message);
          this.setData({ isConnected: false });
          
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      }
    });
  },

  // 格式化时间
  formatTime: function (date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 滚动到底部
  scrollToBottom: function () {
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 9999,
        duration: 300
      });
    }, 100);
  },

  // 分享聊天记录
  shareChat: function () {
    wx.showActionSheet({
      itemList: ['分享给家属', '导出聊天记录', '生成咨询报告'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({
              title: '分享功能开发中',
              icon: 'none'
            });
            break;
          case 1:
            wx.showToast({
              title: '导出功能开发中',
              icon: 'none'
            });
            break;
          case 2:
            wx.showToast({
              title: '报告生成中...',
              icon: 'loading'
            });
            break;
        }
      }
    });
  }
});
