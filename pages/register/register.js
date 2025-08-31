Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    formData: {
      phoneOrEmail: '',
      verificationCode: '',
      password: '',
      confirmPassword: ''
    },
    // 密码显示状态
    showPassword: false,
    showConfirmPassword: false,
    // 验证码倒计时
    countdown: 0,
    // 深色模式状态
    isDarkMode: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 检查系统主题
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      isDarkMode: systemInfo.theme === 'dark'
    });
    
    // 监听主题变化
    wx.onThemeChange((result) => {
      this.setData({
        isDarkMode: result.theme === 'dark'
      });
    });
  },

  /**
   * 输入框内容变化处理
   */
  handleInput(e) {
    const { name, value } = e.detail;
    this.setData({
      [`formData.${name}`]: value
    });
  },

  /**
   * 切换密码可见性
   */
  togglePasswordVisibility(e) {
    const target = e.currentTarget.dataset.target;
    if (target === 'password') {
      this.setData({
        showPassword: !this.data.showPassword
      });
    } else if (target === 'confirmPassword') {
      this.setData({
        showConfirmPassword: !this.data.showConfirmPassword
      });
    }
  },

  /**
   * 获取验证码
   */
  getVerificationCode() {
    const { phoneOrEmail } = this.data.formData;
    
    // 验证手机号或邮箱
    if (!phoneOrEmail) {
      wx.showToast({
        title: '请输入手机号或邮箱',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 简单验证格式
    const isPhone = /^1[3-9]\d{9}$/.test(phoneOrEmail);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
    
    if (!isPhone && !isEmail) {
      wx.showToast({
        title: '请输入有效的手机号或邮箱',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 开始倒计时
    let countdown = 60;
    this.setData({
      countdown
    });
    
    const timer = setInterval(() => {
      countdown--;
      this.setData({
        countdown
      });
      
      if (countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    // 这里可以添加发送验证码的逻辑
    console.log(`发送验证码到: ${phoneOrEmail}`);
    
    // 模拟发送成功
    wx.showToast({
      title: '验证码已发送',
      icon: 'success',
      duration: 2000
    });
  },

  /**
   * 表单提交处理
   */
  handleSubmit(e) {
    const { phoneOrEmail, verificationCode, password, confirmPassword } = this.data.formData;
    
    // 验证表单
    if (!phoneOrEmail) {
      wx.showToast({
        title: '请输入手机号或邮箱',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!verificationCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!password) {
      wx.showToast({
        title: '请设置密码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (password.length < 6) {
      wx.showToast({
        title: '密码长度不能少于6位',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 这里可以添加注册逻辑
    console.log('注册信息:', {
      phoneOrEmail,
      verificationCode,
      password
    });
    
    // 模拟注册成功
    wx.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 2000
    });
    
    // 注册成功后跳转到首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 2000);
  },

  /**
   * 切换主题模式
   */
  toggleTheme() {
    const isDarkMode = !this.data.isDarkMode;
    this.setData({
      isDarkMode
    });
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack();
  },

  /**
   * 微信注册
   */
  registerWithWechat() {
    console.log('微信注册');
    wx.showToast({
      title: '微信注册功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * QQ注册
   */
  registerWithQQ() {
    console.log('QQ注册');
    wx.showToast({
      title: 'QQ注册功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * Apple注册
   */
  registerWithApple() {
    console.log('Apple注册');
    wx.showToast({
      title: 'Apple注册功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
});
