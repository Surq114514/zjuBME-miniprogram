// 病患数据（与网页版一致）
const patientsData = {
  1: {
    name: "张明",
    surgery: "右膝关节置换术",
    surgeryType: "kneeReplacement",
    status: "康复中",
    statusFilter: "recovering",
    statusClass: "bg-secondary-10 text-secondary",
    postOp: "术后3周",
    progress: "45%",
    progressBarClass: "bg-secondary",
    progressBarWidth: "45%",
    followUp: "3天后"
  },
  2: {
    name: "李华",
    surgery: "左膝关节镜手术",
    surgeryType: "arthroscopy",
    status: "即将完成",
    statusFilter: "almostDone",
    statusClass: "bg-accent-10 text-accent",
    postOp: "术后8周",
    progress: "85%",
    progressBarClass: "bg-accent",
    progressBarWidth: "85%",
    followUp: "1周后"
  },
  3: {
    name: "王芳",
    surgery: "双膝韧带修复术",
    surgeryType: "arthroscopy",
    status: "本周需跟进",
    statusFilter: "thisWeek",
    statusClass: "bg-primary-10 text-primary",
    postOp: "术后2周",
    progress: "30%",
    progressBarClass: "bg-primary",
    progressBarWidth: "30%",
    followUp: "今天"
  },
  4: {
    name: "赵强",
    surgery: "右膝关节骨折术后",
    surgeryType: "arthroscopy",
    status: "已完成",
    statusFilter: "done",
    statusClass: "bg-neutral-200 text-neutral-600",
    postOp: "术后12周",
    progress: "100%",
    progressBarClass: "bg-neutral-400",
    progressBarWidth: "100%",
    followUp: "康复完成"
  },
  5: {
    name: "陈静",
    surgery: "左膝关节置换术",
    surgeryType: "kneeReplacement",
    status: "本周需跟进",
    statusFilter: "thisWeek",
    statusClass: "bg-primary-10 text-primary",
    postOp: "术后1周",
    progress: "15%",
    progressBarClass: "bg-primary",
    progressBarWidth: "15%",
    followUp: "明天"
  },
  6: {
    name: "刘强",
    surgery: "右膝关节镜手术",
    surgeryType: "arthroscopy",
    status: "康复中",
    statusFilter: "recovering",
    statusClass: "bg-secondary-10 text-secondary",
    postOp: "术后5周",
    progress: "60%",
    progressBarClass: "bg-secondary",
    progressBarWidth: "60%",
    followUp: "5天后"
  },
  7: {
    name: "赵敏",
    surgery: "双膝置换术",
    surgeryType: "kneeReplacement",
    status: "康复中",
    statusFilter: "recovering",
    statusClass: "bg-secondary-10 text-secondary",
    postOp: "术后4周",
    progress: "50%",
    progressBarClass: "bg-secondary",
    progressBarWidth: "50%",
    followUp: "1周后"
  },
  8: {
    name: "孙伟",
    surgery: "左膝关节骨折术后",
    surgeryType: "arthroscopy",
    status: "即将完成",
    statusFilter: "almostDone",
    statusClass: "bg-accent-10 text-accent",
    postOp: "术后10周",
    progress: "90%",
    progressBarClass: "bg-accent",
    progressBarWidth: "90%",
    followUp: "2周后"
  },
  9: {
    name: "周丽",
    surgery: "右膝关节置换术",
    surgeryType: "kneeReplacement",
    status: "本周需跟进",
    statusFilter: "thisWeek",
    statusClass: "bg-primary-10 text-primary",
    postOp: "术后6周",
    progress: "65%",
    progressBarClass: "bg-primary",
    progressBarWidth: "65%",
    followUp: "后天"
  },
  10: {
    name: "吴刚",
    surgery: "左膝关节镜手术",
    surgeryType: "arthroscopy",
    status: "已完成",
    statusFilter: "done",
    statusClass: "bg-neutral-200 text-neutral-600",
    postOp: "术后14周",
    progress: "100%",
    progressBarClass: "bg-neutral-400",
    progressBarWidth: "100%",
    followUp: "康复完成"
  },
  11: {
    name: "郑萌",
    surgery: "右膝关节韧带修复",
    surgeryType: "arthroscopy",
    status: "康复中",
    statusFilter: "recovering",
    statusClass: "bg-secondary-10 text-secondary",
    postOp: "术后3周",
    progress: "40%",
    progressBarClass: "bg-secondary",
    progressBarWidth: "40%",
    followUp: "4天后"
  },
  12: {
    name: "钱明",
    surgery: "双膝置换术",
    surgeryType: "kneeReplacement",
    status: "即将完成",
    statusFilter: "almostDone",
    statusClass: "bg-accent-10 text-accent",
    postOp: "术后9周",
    progress: "80%",
    progressBarClass: "bg-accent",
    progressBarWidth: "80%",
    followUp: "3天后"
  },
  13: {
    name: "孙笑川",
    surgery: "右膝关节置换术",
    surgeryType: "kneeReplacement",
    status: "康复中",
    statusFilter: "recovering",
    statusClass: "bg-secondary-10 text-secondary",
    postOp: "术后3周",
    progress: "45%",
    progressBarClass: "bg-secondary",
    progressBarWidth: "45%",
    followUp: "3天后"
  },
};

// 导出数据
module.exports = {
  patientsData: patientsData,
  // 根据筛选条件获取病患列表
  getFilteredPatients: function(filter) {
    let result = [];
    for (let id in patientsData) {
      const patient = patientsData[id];
      if (filter === 'all' || patient.statusFilter === filter || patient.surgeryType === filter) {
        result.push({
          id: id,
          ...patient
        });
      }
    }
    return result;
  },
  // 根据ID获取病患详情
  getPatientById: function(id) {
    return patientsData[id] ? { id: id, ...patientsData[id] } : null;
  }
};