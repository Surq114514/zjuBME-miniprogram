// 引入App实例和LeanCloud
const app = getApp();
const AV = require('../../libs/av-core-min');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentFilter: 'all',  // 当前筛选条件
    filteredPatients: [],  // 筛选后的病患列表
    loading: false         // 加载状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化病患列表
    this.initPatientsList('all');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新加载数据（确保数据最新）
    this.initPatientsList(this.data.currentFilter);
  },

  /**
   * 初始化病患列表
   */
  initPatientsList(filter) {
    this.setData({
      loading: true,
      currentFilter: filter
    });

    // 从LeanCloud读取Patient表格数据（表名改为Patient，首字母大写）
    const query = new AV.Query('Patient');
    
    query.find().then(results => {
      // 保存总人数到全局数据
      app.globalData.totalPatientCount = results.length;
      
      // 处理查询结果，转换为需要的格式
      const patients = results.map(result => {
        const patient = result.toJSON();
        // 获取手术时间并计算下次随访时间
        const surgeryTime = patient.operationDate;
        const followUpDate = this.calculateNextFollowUpDate(surgeryTime);
        
        // 确保数据格式与前端期望的一致
        return {
          id: patient.objectId,  // 使用LeanCloud的objectId
          name: patient.name || '',
          surgery: patient.operationType || '',
          surgeryType: patient.operationType || 'arthroscopy',
          status: patient.status || '康复中',
          statusFilter: patient.statusFilter || 'recovering',
          statusClass: patient.statusClass || 'bg-secondary-10 text-secondary',
          postOp: surgeryTime ? this.formatDate(new Date(surgeryTime)) : '',
          surgeryTime: surgeryTime ? this.formatDate(new Date(surgeryTime)) : '',
          followUp: followUpDate
        };
      });

      // 应用筛选
      const filteredPatients = this.filterPatients(patients, filter);
      
      // 统计康复中人数并保存到全局数据
      const inTreatmentCount = patients.filter(patient => patient.status === '康复中').length;
      app.globalData.inTreatmentCount = inTreatmentCount;
      
      this.setData({
        filteredPatients: filteredPatients,
        loading: false
      });
    }).catch(error => {
      console.error('获取病患数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    });
  },

  /**
   * 筛选病患数据
   */
  filterPatients(patients, filter) {
    if (filter === 'all') {
      return patients;
    } else if (filter === 'thisWeek' || filter === 'recovering' || 
               filter === 'almostDone' || filter === 'done') {
      return patients.filter(patient => patient.statusFilter === filter);
    } else if (filter === 'kneeReplacement' || filter === 'arthroscopy') {
      return patients.filter(patient => patient.surgeryType === filter);
    }
    return patients;
  },

  /**
   * 筛选按钮点击事件
   */
  handleFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.initPatientsList(filter);
  },

  /**
   * 病患卡片点击事件（跳转详情页）
   */
  handlePatientTap(e) {
    const patientId = e.currentTarget.dataset.id;
    // 保存当前病患ID到全局
    app.setCurrentPatientId(patientId);
    // 跳转到详情页
    wx.navigateTo({
      url: '/pages/patientDetail/patientDetail'
    });
  },
  
  /**
   * 计算下次随访时间（基于手术时间，每7天一次）
   */
  calculateNextFollowUpDate(surgeryTime) {
    if (!surgeryTime) {
      return '暂无手术时间';
    }
    
    const surgeryDate = new Date(surgeryTime);
    const today = new Date();
    
    // 计算手术日期到今天的天数差
    const dayDiff = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));
    
    // 如果手术是在未来
    if (dayDiff < 0) {
      return '手术在未来';
    }
    
    // 计算应该进行了多少次随访
    const followUpCount = Math.floor(dayDiff / 7);
    
    // 计算下次随访日期（当前随访周期的下一个7天）
    const nextFollowUpDate = new Date(surgeryDate);
    nextFollowUpDate.setDate(nextFollowUpDate.getDate() + (followUpCount + 1) * 7);
    
    // 计算距离下次随访的天数
    const daysUntilNext = Math.ceil((nextFollowUpDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilNext < 0) {
      // 已超过随访时间
      return `已逾期${Math.abs(daysUntilNext)}天`;
    } else if (daysUntilNext === 0) {
      // 今天随访
      return '今天';
    } else {
      // 未来随访
      return `还有${daysUntilNext}天`;
    }
  },
  
  /**
   * 格式化日期显示
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});