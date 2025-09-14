const AV = require('./libs/av-core-min');
const adapters = require('./libs/leancloud-adapters-weapp.js');

AV.setAdapters(adapters);
AV.init({
  appId:'JqAWaGQweN6bkKFnnoWGolmX-gzGzoHsz',
  appKey:'ARxDQBmDjxKlKzxSEe1uzRHi',
  serverURLs:"https://jqawagqw.lc-cn-n1-shared.com",
})

App({
  globalData: {
    userInfo: null, // 用户信息
    count: 0, // 计数器
    patientId:'',
    planId:'',
    recoverId:'',
    totalPatientCount: 0, // 总病患数量
    inTreatmentCount: 0 // 康复中人数
  },
  
  onLaunch() {
    // 初始化全局数据
    this.globalData = {
      currentPatientId: null, // 存储当前选中的病患ID
      totalPatientCount: 0, // 总病患数量
      inTreatmentCount: 0 // 康复中人数
    };
  },
  
  // 获取全局数据
  getGlobalData() {
    return this.globalData;
  },
  
  // 设置当前病患ID
  setCurrentPatientId(id) {
    this.globalData.currentPatientId = id;
  },
  
  // 获取当前病患ID
  getCurrentPatientId() {
    return this.globalData.currentPatientId;
  }
});