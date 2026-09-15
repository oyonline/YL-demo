/**
 * 演示数据 —— 演示病例，不对应任何真实个人。
 *
 * 2026-09-12 按用户确认的新资料换为「王萍奶奶」。
 * MMT、MMSE 与洼田分级均直接来自该资料，本项目未生成分值。
 *
 * 仍然守住的边界：
 * - 用药剂量甲方同样未给（其模板原文只写「吃降压药（如果医生有开药）」），
 *   因此 dose 保持 '待专业确认'、confirmed: false，本项目不生成剂量；
 * - 标注 SYNTHETIC 的字段是甲方未提供、为叙事完整而虚构的，勿当作甲方数据引用。
 */

import type { Patient, TaskDef, VideoAsset, Therapist, CheckIn, ISODate, RosterEntry, VitalRecord } from './types'

export const PATIENT_ID = 'p-001'

/**
 * ⚠️ 占位号码 —— 上台前必须换成机构真实的服务电话。
 * 页面上出现可拨打的号码，写一个不存在的号有被真拨打的风险。
 */
export const SUPPORT_PHONE = '400-000-0000'

export const patient: Patient = {
  id: PATIENT_ID,
  name: '王萍奶奶',
  avatar: '',
  ageBand: '78 岁',
  gender: '女',
  // SYNTHETIC：甲方评估表未提供身高体重
  heightCm: 156,
  weightKg: 48,
  livingSituation: '与女儿同住，日间主要由女儿照护',
  caregiver: { name: '李英女士', relation: '女儿' },
  diagnosis: {
    strokeType: '脑梗死后遗症（病程 1 个月）',
    // SYNTHETIC：新资料未给确切发病日，此处仅供日期字段占位
    onsetDate: '2026-08-12',
    stage: '准备期（第 1 周）',
    comorbidities: ['高血压 20 年', '左侧肢体活动不利'],
  },
  functionStatus: {
    affectedSide: '左侧肢体活动不利',
    mobility: '左上肢肌力 MMT 4 级、左下肢 3 级，右侧良好；存在步态失衡，转移与步行全程须有人保护',
    swallowing: '洼田饮水试验 Ⅱ 级；当前按鼻饲流质饮食照护，鼻饲时抬高床头，结束后保持体位 30～60 分钟',
    cognition: 'MMSE 27 分，认知正常',
    risks: [
      '跌倒风险（步态失衡）',
      '误吸风险（洼田 Ⅱ 级）',
      '鼻饲照护（流质饮食）',
    ],
  },
  medications: [
    {
      id: 'm-01',
      name: '降压药',
      dose: '待专业确认',
      times: ['07:30'],
      notes: '甲方资料未给出药名与剂量（其任务模板原文为「吃降压药（如果医生有开药）」）。剂量须由医师／康复专业人员确认后填入，本项目不生成剂量。',
      confirmed: false,
    },
  ],
  assessments: [
    {
      name: '洼田饮水试验',
      value: 'Ⅱ 级',
      level: '可疑误吸（阳性）',
      tile: { label: '洼田饮水', value: 'Ⅱ 级', note: '可疑误吸' },
      date: '2026-09-12',
      assessor: '专业团队',
      note: '30ml 温水可全部喝完但需分两次咽下。建议进行吞咽功能训练，食物从糊状开始逐步过渡，小口慢咽，进食保持端坐位。',
      visibleToFamily: true,
    },
    {
      name: 'MMT 徒手肌力测试',
      value: '左上肢 4 级 / 左下肢 3 级 / 右侧良好',
      level: '左侧肢体活动不利',
      tile: { label: '肌力 MMT', value: '左上 4 · 左下 3', note: '右侧良好' },
      date: '2026-09-12',
      assessor: '专业团队',
      note: '左上肢肌力 4 级、左下肢肌力 3 级，右侧良好。',
      visibleToFamily: true,
    },
    {
      name: 'MMSE 简易智能量表',
      value: '27 分',
      level: '认知正常',
      tile: { label: 'MMSE', value: '27 分', note: '认知正常' },
      date: '2026-09-12',
      assessor: '康复团队',
      note: '满分 30 分，本次评估 27 分，认知正常。',
      visibleToFamily: true,
    },
  ],
  goals: {
    shortTerm: [
      '按计划完成吞咽训练与肢体训练',
      '家属能按流程完成鼻饲照护',
      '家属能完成早晚血压测量和记录',
    ],
    // SYNTHETIC：甲方长期目标写「1 个月后」，未给具体复评日，按计划制定日推算
    nextReviewDate: '2026-10-27',
  },

  careEvents: [
    { date: '2026-09-12', kind: 'assessment', title: '照护评估', detail: '完成 MMT、MMSE 与洼田饮水试验评估。' },
    { date: '2026-09-12', kind: 'homecare', title: '准备期照护计划制定', detail: '根据王萍奶奶档案制定准备期第一周照护与训练计划。' },
    { date: '2026-10-27', kind: 'upcoming', title: '下次复评', detail: '复评左侧肢体功能、认知与吞咽情况，并据此调整下一阶段计划。' },
  ],

  // SYNTHETIC：联系电话甲方未提供，此处为脱敏占位
  emergencyContact: { name: '李英女士', relation: '女儿', phoneMasked: '138****6721' },
  assistiveDevices: ['外骨骼助行设备', '床边护栏'],
  communication: '意识清楚，MMSE 27 分，认知正常，可配合指令。',
  pastHistory: ['高血压 20 年', '脑梗死后遗症，病程 1 个月', '左侧肢体活动不利'],

  origin: 'synthetic',
}

