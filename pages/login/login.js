Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',      // 账号
    password: '',      // 密码
    showPassword: false, // 是否显示密码
    rememberMe: false,  // 是否记住账号
    isDarkMode: false   // 是否为深色模式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 检查系统主题
    this.checkSystemTheme();
    
    // 检查是否有保存的账号
    this.loadSavedAccount();
    
    // 监听主题变化
    wx.onThemeChange(res => {
      this.setData({
        isDarkMode: res.theme === 'dark'
      });
    });
  },

  /**
   * 检查系统主题
   */
  checkSystemTheme() {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          isDarkMode: res.theme === 'dark'
        });
      }
    });
  },

  /**
   * 加载保存的账号
   */
  loadSavedAccount() {
    const savedAccount = wx.getStorageSync('savedAccount');
    if (savedAccount && savedAccount.rememberMe) {
      this.setData({
        username: savedAccount.username,
        rememberMe: savedAccount.rememberMe
      });
    }
  },

  /**
   * 处理输入变化
   */
  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  /**
   * 切换密码显示状态
   */
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  /**
   * 切换记住账号状态
   */
  toggleRemember(e) {
    this.setData({
      rememberMe: e.detail.value
    });
  },

  /**
   * 切换主题模式
   */
  toggleTheme() {
    this.setData({
      isDarkMode: !this.data.isDarkMode
    });
  },

  /**
   * 处理登录
   */
  handleLogin(e) {
    const { username, password, rememberMe } = this.data;
    
    // 简单验证
    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 显示加载状态
    wx.showLoading({
      title: '登录中...',
      mask: true
    });
    
    // 模拟登录请求（实际项目中替换为真实接口调用）
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟登录成功
      if (username && password) {
        // 保存账号信息（如果需要记住）
        if (rememberMe) {
          wx.setStorageSync('savedAccount', {
            username,
            rememberMe: true
          });
        } else {
          wx.removeStorageSync('savedAccount');
        }
        
       
        
        wx.showToast({
          title: '操作成功', // 提示文字
          icon: 'success',   // 图标，可选"success"、"loading"、"none"
          duration: 2000,    // 提示显示时长，默认2000ms
          success: function() {
            // 跳转至tabBar首页（需在app.json中配置tabBar）
            wx.switchTab({
              url: '/pages/home/home' // 首页路径，根据你的实际配置修改
            });
          }
        });
      } else {
        // 登录失败
        wx.showToast({
          title: '账号或密码错误',
          icon: 'none',
          duration: 2000
        });
      }
    }, 1500);
  }
});
    