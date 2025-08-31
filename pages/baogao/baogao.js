const app = getApp();
const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    isDarkMode: false,
    recoveryChart: null,
    patientData:null,
    recoverData:null,
    isLoading: true,     // 加载状态管理
    hasError: false,     // 错误状态
    errorMsg: ''   
  },

  onLoad() {
    // 检查系统主题
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      isDarkMode: systemInfo.theme === 'dark'
    });
    
    // 监听主题变化
    wx.onThemeChange((res) => {
      this.setData({
        isDarkMode: res.theme === 'dark'
      });
      this.updateChartTheme();
    });
    
    // 初始化图表
    this.initChart();
    this.queryDataByUserId();
  },

  // 切换主题
  toggleTheme() {
    const newMode = !this.data.isDarkMode;
    this.setData({
      isDarkMode: newMode
    });
    this.updateChartTheme();
  },

  async queryDataByUserId() {
    try {
    //此处需要插入根据userid的查找
    
    const [patientRes, recoverRes] = await Promise.all([
      this.queryPatientTable(userId), // 查询 Patient 表
      this.queryRecoverTable(userId)  // 查询 Recover 表
    ]);

    //处理查询结果，更新数据
    this.setData({
      patientData: patientRes,
      recoverData: recoverRes,
      isLoading: false
    });
  } catch (error) {
    // 4. 错误处理
    this.setData({
      isLoading: false,
      hasError: true,
      errorMsg: error.message || '数据查询失败'
    });
    console.error('查询数据出错：', error);
  }
},

async queryPatientTable(userId) {
  const query = new AV.Query('Patient'); // 创建 Patient 表的查询对象
  query.equalTo('userId', userId);       // 按 userId 筛选
  const patientData = await query.find();// 获取所有匹配数据（返回数组）
  return patientData.length > 0 ? patientData[0] : null; // 取第一条或返回 null
},

// 辅助方法：查询 Recover 表
async queryRecoverTable(userId) {
  const query = new AV.Query('Recover'); // 创建 Recover 表的查询对象
  query.equalTo('userId', userId);       // 按 userId 筛选
  const recoverData = await query.find();// 获取所有匹配数据（返回数组）
  return recoverData; // 返回康复数据数组（可能多条）
},

  // 初始化康复趋势图表
  initChart() {
    const isDark = this.data.isDarkMode;
    const textColor = isDark ? '#f3f4f6' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    
    // 从云端数据中提取图表所需数据（recoverRes 是查询得到的康复数据数组）
    const recoverData = this.data.recoverRes;
    if (!recoverData || recoverData.length === 0) {
      wx.showToast({ title: '暂无康复数据', icon: 'none' });
      return;
    }
  
    const datasets = [
      {
        label: '关节活动度 (°)',
        data: recoverData.map(item => item.get('jointAngle')), // 待修改成‘记录’组命名的数据
        color: '#3B82F6',
        fillColor: 'rgba(59, 130, 246, 0.1)'
      },
      {
        label: '肌肉力量 (%)',
        data: recoverData.map(item => item.get('muscleStrength')), // 待修改成‘记录’组命名的数据
        color: '#10B981',
        fillColor: 'rgba(16, 185, 129, 0.1)'
      },
      {
        label: '疼痛指数 (0-10)',
        data: recoverData.map(item => item.get('painIndex')),// 待修改成‘记录’组命名的数据
        color: '#EC4899',
        fillColor: 'rgba(236, 72, 153, 0.1)'
      }
    ];
    
    // 计算画布尺寸
    const query = wx.createSelectorQuery().in(this);
    query.select('.chart-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        // 使用Chart.js绘制图表
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: datasets.map(dataset => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: dataset.color,
              backgroundColor: dataset.fillColor,
              tension: 0.4,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: textColor,
                  boxWidth: 12,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: textColor,
                  font: {
                    size: 10
                  }
                }
              },
              y: {
                grid: {
                  borderDash: [2, 4],
                  color: gridColor
                },
                ticks: {
                  color: textColor,
                  font: {
                    size: 10
                  }
                }
              }
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            }
          }
        });
        
        this.setData({
          recoveryChart: chart
        });
      });
  },

  // 更新图表主题
  updateChartTheme() {
    if (!this.data.recoveryChart) return;
    
    const isDark = this.data.isDarkMode;
    const textColor = isDark ? '#f3f4f6' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    
    // 更新图表配置
    this.data.recoveryChart.options.plugins.legend.labels.color = textColor;
    this.data.recoveryChart.options.scales.x.ticks.color = textColor;
    this.data.recoveryChart.options.scales.y.ticks.color = textColor;
    this.data.recoveryChart.options.scales.y.grid.color = gridColor;
    
    // 更新图表
    this.data.recoveryChart.update();
  }
});