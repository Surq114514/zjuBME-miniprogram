Page({
  data: {
    messages: [
      {
        id: 1,
        content: '张先生您好，看了您昨天的康复数据，恢复情况不错。疼痛评分有所下降，关节活动度也有提升，继续保持当前训练强度。',
        time: '09:30',
        from: 'doctor'
      },
      {
        id: 3,
        content: '术后恢复期出现轻微发紧是正常现象，建议您在训练前增加5分钟热敷，训练后进行冷敷。如果发紧感持续加重或伴随剧烈疼痛，请及时联系我。',
        time: '10:25',
        from: 'doctor'
      },
      {
        id: 4,
        content: '另外，下次复诊时间是7天后，请提前做好准备。',
        time: '10:26',
        from: 'doctor'
      }
    ],
    inputValue: '',
    scrollIntoView: ''
  },
  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  // 发送消息
  sendMessage() {
    if (!this.data.inputValue.trim()) return;
    const newMessage = {
      id: this.data.messages.length + 1,
      content: this.data.inputValue,
      time: new Date().toTimeString().slice(0, 5),
      from: 'patient'
    };
    this.setData({
      messages: [...this.data.messages, newMessage],
      inputValue: '',
      scrollIntoView: `msg-${newMessage.id}`
    });
    // 模拟医生回复（实际需对接后端接口）
    setTimeout(() => {
      const replyMessage = {
        id: this.data.messages.length + 1,
        content: '收到，会根据您的建议调整。',
        time: new Date().toTimeString().slice(0, 5),
        from: 'doctor'
      };
      this.setData({
        messages: [...this.data.messages, replyMessage],
        scrollIntoView: `msg-${replyMessage.id}`
      });
    }, 1000);
  },
  // 选择附件
  chooseAttach() {
    wx.showToast({
      title: '附件功能待开发',
      icon: 'none'
    });
  },
  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        const imageMessage = {
          id: this.data.messages.length + 1,
          image: tempFilePath,
          time: new Date().toTimeString().slice(0, 5),
          from: 'patient'
        };
        this.setData({
          messages: [...this.data.messages, imageMessage],
          scrollIntoView: `img-${imageMessage.id}`
        });
        // 模拟医生对图片的回复
        setTimeout(() => {
          const replyMessage = {
            id: this.data.messages.length + 1,
            content: '从图片看，恢复情况良好，继续保持。',
            time: new Date().toTimeString().slice(0, 5),
            from: 'doctor'
          };
          this.setData({
            messages: [...this.data.messages, replyMessage],
            scrollIntoView: `msg-${replyMessage.id}`
          });
        }, 1000);
      }
    });
  },
  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        const fileMessage = {
          id: this.data.messages.length + 1,
          file: tempFilePath,
          name: res.tempFiles[0].name,
          time: new Date().toTimeString().slice(0, 5),
          from: 'patient'
        };
        this.setData({
          messages: [...this.data.messages, fileMessage],
          scrollIntoView: `file-${fileMessage.id}`
        });
        // 模拟医生对文件的回复
        setTimeout(() => {
          const replyMessage = {
            id: this.data.messages.length + 1,
            content: '您上传的报告已查看，指标正常。',
            time: new Date().toTimeString().slice(0, 5),
            from: 'doctor'
          };
          this.setData({
            messages: [...this.data.messages, replyMessage],
            scrollIntoView: `msg-${replyMessage.id}`
          });
        }, 1000);
      }
    });
  }
});