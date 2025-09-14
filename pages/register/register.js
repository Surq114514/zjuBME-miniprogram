const app = getApp();
const AV = require('../../libs/av-core-min.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    
      phoneOrEmail: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
    
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
  onUsername(e) {
    this.setData({
        phoneOrEmail: e.detail.value
    });
  },
  onpassword(e) {
    this.setData({
        password: e.detail.value
    });
  },
  onconfirmPassword(e) {
    this.setData({
        confirmPassword: e.detail.value
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
    const { phoneOrEmail, verificationCode, password, confirmPassword } = this.data;
    
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
  },
// 创建空集合（Class）并获取objectId
async userinit()
  {
    const { phoneOrEmail, verificationCode, password, confirmPassword } = this.data;
   // 验证表单
   if (!phoneOrEmail) {
    wx.showToast({
      title: '请输入手机号或邮箱',
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
try{
    const emptyObject_recover = new AV.Object('Recover');

    // 2. 可设置空字段（可选，根据需求定义）
    emptyObject_recover.set('HswellDown', ''); // 空对象
    emptyObject_recover.set('HswellUp', ''); // 标记为空集合
    emptyObject_recover.set('JswellDown','' ); 
    emptyObject_recover.set('JswellUp', ''); 
    emptyObject_recover.set('activityPain', 0); 
    emptyObject_recover.set('nightPain', 0); 
    emptyObject_recover.set('restPain', 0); 
    
    // 3. 设置权限（重要：限制访问范围）
    
    // 若需要用户关联，可设置仅当前用户可访问（需先登录）
   

    // 4. 保存记录（自动创建 Class，并返回带 objectId 的记录）
    const savedObject_1 = await emptyObject_recover.save();
    const objectId_1 = savedObject_1.id;

    // 5. 存入全局变量
    app.globalData.recoverobjectid = objectId_1;
    console.log('空集合创建成功，recoverobjectId已存入全局变量：', objectId_1);
    const emptyObject_patient = new AV.Object('Patient');

      // 2. 可设置空字段（可选，根据需求定义）
      emptyObject_patient.set('age','' ); // 空对象
      emptyObject_patient.set('bmi', ''); // 标记为空集合

      // 3. 设置权限（重要：限制访问范围）
      
      // 若需要用户关联，可设置仅当前用户可访问（需先登录）
     

      // 4. 保存记录（自动创建 Class，并返回带 objectId 的记录）
      const savedObject_2 = await emptyObject_patient.save();
      const objectId_2 = savedObject_2.id;

      // 5. 存入全局变量
      app.globalData.patientobjectid = objectId_2;
      console.log('空集合创建成功，patientobjectId已存入全局变量：', objectId_2);
      const emptyObject_plan = new AV.Object('Plan');

      // 2. 可设置空字段（可选，根据需求定义）
      emptyObject_plan.set('planName','' ); // 空对象
     

      // 3. 设置权限（重要：限制访问范围）
      
      // 若需要用户关联，可设置仅当前用户可访问（需先登录）
     

      // 4. 保存记录（自动创建 Class，并返回带 objectId 的记录）
      const savedObject_3 = await emptyObject_plan.save();
      const objectId_3 = savedObject_3.id;

      // 5. 存入全局变量
      app.globalData.planobjectid = objectId_3;
      console.log('空集合创建成功，planobjectId已存入全局变量：',app.globalData.planobjectid );
 
    console.log('页面B读取到的最新值：', app.globalData.planobjectid);
    console.log('页面B读取到的最新值：', app.globalData.patientobjectid);
    console.log('页面B读取到的最新值：', app.globalData.recoverobjectid);
    const emptyObject_user = new AV.Object('_User');
    emptyObject_user.set('username',phoneOrEmail ); // 空对象
    emptyObject_user.set('password',password ); // 标记为空集合
    emptyObject_user.set('patientId', app.globalData.patientobjectid);
    emptyObject_user.set('planId',  app.globalData.planobjectid);
    emptyObject_user.set('recoverId', app.globalData.recoverobjectid);
    await emptyObject_user.save();
      
}catch(error){console.error('创建失败：', error);
wx.showToast({
  title: '初始化失败',
  icon: 'none'
});
}

  }
});