/** 康复师确认训练计划的日期 —— 依据展示引用它，不要再借用某张量表的日期 */
export const PLAN_CONFIRMED_ON: ISODate = '2026-09-12'

/**
 * 主责护理员。
 */
export const therapist: Therapist = {
  id: 't-001',
  name: '康康',
  title: '资深护理员',
}

/**
 * 今日任务模板 —— 取自甲方《银康安馨·扣子智能体演示流程与内容脚本》环节四的
 * 任务时间线，与王萍奶奶资料对齐。
 * 训练项目为「准备期（第 1 周）」方案。
 */
const RAW_TASKS: TaskDef[] = [
  {
    id: 'task-vitals-morning',
    patientId: PATIENT_ID,
    kind: 'record',
    title: '晨起测血压',
    scheduledTime: '07:00',
    instruction: '安静休息后测量血压并记录。',
    cautions: ['注意步态失衡，移动时全程有人保护', '正常范围 90–139 / 60–89 mmHg，超出请复测一次再反馈'],
    origin: 'therapist_confirmed',
  },
  {
    id: 'task-med-morning',
    patientId: PATIENT_ID,
    kind: 'medication',
    title: '服用降压药',
    scheduledTime: '07:30',
    instruction: '按医嘱服用降压药。',
    cautions: ['漏服不可自行补服双倍剂量', '如有头晕请记录并告知护理员', '药名与剂量以医师医嘱为准'],
    origin: 'therapist_confirmed',
  },
  {
    id: 'task-lower-limb',
    patientId: PATIENT_ID,
    kind: 'training',
    title: '吞咽训练',
    scheduledTime: '08:00',
    instruction: '按页面分步说明完成吞咽训练。',
    cautions: ['全程须有照护人在旁', '出现明显不适立即停止并联系专业人员'],
    videoId: 'v-swallow',
    reps: '按计划完成',
    durationMin: 10,
    origin: 'therapist_confirmed',
  },
  {
    id: 'task-swallow',
    patientId: PATIENT_ID,
    kind: 'training',
    title: '鼻饲喂食',
    scheduledTime: '08:30',
    instruction: '按资料中的 3-1-3 检查法与鼻饲流程执行：抬高床头、抽吸胃液、温水润管、鼻饲喂食、清洗胃管，结束后保持体位 30～60 分钟。',
    cautions: ['鼻饲时抬高床头 30～45°', '出现腹胀或腹泻立即停止并联系专业人员'],
    reps: '按鼻饲流程完成',
    origin: 'therapist_confirmed',
  },
  {
    id: 'task-cognition',
    patientId: PATIENT_ID,
    kind: 'training',
    title: '外骨骼助力行走',
    scheduledTime: '16:00',
    instruction: '完成设备与环境检查后，在照护人陪同下依次完成蹲起、向前走、后撤一步、向左走、向右走五个动作。',
    cautions: ['全程须有照护人在旁保护', '步态不稳或出现不适立即停止'],
    reps: '蹲起 + 前行、后撤及左右侧行走（共 5 个动作）',
    durationMin: 15,
    origin: 'therapist_confirmed',
  },
  {
    id: 'task-skin',
    patientId: PATIENT_ID,
    kind: 'training',
    title: '音乐律动操',
    scheduledTime: '17:00',
    instruction: '充分热身后，跟随音乐完成律动训练。',
    cautions: ['建议时长 10 分钟', '出现头晕、疼痛或明显疲劳立即停止'],
    videoId: 'v-drum',
    reps: '充分热身后完成',
    durationMin: 10,
    origin: 'therapist_confirmed',
  },
  {
    id: 'task-vitals-night',
    patientId: PATIENT_ID,
    kind: 'record',
    title: '睡前测量血压',
    scheduledTime: '20:30',
    instruction: '睡前安静休息后测量血压并记录。',
    cautions: ['不要自行调整药物或剂量', '数值异常时按页面提示复测并联系专业人员'],
    origin: 'therapist_confirmed',
  },
]

