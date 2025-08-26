# KneeRecover 后端实现指南（LeanCloud + AI）

本指南说明如何在 LeanCloud 上实现 KneeRecover 小程序后端，包括：数据模型（Class）、索引与 ACL、云引擎函数、数据流、以及 AI 接入点与实现方式。

## 1. 环境与项目初始化
- 注册/登录 LeanCloud（国际版或国内版任选其一）
- 创建应用，记录 AppID / AppKey / ServerURL
- 在微信小程序后台将 LeanCloud 域名加入 request/upload/download 合法域名
- 小程序端引入 SDK 并初始化（参考 README）

## 2. 数据模型（Classes）

核心采用“按日快照”的事件溯源模型，便于趋势分析、审计与协作。

### 2.1 DailySnapshot（每日快照）
- 语义：每个患者每天一个数据块，记录当天客观指标与对计划的执行结果
- 字段：
  - userId: String（关联患者）
  - date: String（YYYY-MM-DD，唯一约束 userId+date）
  - metrics: Object
    - pain: Number (0-10)
    - rom: Object { flexion: Number, extension: Number }
    - muscle: Number (0-5)
    - swelling: Object { deltaCm: Number }
    - woundPhotos: Array<File>
  - planExecution: Array<Object>
    - { planItemId: String, done: Boolean, sets?: Number, reps?: Number, duration?: Number, note?: String }
  - notes: String
  - doctorNotes: String
  - editedBy: String (patient|family|doctor)
  - version: Number（乐观锁）
  - changeLog: Array<Object>（{ by, at, field, from, to }）
  - attachments: Array<File>

建议索引：userId + date（复合唯一）、userId（单列）

ACL 建议：
- 患者本人：读/写
- 家属：读/部分写（仅 metrics、planExecution、notes；通过云函数校验）
- 医生：读/写 doctorNotes

### 2.2 PlanItem（康复计划项）
- 字段：
  - userId: String
  - title: String（练习名称）
  - phase: String（阶段）
  - dayOffset: Number（相对于手术日的天偏移，可选）
  - prescription: Object { sets?: Number, reps?: Number, duration?: Number, intensity?: String }
  - constraints: Object（禁忌/限制）
  - active: Boolean
  - createdBy: String（doctorId）

索引：userId、active

ACL：患者读；医生读/写；家属只读

### 2.3 DoctorAssignment（医患关联）
- 字段：
  - doctorId: String
  - patientId: String
  - role: String（attending|assistant）
  - validFrom: Date
  - validTo: Date

索引：doctorId、patientId

ACL：医生与对应患者可读；写入仅限医生/管理员

### 2.4 Message（聊天消息）
- 字段：
  - chatId: String（patientId 或自定义会话ID）
  - senderId: String（patient|family|doctor 的 userId）
  - type: String（text|image|snapshotRef）
  - content: String（文本或说明）
  - snapshotId: String（当 type=snapshotRef 时引用 DailySnapshot.objectId）

索引：chatId、createdAt

ACL：参与双方可读；仅发送方可改；管理员可读

### 2.5 UserProfile（扩展档案，可选）
- 字段：userId, patientType, surgeryType, surgeryDate, recoveryRate, familyMembers[], preferences{}
- 用于跨页共享与统计，不与微信用户系统强耦合

## 3. 约束与一致性
- 幂等：DailySnapshot 对 (userId, date) 设置唯一性；写入前查询或使用云函数强制幂等
- 乐观锁：更新 DailySnapshot 时携带 version 比对，否则返回 409 冲突
- 审计：所有修改通过云函数写入 changeLog

## 4. 云引擎函数（Cloud）
建议放在 cloud/ 目录，部署到 LeanCloud 云引擎。

### 4.1 保存/更新每日快照（含审计、幂等、字段级权限）
- 函数：saveDailySnapshot(params)
- 输入：{ userId, date, patch, editedBy }
- 流程：
  1) 校验来访者身份与 DoctorAssignment 
  2) 查找 (userId, date)，无则创建，有则按字段白名单合并
  3) 记录 changeLog、version++
  4) 触发增量统计（见 5）

