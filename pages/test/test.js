const app = getApp();
const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    patientInfo: {} // 用于存储从云端获取的患者信息
  },

  onLoad() {
    this.queryPatientInfo();
  },

  // 从 LeanCloud 查询患者信息
  async queryPatientInfo() {
    try {
      // 创建查询对象，指定要查询的表（这里是之前保存数据的"Patient"表）
      const query = new AV.Query('Patient');

      // 按创建时间倒序，获取最新的一条数据（可根据实际需求调整查询条件）
      query.descending('createdAt');

      // 执行查询
      const patient = await query.first();

      if (patient) {
        // 处理查询结果，将 LeanCloud 数据转换为页面可展示的格式
        const patientInfo = {
          name: patient.get('name') || '未填写',
          gender: patient.get('gender') || '未填写',
          age: patient.get('age') || '未填写',
          height: patient.get('height') || '未填写',
          weight: patient.get('weight') || '未填写',
          bmi: patient.get('bmi') || '未计算',
          phone: patient.get('phone') || '未填写',
          insuranceType: patient.get('insuranceType') || '未选择',
          medicalHistories: patient.get('medicalHistories')?.join('、') || '无',
          otherHistory: patient.get('otherHistory') || '无',
          operationDate: patient.get('operationDate') || '未填写',
          operationType: patient.get('operationType') || '未选择',
          side: patient.get('side') || '未填写',
          doctor: patient.get('doctor') || '未填写',
          diagnosis: patient.get('diagnosis') || '未填写',
          anesthesiaType: patient.get('anesthesiaType') || '未选择',
          operationDesc: patient.get('operationDesc') || '无',
          flexion: patient.get('flexion') || '未填写',
          extension: patient.get('extension') || '未填写',
          painScore: patient.get('painScore') || '未填写',
          muscleStrength: patient.get('muscleStrength') || '未选择',
          complications: patient.get('complications')?.join('、') || '无'
        };

        this.setData({
          patientInfo
        });
      } else {
        wx.showToast({
          title: '暂无患者数据',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '查询失败：' + error.message,
        icon: 'none',
        duration: 3000
      });
      console.error('查询云端数据失败：', error);
    }
  }
});