/**
 * 按计划时间排序后导出。
 *
 * 时间轴、康复师端执行表、日历明细都直接遍历这个数组，
 * 若依赖书写顺序，新增一条任务插错位置就会让 12:00 排到 14:00 后面（曾实测踩到）。
 */
export const taskDefs: TaskDef[] = [...RAW_TASKS].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))

/**
 * 今日任务总数 —— 必须由 taskDefs 推导。
 * 原先 roster 里写死 4，而实际任务是 6 条，康复师端会出现「5/4」这种数。
 */
export const TODAY_TASK_COUNT = taskDefs.length

/**
 * 康复师的在管患者。只有 PATIENT_ID 有完整档案与实时数据，
 * 其余仅呈现服务规模，不可点开 —— 不为演示编造第二份病例。
 */
export const roster: RosterEntry[] = [
  { id: PATIENT_ID, name: '王萍奶奶', gender: '女', ageBand: '78 岁', stage: '准备期（第 1 周）', todayDone: 0, todayTotal: TODAY_TASK_COUNT },
  { id: 'p-002', name: '周德海', gender: '男', ageBand: '78 岁', stage: '居家康复第 2 阶段', todayDone: 3, todayTotal: 3 },
  { id: 'p-003', name: '孙玉兰', gender: '女', ageBand: '81 岁', stage: '居家康复第 4 阶段', todayDone: 2, todayTotal: 4, flag: '连续 2 天未完成' },
  { id: 'p-004', name: '马长顺', gender: '男', ageBand: '73 岁', stage: '居家康复第 1 阶段', todayDone: 5, todayTotal: 5 },
  { id: 'p-005', name: '许秀英', gender: '女', ageBand: '88 岁', stage: '居家康复第 3 阶段', todayDone: 1, todayTotal: 4, flag: '反馈训练困难' },
  { id: 'p-006', name: '汪建国', gender: '男', ageBand: '69 岁', stage: '居家康复第 5 阶段', todayDone: 4, todayTotal: 4 },
  { id: 'p-007', name: '何惠珍', gender: '女', ageBand: '84 岁', stage: '居家康复第 2 阶段', todayDone: 2, todayTotal: 3 },
]

/**
 * 训练视频 —— 甲方 2026-08-28 交付的真实拍摄素材，共 17 个（去重后）。
 *
 * 文件不进仓库（约 390MB，见 .gitignore），随压缩包另发，解压到 public/videos/。
 * 文件名统一为视频 id，避免中文与「！」进 URL 产生编码问题。
 * 文件缺失时播放区自动回退到分步图文，不黑屏 —— 这是「视频另发」方案的兜底。
 *
 * 时长为 ffprobe 实测。target/goal/cautions 只在能追溯到甲方训练计划表时才填，
 * 其余留空：甲方要求「每个视频配一句话说明」但未交付，本项目不替其编造康复指导。
 */