### 4.2 查询趋势数据
- 函数：getTrends({ userId, type, days })
- 返回：按日序列（痛感、ROM、肌力、肿胀），用于图表

### 4.3 管理康复计划
- createPlanItem({ userId, ... })
- listPlanItems({ userId, active })
- updatePlanItem({ planItemId, patch })

### 4.4 聊天消息与快照引用
- sendMessage({ chatId, senderId, type, content, snapshotId })
- listMessages({ chatId, cursor, limit })
- 服务端校验 snapshotId 的访问权限

### 4.5 计算康复进度与异常检测（可触发AI）
- calculateProgress({ userId }) → 更新 UserProfile.recoveryRate
- detectAbnormal({ userId, windowDays }) → 返回异常项

## 5. 统计与预计算
- UserStats（可选汇总表）
  - userId, last7d: { painAvg, romGain, adherence }, last30d: {...}
- 在 saveDailySnapshot 成功后更新增量统计，避免每次前端全表扫描

## 6. 小程序端对接要点
- 写快照：日志页 onSubmit → 调 saveDailySnapshot
- 发到聊天：在聊天室中发送 snapshotRef（仅携带 snapshotId），对话列表展示“日快照卡片”
- 医生审阅：医生端（未来）按时间轴读取 DailySnapshot 与 UserStats

## 7. AI 接入设计

### 7.1 接入位置
- 计划生成/调整：AIPlan.suggest({ profile, recentSnapshots }) → 返回建议处方与注意事项
- 异常检测增强：AIAbnormal.analyze({ trends, phase, constraints }) → 生成可读的风险提示
- 建议生成：AIAdvice.generate({ currentIssue, context }) → 生成个性化建议文本

### 7.2 部署与安全
- 放置于云引擎（Node.js），由云函数封装外部大模型 API（如 Azure OpenAI/自建大模型）
- 统一网关：POST /ai/chat，校验调用者身份；服务端保管 API Key，不在小程序端暴露
- 记录调用日志（脱敏），错误降级到规则引擎

### 7.3 示例：计划智能生成（伪代码）
```js
AV.Cloud.define('aiSuggestPlan', async (req) => {
  const { userId } = req.params;
  const profile = await getUserProfile(userId);
  const snapshots = await fetchRecentSnapshots(userId, 14);
  const prompt = buildPlanPrompt(profile, snapshots);
  const ai = await callLLM({ prompt, temperature: 0.6 });
  const plan = parsePlan(ai.text);
  return plan;
});
```

## 8. 权限与安全（ACL）
- 所有写操作通过云函数统一出口，前端直写最小化
- ACL 模板：
  - DailySnapshot: patient RW, family R/limited W, doctor R/doctorNotes W
  - PlanItem: doctor RW, patient R, family R
  - Message: participants R，sender W
- 敏感文件（照片）使用 File 存储与授权 URL，设置过期时间

## 9. 索引策略
- DailySnapshot: userId + date（唯一），userId
- PlanItem: userId, active
- Message: chatId, createdAt
- DoctorAssignment: doctorId, patientId

## 10. 里程碑与工作量
- 第1周：建表、ACL、saveDailySnapshot/getTrends 云函数、消息发送
- 第2周：PlanItem 管理、增量统计、聊天室快照卡片
- 第3周：AI 接入（计划建议/异常检测），灰度与回退策略

## 11. 测试清单
- 幂等：同一日重复提交是否更新同条记录
- 并发：两个端同时编辑是否触发版本冲突
- 权限：家属只能改允许字段；医生能写 doctorNotes
- 趋势：7/30天查询时间窗口正确
- 聊天：snapshotRef 权限校验与渲染

---
如需边做边验收，可按上面的里程碑逐步落地，每完成一项即在前端对接并回归测试。
