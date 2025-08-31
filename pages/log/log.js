//联系云端
const app = getApp();
const AV = require('../../libs/av-core-min.js');


// pages/log/log.js
Page({
    data: {
      currentTab: 'pain',
      
      // 疼痛记录数据
      restPain: 0,
      activityPain: 0,
      nightPain: 0,
      medicineName: '',
      medicineDose: '',
      medicineTime: '',
      painDescription: '',
      
      // 活动度记录数据
      flexionAngle: 0,
      extensionAngle: 0,
      romDescription: '',
      flexionPhotoUrl: '',
      extensionPhotoUrl: '',
    
      // 肌力记录数据
     
      
      // 肿胀记录数据（包含多选）
      swellingLevel: 0,
      swellingNotes: '',
      //用户四侧记录数据
      JswellDown: '',
      JswellUp:'',
      HswellUp:'',
      HswellDown:'',
      
      // 功能记录数据（包含多选）
      walkingAbility:0,     // 存储行走能力选项
      walkingOptions:['困难（运动持续痛）','普通（运动间歇性痛）','轻松（运动无不适）'],
      stairsAbility:0,      // 存储上下楼梯能力选项
      stairsOptions:['正常','扶栏杆','一步一阶','困难','不能上下'],
      feeling:0,//储存上下楼梯感受选项
      feelingOptions:['抬腿有痛觉','落脚有痛觉','无痛觉'],
      walkingDistance: '',
      functionNotes: '',
      
      // 伤口记录数据
      woundImages: [],
      woundStatus: '',
      woundNotes: '',
      //初始化伤口选项数组
      woundOptions:['愈合良好','轻微红肿','有渗液','其他'],
      //初始化选中索引
      woundCondition:0,
      
        // 初始化肌力选项数组
        strengthOptions: ['完全瘫痪', '可收缩', '可平移', '可抗重力', '抗部分阻力', '正常(5级)'],
        quStrengthquadricepsOptions: ['完全瘫痪', '可收缩', '可平移', '可抗重力', '抗部分阻力', '正常(5级)'],
        kuanOptions:['完全瘫痪','可收缩','可平移', '可抗重力', '抗部分阻力', '正常(5级)'],
        jianOptions:['0','1','2','3','4','5'],
        // 初始化选中索引
        hamstringStrength: 5 ,// 默认选中"正常(5级)"
        quadricepsStrength:5,
        kuanStrength:5,
        jianStrength:5,
    },

    onHamstringStrengthChange: function(e) {
        this.setData({
          hamstringStrength: e.detail.value
        });
      },
    onLoad() {
      // 加载最新的记录数据作为初始值
      this.loadLatestRecords();
    },
    
    // 加载最新的记录数据
    loadLatestRecords() {
      const records = wx.getStorageSync('recoveryRecords') || [];
      if (records.length === 0) return;
      
      const latestRecord = records[records.length - 1];
      
      // 设置疼痛记录初始值
      if (latestRecord.pain) {
        this.setData({
          restPain: latestRecord.pain.rest || 0,
          activityPain: latestRecord.pain.activity || 0,
          nightPain: latestRecord.pain.night || 0,
          medicineName: latestRecord.pain.medicine?.name || '',
          medicineDose: latestRecord.pain.medicine?.dose || '',
          medicineTime: latestRecord.pain.medicine?.time || '',
          painDescription: latestRecord.pain.description || ''
        });
      }
      
      // 设置活动度初始值
      if (latestRecord.rangeOfMotion) {
        this.setData({
          flexionAngle: latestRecord.rangeOfMotion.flexion || 0,
          extensionAngle: latestRecord.rangeOfMotion.extension || 0,
          romDescription: latestRecord.rangeOfMotion.description || '',
          flexionPhotoUrl: latestRecord.rangeOfMotion.flexionPhoto || '',
          extensionPhotoUrl: latestRecord.rangeOfMotion.extensionPhoto || ''
        });
      }
      
      // 设置肌力初始值
      if (latestRecord.muscleStrength) {
        this.setData({
          quadricepsStrength: latestRecord.muscleStrength.quadriceps || 3,
          hamstringStrength: latestRecord.muscleStrength.hamstring || 3,
          straightLegRaiseChecked: latestRecord.muscleStrength.training?.includes('straightLegRaise') || false,
          straightLegRaiseSets: latestRecord.muscleStrength.trainingSets?.straightLegRaise || '',
          squatsChecked: latestRecord.muscleStrength.training?.includes('squats') || false,
          squatsSets: latestRecord.muscleStrength.trainingSets?.squats || '',
          stepUpsChecked: latestRecord.muscleStrength.training?.includes('stepUps') || false,
          stepUpsSets: latestRecord.muscleStrength.trainingSets?.stepUps || '',
          otherTrainingChecked: latestRecord.muscleStrength.training?.includes('other') || false,
          otherTrainingName: latestRecord.muscleStrength.otherTrainingName || '',
          otherTrainingSets: latestRecord.muscleStrength.trainingSets?.other || ''
        });
      }
      
      // 设置肿胀初始值（包含多选数据）
      if (latestRecord.swelling) {
        this.setData({
          swellingLevel: latestRecord.swelling.level || 0,
          swellingLocations: latestRecord.swelling.locations || [],
          swellingNotes: latestRecord.swelling.notes || ''
        });
      }
      
      // 设置功能初始值（包含多选数据）
      if (latestRecord.function) {
        this.setData({
          walkingAbility: latestRecord.function.walkingAbility || [],
          stairsAbility: latestRecord.function.stairsAbility || [],
          walkingDistance: latestRecord.function.walkingDistance || '',
          functionNotes: latestRecord.function.notes || ''
        });
      }
      
      // 设置伤口初始值
      if (latestRecord.wound) {
        this.setData({
          woundImages: latestRecord.wound.images || [],
          woundStatus: latestRecord.wound.status || '',
          woundNotes: latestRecord.wound.notes || ''
        });
      }
    },
    
    // 切换标签页
    switchTab(e) {
      this.setData({
        currentTab: e.currentTarget.dataset.tab
      });
    },
    
    // ====================== 疼痛记录相关方法 ======================
    onRestPainChange(e) {
      this.setData({
        restPain: e.detail.value
      });
    },
    
    onActivityPainChange(e) {
      this.setData({
        activityPain: e.detail.value
      });
    },
    
    onNightPainChange(e) {
      this.setData({
        nightPain: e.detail.value
      });
    },
    
    onMedicineNameChange(e) {
      this.setData({
        medicineName: e.detail.value
      });
    },
    
    onMedicineDoseChange(e) {
      this.setData({
        medicineDose: e.detail.value
      });
    },
    
    onMedicineTimeChange(e) {
      this.setData({
        medicineTime: e.detail.value
      });
    },
    
    onPainDescriptionChange(e) {
      this.setData({
        painDescription: e.detail.value
      });
    },
    
    // 保存疼痛记录
    savePainRecord() {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('recoveryRecords') || [];
      let todayRecordIndex = records.findIndex(record => record.date === today);
      
      const painData = {
        rest: this.data.restPain,
        activity: this.data.activityPain,
        night: this.data.nightPain,
        average: Math.round((this.data.restPain + this.data.activityPain + this.data.nightPain) / 3),
        description: this.data.painDescription,
        medicine: {
          name: this.data.medicineName,
          dose: this.data.medicineDose,
          time: this.data.medicineTime
        }
      };
      
      if (todayRecordIndex !== -1) {
        records[todayRecordIndex].pain = painData;
      } else {
        records.push({
          date: today,
          pain: painData,
          rangeOfMotion: {},
          muscleStrength: {},
          swelling: {},
          function: {},
          wound: {}
        });
      }
      
      wx.setStorageSync('recoveryRecords', records);
      wx.showToast({ title: '疼痛记录已保存', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2000);
    },
    
    // ====================== 活动度记录相关方法 ======================
    onFlexionAngleChange(e) {
      this.setData({
        flexionAngle: e.detail.value
      });
    },
    
    onExtensionAngleChange(e) {
      this.setData({
        extensionAngle: e.detail.value
      });
    },
    
    onRomDescriptionChange(e) {
      this.setData({
        romDescription: e.detail.value
      });
    },
    
    uploadFlexionPhoto() {
      const that = this;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          that.setData({ flexionPhotoUrl: res.tempFilePaths[0] });
        }
      });
    },
    
    uploadExtensionPhoto() {
      const that = this;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          that.setData({ extensionPhotoUrl: res.tempFilePaths[0] });
        }
      });
    },
    
    deleteFlexionPhoto() {
      this.setData({ flexionPhotoUrl: '' });
    },
    
    deleteExtensionPhoto() {
      this.setData({ extensionPhotoUrl: '' });
    },
    
    // 保存活动度记录
    saveRomRecord() {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('recoveryRecords') || [];
      let todayRecordIndex = records.findIndex(record => record.date === today);
      
      const romData = {
        flexion: this.data.flexionAngle,
        extension: this.data.extensionAngle,
        description: this.data.romDescription,
        flexionPhoto: this.data.flexionPhotoUrl,
        extensionPhoto: this.data.extensionPhotoUrl
      };
      
      if (todayRecordIndex !== -1) {
        records[todayRecordIndex].rangeOfMotion = romData;
      } else {
        records.push({
          date: today,
          pain: {},
          rangeOfMotion: romData,
          muscleStrength: {},
          swelling: {},
          function: {},
          wound: {}
        });
      }
      
      wx.setStorageSync('recoveryRecords', records);
      wx.showToast({ title: '活动度记录已保存', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2000);
    },
    
    // ====================== 肌力记录相关方法 ======================
    onQuadricepsStrengthChange(e) {
      this.setData({
        quadricepsStrength: e.detail.value
      });
    },
    
    onHamstringStrengthChange(e) {
      this.setData({
        hamstringStrength: e.detail.value
      });
    },
    onkuanStrengthChange(e) {
        this.setData({
          kuanStrength: e.detail.value
        });
      },

      onjianStrengthChange(e) {
        this.setData({
          jianStrength: e.detail.value
        });
      },
    
    onTrainingChange(e) {
      const value = e.currentTarget.dataset.value;
      const checked = e.detail.checked;
      
      switch(value) {
        case 'straightLegRaise':
          this.setData({ straightLegRaiseChecked: checked });
          break;
        case 'squats':
          this.setData({ squatsChecked: checked });
          break;
        case 'stepUps':
          this.setData({ stepUpsChecked: checked });
          break;
        case 'other':
          this.setData({ otherTrainingChecked: checked });
          break;
      }
    },
    
    onStraightLegRaiseSetsChange(e) {
      this.setData({ straightLegRaiseSets: e.detail.value });
    },
    
    onSquatsSetsChange(e) {
      this.setData({ squatsSets: e.detail.value });
    },
    
    onStepUpsSetsChange(e) {
      this.setData({ stepUpsSets: e.detail.value });
    },
    
    onOtherTrainingNameChange(e) {
      this.setData({ otherTrainingName: e.detail.value });
    },
    
    onOtherTrainingSetsChange(e) {
      this.setData({ otherTrainingSets: e.detail.value });
    },
    
    // 保存肌力记录
    saveMuscleRecord() {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('recoveryRecords') || [];
      let todayRecordIndex = records.findIndex(record => record.date === today);
      
      // 收集训练类型
      const trainingTypes = [];
      if (this.data.straightLegRaiseChecked) trainingTypes.push('straightLegRaise');
      if (this.data.squatsChecked) trainingTypes.push('squats');
      if (this.data.stepUpsChecked) trainingTypes.push('stepUps');
      if (this.data.otherTrainingChecked) trainingTypes.push('other');
      
      // 收集训练组数
      const trainingSets = {
        straightLegRaise: this.data.straightLegRaiseSets,
        squats: this.data.squatsSets,
        stepUps: this.data.stepUpsSets,
        other: this.data.otherTrainingSets
      };
      
      const muscleData = {
        quadriceps: this.data.quadricepsStrength,
        hamstring: this.data.hamstringStrength,
        training: trainingTypes,
        trainingSets,
        otherTrainingName: this.data.otherTrainingName
      };
      
      if (todayRecordIndex !== -1) {
        records[todayRecordIndex].muscleStrength = muscleData;
      } else {
        records.push({
          date: today,
          pain: {},
          rangeOfMotion: {},
          muscleStrength: muscleData,
          swelling: {},
          function: {},
          wound: {}
        });
      }
      
      wx.setStorageSync('recoveryRecords', records);
      wx.showToast({ title: '肌力记录已保存', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2000);
    },
    
    // ====================== 肿胀记录相关方法（包含多选处理） ======================
    onSwellingLevelChange(e) {
      this.setData({
        swellingLevel: e.detail.value
      });
    },
    
    onHuanswellUp(e) {
        this.setData({
            HswellUp: e.detail.value
        });
      },

      onHuanswellDown(e) {
        this.setData({
            HswellDown: e.detail.value
        });
      },

      onJianswellUp(e) {
        this.setData({
            JswellUp: e.detail.value
        });
      },

      onJianswellDown(e) {
        this.setData({
            JswellDown: e.detail.value
        });
      },

    // 肿胀位置多选处理
    toggleLocation(e) {
      const location = e.currentTarget.dataset.location;
      const locations = [...this.data.swellingLocations];
      const index = locations.indexOf(location);
      
      if (index === -1) {
        locations.push(location); // 选中添加
      } else {
        locations.splice(index, 1); // 取消选中移除
      }
      
      this.setData({ swellingLocations: locations });
    },
    
    onSwellingNotesChange(e) {
      this.setData({
        swellingNotes: e.detail.value
      });
    },
    
    // 保存肿胀记录
    saveSwellingRecord() {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('recoveryRecords') || [];
      let todayRecordIndex = records.findIndex(record => record.date === today);
      
      const swellingData = {
        level: this.data.swellingLevel,
        locations: this.data.swellingLocations,
        notes: this.data.swellingNotes
      };
      
      if (todayRecordIndex !== -1) {
        records[todayRecordIndex].swelling = swellingData;
      } else {
        records.push({
          date: today,
          pain: {},
          rangeOfMotion: {},
          muscleStrength: {},
          swelling: swellingData,
          function: {},
          wound: {}
        });
      }
      
      wx.setStorageSync('recoveryRecords', records);
      wx.showToast({ title: '肿胀记录已保存', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2000);
    },
    
    // ====================== 功能记录相关方法（包含多选处理） ======================
    // 行走能力多选处理
    onwalkingChange(e) {
        this.setData({
          walkingAbility: e.detail.value
        });
      },
    
    // 上下楼梯能力多选处理
    onstairsChange(e) {
        this.setData({
          stairsAbility: e.detail.value
        });
      },
      //上下楼梯感受
      onfeelingChange(e) {
        this.setData({
          feeling: e.detail.value
        });
      },
    
    onWalkingDistanceChange(e) {
      this.setData({
        walkingDistance: e.detail.value
      });
    },
    
    onFunctionNotesChange(e) {
      this.setData({
        functionNotes: e.detail.value
      });
    },
    
    // 保存功能记录
    saveFunctionRecord() {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('recoveryRecords') || [];
      let todayRecordIndex = records.findIndex(record => record.date === today);
      
      const functionData = {
        walkingAbility: this.data.walkingAbility,
        stairsAbility: this.data.stairsAbility,
        walkingDistance: this.data.walkingDistance,
        notes: this.data.functionNotes
      };
      
      if (todayRecordIndex !== -1) {
        records[todayRecordIndex].function = functionData;
      } else {
        records.push({
          date: today,
          pain: {},
          rangeOfMotion: {},
          muscleStrength: {},
          swelling: {},
          function: functionData,
          wound: {}
        });
      }
      
      wx.setStorageSync('recoveryRecords', records);
      wx.showToast({ title: '功能记录已保存', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2000);
    },
    
    // ====================== 伤口记录相关方法 ======================

    onwoundConditionChange(e) {
        this.setData({
          woundCondition: e.detail.value
        });
      },

    chooseWoundImage() {
      const that = this;
      const remaining = 8 - this.data.woundImages.length;
      if (remaining <= 0) {
        wx.showToast({ title: '最多上传8张图片', icon: 'none' });
        return;
      }
      
      wx.chooseImage({
        count: remaining,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          const newImages = [...that.data.woundImages, ...res.tempFilePaths];
          that.setData({ woundImages: newImages });
        }
      });
    },
    
    deleteWoundImage(e) {
      const index = e.currentTarget.dataset.index;
      const images = [...this.data.woundImages];
      images.splice(index, 1);
      this.setData({ woundImages: images });
    },
    
    onWoundStatusChange(e) {
      this.setData({
        woundStatus: e.detail.value
      });
    },
    
    onWoundNotesChange(e) {
      this.setData({
        woundNotes: e.detail.value
      });
    },
    
    // 保存伤口记录
    saveWoundRecord() {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('recoveryRecords') || [];
      let todayRecordIndex = records.findIndex(record => record.date === today);
      
      const woundData = {
        images: this.data.woundImages,
        status: this.data.woundStatus,
        notes: this.data.woundNotes
      };
      
      if (todayRecordIndex !== -1) {
        records[todayRecordIndex].wound = woundData;
      } else {
        records.push({
          date: today,
          pain: {},
          rangeOfMotion: {},
          muscleStrength: {},
          swelling: {},
          function: {},
          wound: woundData
        });
      }
      
      wx.setStorageSync('recoveryRecords', records);
      wx.showToast({ title: '伤口记录已保存', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2000);
    },

//保存到云端
async saveInfoToCloud(){
    const{
            restPain,
            activityPain,
            nightPain,
            medicineName,
            medicineDose,
            medicineTime,
            painDescription,
            
            // 活动度记录数据

            romDescription,
            flexionAngle,
            extensionAngle,
            
            // 肌力记录数据
            quadricepsStrength,
            hamstringStrength,
            kuanStrength,
            jianStrength,
            // 肿胀记录数据（包含多选）
            swellingLevel,
             // 存储多选的肿胀位置
            swellingNotes,
            //用户四侧记录数据
            JswellDown,
            JswellUp,
            HswellUp,
            HswellDown,
            
            // 功能记录数据（包含多选）

            walkingDistance,
            functionNotes,
            walkingAbility,
            feeling,
            stairsAbility,
            // 伤口记录数据
           woundCondition,
            woundStatus,
            woundNotes,
woundImages,
 
    }=this.data;
    update:{
        const recover = new AV.Object('Recover');
        recover.set('restPain',restPain);
        recover.set('activityPain',activityPain);
        recover.set('nightPain',nightPain);
        recover.set('medicineName',medicineName);
        recover.set('medicineDose',medicineDose);
        recover.set('medicineTime',medicineTime);
        recover.set('painDescription',painDescription);
        recover.set('romDescription',romDescription);
        recover.set('flextionAngle',flexionAngle);
        recover.set('extensionAngle',extensionAngle);
        recover.set('quadricepsStrength',quadricepsStrength);
        recover.set('swellingNotes',swellingNotes);
        recover.set('JswellDown',JswellDown);
        recover.set('JswellUp',JswellUp);
        recover.set('HswellUp',HswellUp);
        recover.set('HswellDown',HswellDown);
        recover.set('walkingDistance',walkingDistance);
        recover.set('functionNotes',functionNotes);
        recover.set('woundStatus',woundStatus);
        recover.set('woundNotes',woundNotes);
        recover.set('strengthOptions',this.data.strengthOptions[hamstringStrength]);
        recover.set('swellingLevel',swellingLevel);
        recover.set('quStrengthquadricepsOptions',this.data.quStrengthquadricepsOptions[quadricepsStrength]);
        recover.set('woundOptions',this.data.woundOptions[woundCondition]);
        recover.set('kuanOptions',this.data.kuanOptions[kuanStrength]);
        recover.set('jianOptions',this.data.jianOptions[jianStrength]);
        recover.set('walkingAbility',this.data.walkingOptions[walkingAbility]);
        recover.set('stairsOptions',this.data.stairsOptions[stairsAbility]);
        recover.set('jianOptions',this.data.jianOptions[jianStrength]);
        recover.set('feeling',this.data.feelingOptions[feeling]);
        recover.set('woundImages',woundImages);
    await recover.save();

    wx.showToast({
      title: '康复记录已保存到云端',
      icon: 'success'
})
    }
},

  });
  

  