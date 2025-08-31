const app = getApp();
const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    // 患者基础信息
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    bmi: '',
    phone: '',
    insuranceTypes: [
      { id: 'basic', name: '基本医疗保险' },
      { id: 'commercial', name: '商业医疗保险' },
      { id: 'none', name: '无医保' }
    ],
    insuranceIndex: null,
    medicalHistories: [
      { id: 'hypertension', name: '高血压', checked: false },
      { id: 'diabetes', name: '糖尿病', checked: false },
      { id: 'chd', name: '冠心病', checked: false },
      { id: 'cerebrovascular', name: '脑血管病', checked: false },
      { id: 'arthritis', name: '关节炎', checked: false },
      { id: 'other', name: '其他', checked: false }
    ],
    otherHistory: '',

    // 手术情况
    operationDate: '',
    operationTypes: [
      { id: 'tkr', name: '全膝关节置换术(TKR)' },
      { id: 'ukr', name: '单髁膝关节置换术(UKR)' },
      { id: 'acl', name: '前交叉韧带重建术' },
      { id: 'meniscus', name: '半月板修复/切除术' },
      { id: 'other', name: '其他膝关节手术' }
    ],
    operationTypeIndex: null,
    side: '',
    doctor: '',
    diagnosis: '',
    anesthesiaTypes: [
      { id: 'general', name: '全身麻醉' },
      { id: 'spinal', name: '椎管内麻醉' },
      { id: 'nerve', name: '神经阻滞麻醉' },
      { id: 'other', name: '其他' }
    ],
    anesthesiaIndex: null,
    operationDesc: '',
    flexion: '',
    extension: '',
    painScore: '',
    muscleStrengthLevels: ['0', '1', '2', '3', '4', '5'],
    muscleStrengthIndex: null,
    complications: [
      { id: 'bleeding', name: '出血', checked: false },
      { id: 'infection', name: '感染', checked: false },
      { id: 'dvt', name: '深静脉血栓', checked: false },
      { id: 'nerveDamage', name: '神经损伤', checked: false },
      { id: 'jointStiffness', name: '关节僵硬', checked: false },
      { id: 'other', name: '其他', checked: false }
    ]
  },

  // 计算BMI
  calculateBMI() {
    const { height, weight } = this.data;
    if (height && weight) {
      const heightM = height / 100; // 转换为米
      const bmi = (weight / (heightM * heightM)).toFixed(1);
      this.setData({ bmi });
    }
  },

  // 输入事件处理
  bindNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  bindGenderChange(e) {
    this.setData({ gender: e.detail.value });
  },

  bindAgeInput(e) {
    this.setData({ age: e.detail.value });
  },

  bindHeightInput(e) {
    this.setData({ height: e.detail.value });
    this.calculateBMI();
  },

  bindWeightInput(e) {
    this.setData({ weight: e.detail.value });
    this.calculateBMI();
  },

  bindPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  bindInsuranceChange(e) {
    this.setData({ insuranceIndex: e.detail.value });
  },

  bindHistoryChange(e) {
    const id = e.currentTarget.dataset.id;
    const medicalHistories = this.data.medicalHistories.map(item => {
      if (item.id === id) {
        return { ...item, checked: e.detail.value.includes(id) };
      }
      return item;
    });
    this.setData({ medicalHistories });
  },

  bindOtherHistoryInput(e) {
    this.setData({ otherHistory: e.detail.value });
  },

  // 手术情况处理
  bindDateChange(e) {
    this.setData({ operationDate: e.detail.value });
  },

  bindOperationTypeChange(e) {
    this.setData({ operationTypeIndex: e.detail.value });
  },

  bindSideChange(e) {
    this.setData({ side: e.detail.value });
  },

  bindDoctorInput(e) {
    this.setData({ doctor: e.detail.value });
  },

  bindDiagnosisInput(e) {
    this.setData({ diagnosis: e.detail.value });
  },

  bindAnesthesiaChange(e) {
    this.setData({ anesthesiaIndex: e.detail.value });
  },

  bindOperationDescInput(e) {
    this.setData({ operationDesc: e.detail.value });
  },

  bindFlexionInput(e) {
    this.setData({ flexion: e.detail.value });
  },

  bindExtensionInput(e) {
    this.setData({ extension: e.detail.value });
  },

  bindPainScoreInput(e) {
    this.setData({ painScore: e.detail.value });
  },

  bindMuscleStrengthChange(e) {
    this.setData({ muscleStrengthIndex: e.detail.value });
  },

  bindComplicationChange(e) {
    const id = e.currentTarget.dataset.id;
    const complications = this.data.complications.map(item => {
      if (item.id === id) {
        return { ...item, checked: e.detail.value.includes(id) };
      }
      return item;
    });
    this.setData({ complications });
  },

  // 导航事件
  navigateBack() {
    wx.navigateBack();
  },

  async saveInfoToCloud() {
    const {
      name,
      gender,
      age,
      height,
      weight,
      bmi,
      phone,
      insuranceIndex,
      medicalHistories,
      otherHistory,
      operationDate,
      operationTypeIndex,
      side,
      doctor,
      diagnosis,
      anesthesiaIndex,
      operationDesc,
      flexion,
      extension,
      painScore,
      muscleStrengthIndex,
      complications
    } = this.data;

    // 基础信息校验（可根据实际需求补充更多校验）
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    try {
      const patient = new AV.Object('Patient');

      // 设置患者基础信息
      patient.set('name', name);
      patient.set('gender', gender);
      patient.set('age', age);
      patient.set('height', height);
      patient.set('weight', weight);
      patient.set('bmi', bmi);
      patient.set('phone', phone);
      // 医保类型，根据索引获取对应名称
      if (insuranceIndex !== null) {
        patient.set('insuranceType', this.data.insuranceTypes[insuranceIndex].name);
      }
      // 病史，筛选出已选中的病史名称
      const selectedHistories = medicalHistories
        .filter(item => item.checked)
        .map(item => item.name);
      patient.set('medicalHistories', selectedHistories);
      patient.set('otherHistory', otherHistory);

      // 设置手术情况信息
      patient.set('operationDate', operationDate);
      // 手术类型，根据索引获取对应名称
      if (operationTypeIndex !== null) {
        patient.set('operationType', this.data.operationTypes[operationTypeIndex].name);
      }
      patient.set('side', side);
      patient.set('doctor', doctor);
      patient.set('diagnosis', diagnosis);
      // 麻醉类型，根据索引获取对应名称
      if (anesthesiaIndex !== null) {
        patient.set('anesthesiaType', this.data.anesthesiaTypes[anesthesiaIndex].name);
      }
      patient.set('operationDesc', operationDesc);
      patient.set('flexion', flexion);
      patient.set('extension', extension);
      patient.set('painScore', painScore);
      // 肌力等级，根据索引获取对应值
      if (muscleStrengthIndex !== null) {
        patient.set('muscleStrength', this.data.muscleStrengthLevels[muscleStrengthIndex]);
      }
      // 并发症，筛选出已选中的并发症名称
      const selectedComplications = complications
        .filter(item => item.checked)
        .map(item => item.name);
      patient.set('complications', selectedComplications);

      await patient.save();

      wx.showToast({
        title: '患者信息已保存到云端',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '保存失败：' + error.message,
        icon: 'none',
        duration: 3000
      });
      console.error('保存失败详情：', error);
    }
  }
});