// 引入App实例
const app = getApp();
const AV = require('../../libs/av-core-min');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    inTreatmentCount: 0, // 康复中病患人数
    totalPatientCount: 0, // 在管病患总数
    completedCount: 0, // 康复完成人数
    satisfactionRate: '98%' // 满意度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchPatientStatistics();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时从全局数据获取总人数和康复中人数
    if (app.globalData.totalPatientCount !== undefined) {
      this.setData({
        totalPatientCount: app.globalData.totalPatientCount
      });
    }
    if (app.globalData.inTreatmentCount !== undefined) {
      this.setData({
        inTreatmentCount: app.globalData.inTreatmentCount
      });
    }
    // 重新获取其他统计数据
    this.fetchPatientStatistics();
  },

  /**
   * 获取病患统计数据
   */
  fetchPatientStatistics() {
    wx.showLoading({
      title: '加载中',
    });

    // 优先使用全局数据中的总人数和康复中人数
    if (app.globalData.totalPatientCount !== undefined) {
      this.setData({
        totalPatientCount: app.globalData.totalPatientCount
      });
    }
    if (app.globalData.inTreatmentCount !== undefined) {
      this.setData({
        inTreatmentCount: app.globalData.inTreatmentCount
      });
    }

    // 统计康复完成的数量
    const Patient = AV.Object.extend('Patient');
    const completedQuery = new AV.Query(Patient);
    completedQuery.equalTo('status', '已完成');
    
    completedQuery.count().then(completedCount => {
      // 更新康复完成病患数量
      this.setData({
        completedCount: completedCount
      });
      
      wx.hideLoading();
    }).catch(error => {
      console.error('获取病患统计数据失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
    });
  }
});