export const videos: VideoAsset[] = [
  {
    id: 'v-swallow',
    title: '吞咽康复操',
    category: '吞咽康复类',
    src: '/videos/v-swallow.mp4',
    target: '洼田饮水试验 Ⅱ 级、舌肌与喉部肌力不足者',
    goal: '激活口颜面与咽喉肌群，改善吞咽启动',
    cautions: ['每天早晚各一次，每次约 5 分钟', '感冒或精神状态差时暂停', '出现明显呛咳立即停止并联系护理员'],
    durationSec: 210,
    origin: 'team_reviewed',
  },
  {
    id: 'v-balance',
    title: '下肢康复训练（准备期）',
    category: '肢体训练类',
    src: '/videos/v-balance.mp4',
    target: '左下肢肌力 3 级、步态失衡的老人',
    goal: '训练左下肢活动与平衡能力',
    cautions: ['力度以有酸胀感为宜，不产生疼痛', '全程须有人在旁保护', '头晕或明显疲劳立即停止'],
    durationSec: 135,
    origin: 'team_reviewed',
  },
  {
    id: 'v-transfer',
    title: '转移训练',
    category: '肢体训练类',
    src: '/videos/v-transfer.mp4',
    target: '偏瘫恢复期居家老人',
    goal: '减少照护者腰部负担，降低跌倒与压疮风险',
    cautions: ['动作前先说明，让老人有准备', '避免牵拉患侧上肢'],
    durationSec: 62,
    origin: 'team_reviewed',
  },
  { id: 'v-feed-water',   title: '喂水技巧',       category: '吞咽康复类',   src: '/videos/v-feed-water.mp4',   durationSec: 61,  origin: 'team_reviewed' },
  { id: 'v-feed-food',    title: '喂食技巧',       category: '吞咽康复类',   src: '/videos/v-feed-food.mp4',    durationSec: 54,  origin: 'team_reviewed' },
  { id: 'v-joint',        title: '关节活动',       category: '肢体训练类',   src: '/videos/v-joint.mp4',        durationSec: 69,  origin: 'team_reviewed' },
  { id: 'v-dress',        title: '穿脱衣物',       category: '基础照护类',   src: '/videos/v-dress.mp4',        durationSec: 109, origin: 'team_reviewed' },
  { id: 'v-posture',      title: '良肢位摆放',     category: '基础照护类',   src: '/videos/v-posture.mp4',      durationSec: 82,  origin: 'team_reviewed' },
  { id: 'v-bp',           title: '血压监测',       category: '基础照护类',   src: '/videos/v-bp.mp4',           durationSec: 172, origin: 'team_reviewed' },
  { id: 'v-walker',       title: '助行器行走',     category: '智能辅具类',   src: '/videos/v-walker.mp4',       durationSec: 171, origin: 'team_reviewed' },
  { id: 'v-bandage',      title: '康复辅具绷带使用', category: '智能辅具类', src: '/videos/v-bandage.mp4',      durationSec: 82,  origin: 'team_reviewed' },
  { id: 'v-vr',           title: 'VR 训练',        category: '智能辅具类',   src: '/videos/v-vr.mp4',           durationSec: 161, origin: 'team_reviewed' },
  { id: 'v-attention',    title: '注意力训练',     category: '肢体训练类',   src: '/videos/v-attention.mp4',    durationSec: 73,  origin: 'team_reviewed' },
  { id: 'v-memory',       title: '短时记忆训练',   category: '肢体训练类',   src: '/videos/v-memory.mp4',       durationSec: 93,  origin: 'team_reviewed' },
  { id: 'v-head-massage', title: '头部按摩',       category: '基础照护类', src: '/videos/v-head-massage.mp4', durationSec: 307, origin: 'team_reviewed' },
  { id: 'v-acupoint',     title: '穴位按摩',       category: '基础照护类', src: '/videos/v-acupoint.mp4',     durationSec: 88,  origin: 'team_reviewed' },
  { id: 'v-drum',         title: '音乐律动操',     category: '肢体训练类', src: '/videos/v-drum.mp4',         durationSec: 60,  origin: 'team_reviewed' },
]

/** 视频库分组顺序 —— 与甲方交付的文件夹结构一致 */
export const VIDEO_CATEGORIES = ['吞咽康复类', '肢体训练类', '智能辅具类', '基础照护类'] as const



/* ---------- 历史打卡：为打卡日历提供演示数据 ---------- */

/** 居家康复建档日（首次入户评估日）—— 打卡历史与日历可翻阅范围的起点 */
export const HOMECARE_START: ISODate = '2026-09-12'

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 生成从居家康复建档日到昨天的打卡历史。
 *
 * 必须覆盖到建档日，不能只回溯固定天数：否则日历往前翻会出现一段"既非无记录、
 * 也非未完成"的空档，与今日页的判定对不上（08-27 实测踩到）。
 *
 * 用固定模式而非随机数，保证每次演示看到的日历完全一致，可反复排练。
 * 模式按距今天数取模：每 7 天缺 1 项，每 11 天缺 2 项，其余全完成。
 */
export function buildHistory(today: Date, fromISO: ISODate = HOMECARE_START): CheckIn[] {
  void today
  void fromISO
  return []
}

/* ---------- 血压：安全范围与演示基线 ---------- */

/**
 * 安全范围 —— 甲方需求书 3.5 原文：「收缩压 90-139，舒张压 60-89」。
 * 判定阈值属专业口径，写死在这里并注明出处，不由本项目自行拟定。
 */
export const BP_SAFE = { sysMin: 90, sysMax: 139, diaMin: 60, diaMax: 89 } as const

export function isBpAbnormal(v: { systolic: number; diastolic: number }): boolean {
  return (
    v.systolic < BP_SAFE.sysMin || v.systolic > BP_SAFE.sysMax ||
    v.diastolic < BP_SAFE.diaMin || v.diastolic > BP_SAFE.diaMax
  )
}

/**
 * 演示基线数据 —— 甲方演示脚本环节六：「这里记录血压，我们上门测的数据已经在了」。
 * 按每日任务模板的 07:00 与 20:30 各测一次，铺最近三天，加上今天早晨一条。
 * 全部在安全范围内：超标那一条留给现场当场录入，才有「录入 → 预警」的过程。
 * 09:00 那条是康复护士小彭训练前测的 112/70，与评估表一致。
 */
export function buildVitals(today: Date): VitalRecord[] {
  void today
  return []
}
