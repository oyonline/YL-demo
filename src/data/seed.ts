/**
 * 演示数据 —— 演示病例，不对应任何真实个人。
 *
 * 2026-09-21 按用户确认的新资料更新为「王萍」。
 * MMT、MNA-SF 与洼田分级均直接来自该资料，本项目未生成分值。
 *
 * 仍然守住的边界：
 * - 用药剂量甲方同样未给（其模板原文只写「吃降压药（如果医生有开药）」），
 *   因此 dose 保持 '待专业确认'、confirmed: false，本项目不生成剂量；
 * - 标注 SYNTHETIC 的字段是甲方未提供、为叙事完整而虚构的，勿当作甲方数据引用。
 */

import type { Patient, TaskDef, VideoAsset, Therapist, CheckIn, CheckInStatus, GameStageRecord, ISODate, RosterEntry, VitalRecord } from './types'

export const PATIENT_ID = 'p-001'

/**
 * ⚠️ 占位号码 —— 上台前必须换成机构真实的服务电话。
 * 页面上出现可拨打的号码，写一个不存在的号有被真拨打的风险。
 */
export const SUPPORT_PHONE = '400-000-0000'

export const patient: Patient = {
  id: PATIENT_ID,
  name: '王萍',
  avatar: '',
  ageBand: '78 岁',
  gender: '女',
  maritalStatus: '丧偶',
  occupation: '农村中学退休音乐老师',
  monthlyPensionYuan: 4000,
  heightCm: 155,
  weightKg: 42,
  bodyMetrics: { bmi: 17.5, upperArmCm: 22, calfCm: 30 },
  livingSituation: '丧偶，由独女李英照护',
  caregiver: {
    name: '李英', relation: '独女', gender: '女', age: 50,
    skillGaps: ['知识匮乏', '资源不足'],
    pressures: ['母女关系紧张', '未来焦虑'],
  },
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
    swallowing: '洼田饮水试验 Ⅲ 级；当前按鼻饲流质饮食照护，鼻饲时抬高床头，结束后保持体位 30～60 分钟',
    cognition: '神志清醒，能进行语言沟通',
    risks: [
      '跌倒风险（步态失衡）',
      '误吸风险（洼田 Ⅲ 级）',
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
      value: 'Ⅲ 级',
      level: '吞咽障碍',
      tile: { label: '洼田饮水', value: 'Ⅲ 级', note: '吞咽障碍' },
      date: '2026-09-12',
      assessor: '专业团队',
      note: '洼田饮水试验Ⅲ级，存在吞咽障碍。',
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
      name: 'MNA-SF 营养评估',
      value: '7 分',
      level: '营养失调',
      tile: { label: 'MNA-SF', value: '7 分', note: '营养失调' },
      date: '2026-09-12',
      assessor: '康复团队',
      note: 'MNA-SF 7分，提示营养失调。',
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

  psychosocial: '情绪波动：烦躁、恐惧、拒绝接触',
  careEvents: [
    { date: '2026-09-12', kind: 'assessment', title: '照护评估', detail: '完成 MMT、MNA-SF 与洼田饮水试验评估。' },
    { date: '2026-09-12', kind: 'homecare', title: '准备期照护计划制定', detail: '根据王萍档案制定准备期第一周照护与训练计划。' },
    { date: '2026-10-27', kind: 'upcoming', title: '下次复评', detail: '复评左侧肢体功能、认知与吞咽情况，并据此调整下一阶段计划。' },
  ],

  // SYNTHETIC：联系电话甲方未提供，此处为脱敏占位
  emergencyContact: { name: '李英', relation: '独女', phoneMasked: '138****6721' },
  assistiveDevices: ['外骨骼助行设备', '床边护栏'],
  communication: '神志清醒，能进行语言沟通。',
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
 * 任务时间线，与王萍资料对齐。
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
    instruction: '完成设备与环境检查后，在照护人陪同下跟随动态图依次完成踏步热身、左右侧步、步态衔接、上肢开合、双臂交叉和伸臂抬腿六个阶段。',
    cautions: ['全程须有照护人在旁保护', '步态不稳或出现不适立即停止'],
    reps: '下肢步态训练 + 上肢协同训练（共 6 个阶段）',
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
  { id: PATIENT_ID, name: '王萍', gender: '女', ageBand: '78 岁', stage: '准备期（第 1 周）', todayDone: 0, todayTotal: TODAY_TASK_COUNT },
  { id: 'p-002', name: '周德海', gender: '男', ageBand: '78 岁', stage: '居家康复第 2 阶段', todayDone: 3, todayTotal: 3 },
  { id: 'p-003', name: '孙玉兰', gender: '女', ageBand: '81 岁', stage: '居家康复第 4 阶段', todayDone: 2, todayTotal: 4, flag: '连续 2 天未完成' },
  { id: 'p-004', name: '马长顺', gender: '男', ageBand: '73 岁', stage: '居家康复第 1 阶段', todayDone: 5, todayTotal: 5 },
  { id: 'p-005', name: '许秀英', gender: '女', ageBand: '88 岁', stage: '居家康复第 3 阶段', todayDone: 1, todayTotal: 4, flag: '反馈训练困难' },
  { id: 'p-006', name: '汪建国', gender: '男', ageBand: '69 岁', stage: '居家康复第 5 阶段', todayDone: 4, todayTotal: 4 },
  { id: 'p-007', name: '何惠珍', gender: '女', ageBand: '84 岁', stage: '居家康复第 2 阶段', todayDone: 2, todayTotal: 3 },
]

/**
 * 训练视频 —— 甲方 2026-08-28 交付 17 个，2026-09-22 用户补充 4 个，共 21 个。
 *
 * 文件随仓放在 public/videos/，保证部署构建和断网演示都能正常播放。
 * 文件名统一为视频 id，避免中文与「！」进 URL 产生编码问题。
 * 文件缺失时播放区自动回退到分步图文，不黑屏 —— 这是「视频另发」方案的兜底。
 *
 * 时长为 ffprobe 实测。target/goal/cautions 只在能追溯到甲方训练计划表时才填，
 * 其余留空：甲方要求「每个视频配一句话说明」但未交付，本项目不替其编造康复指导。
 */
export const FEATURED_VIDEO_IDS = [
  'v-swallow-training',
  'v-limb-rehab-exercise',
  'v-fruit-meal',
  'v-tube-feeding',
] as const

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
  {
    id: 'v-swallow-training',
    title: '吞咽训练',
    category: '吞咽康复类',
    src: '/videos/v-swallow-training.mp4',
    poster: '/posters/v-swallow-training.jpg',
    durationSec: 15,
    origin: 'team_reviewed',
  },
  {
    id: 'v-limb-rehab-exercise',
    title: '肢体康复训练操',
    category: '肢体训练类',
    src: '/videos/v-limb-rehab-exercise.mp4',
    poster: '/posters/v-limb-rehab-exercise.jpg',
    durationSec: 50,
    origin: 'team_reviewed',
  },
  {
    id: 'v-fruit-meal',
    title: '水果餐制作',
    category: '基础照护类',
    src: '/videos/v-fruit-meal.mp4',
    poster: '/posters/v-fruit-meal.jpg',
    durationSec: 31,
    origin: 'team_reviewed',
  },
  {
    id: 'v-tube-feeding',
    title: '鼻饲管进食',
    category: '基础照护类',
    src: '/videos/v-tube-feeding.mp4',
    poster: '/posters/v-tube-feeding.jpg',
    durationSec: 38,
    origin: 'team_reviewed',
  },
]

/** 视频库分组顺序 —— 与甲方交付的文件夹结构一致 */
export const VIDEO_CATEGORIES = ['吞咽康复类', '肢体训练类', '智能辅具类', '基础照护类'] as const



/* ---------- 历史打卡：为打卡日历提供演示数据 ---------- */

/** 居家康复建档日（首次入户评估日）—— 打卡历史与日历可翻阅范围的起点 */
export const HOMECARE_START: ISODate = '2026-09-12'

/** 本轮演示计划从 9 月 1 日开始，历史记录也从这一天铺设。 */
export const SIMULATED_HISTORY_START: ISODate = '2026-09-01'

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const FEEDING_HISTORY_TASKS = [
  ['task-feed-meal-1', '07:00'],
  ['task-feed-medication', '07:30'],
  ['task-feed-meal-2', '11:00'],
  ['task-feed-snack-1', '13:00'],
  ['task-feed-meal-3', '15:00'],
  ['task-feed-snack-2', '17:00'],
  ['task-feed-meal-4', '19:00'],
] as const

/**
 * 固定历史模式：7 表示全部完成，1–6 表示部分完成，0 表示全部未完成，
 * null 则整天不写记录。用固定日期和固定模式，保证每次演示结果一致。
 */
const SEPTEMBER_HISTORY_PATTERN: ReadonlyArray<readonly [ISODate, number | null]> = [
  ['2026-09-01', 7], ['2026-09-02', 7], ['2026-09-03', 5], ['2026-09-04', 0],
  ['2026-09-05', 7], ['2026-09-06', 7], ['2026-09-07', 4], ['2026-09-08', null],
  ['2026-09-09', 7], ['2026-09-10', 7], ['2026-09-11', 3], ['2026-09-12', 0],
  ['2026-09-13', 7], ['2026-09-14', 7], ['2026-09-15', 5], ['2026-09-16', null],
  ['2026-09-17', 7], ['2026-09-18', 7], ['2026-09-19', 4], ['2026-09-20', 0],
  ['2026-09-21', null],
]

/** 为打卡日历生成 9 月固定演示历史；今天和未来日期永远不预填。 */
export function buildHistory(today: Date, fromISO: ISODate = SIMULATED_HISTORY_START): CheckIn[] {
  const todayISO = toISODate(today)
  return SEPTEMBER_HISTORY_PATTERN
    .filter(([date, doneCount]) => doneCount !== null && date >= fromISO && date < todayISO)
    .flatMap(([date, doneCount]) => FEEDING_HISTORY_TASKS.map(([taskId, time], index) => {
      const status: CheckInStatus = doneCount === 7
        ? 'done'
        : doneCount === 0
          ? 'missed'
          : index < doneCount!
            ? 'done'
            : index === doneCount
              ? 'difficulty'
              : 'missed'
      const recorded = status === 'done' || status === 'difficulty'
      return {
        id: `ci-demo-${date}-${taskId}`,
        patientId: PATIENT_ID,
        taskId,
        date,
        status,
        at: recorded ? new Date(`${date}T${time}:00+08:00`).toISOString() : undefined,
        note: status === 'difficulty' ? '演示记录：执行时遇到困难。' : undefined,
      }
    }))
}

/** 这批固定历史只属于王萍演示病例，其他患者重置时不得跨患者复用任务。 */
export function buildHistoryForPatient(
  today: Date,
  patientId: string,
  fromISO: ISODate = SIMULATED_HISTORY_START,
): CheckIn[] {
  return patientId === PATIENT_ID ? buildHistory(today, fromISO) : []
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
 * 按每日任务模板的 07:00 与 20:30 各测一次，铺最近七天，加上今天早晨一条。
 * 全部在安全范围内：超标那一条留给现场当场录入，才有「录入 → 预警」的过程。
 * 其中一条标记为康复护士测量，用于在明细中区分记录来源。
 */
export function buildVitals(today: Date): VitalRecord[] {
  const values = [
    [[128, 78], [132, 80]],
    [[125, 76], [130, 79]],
    [[127, 77], [134, 82]],
    [[123, 75], [129, 78]],
    [[126, 77], [131, 80]],
    [[124, 76], [128, 79]],
    [[122, 74]],
  ] as const

  return values.flatMap((dayValues, dayIndex) => {
    const date = new Date(today)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - dayIndex))
    const dateISO = toISODate(date)
    return dayValues.map(([systolic, diastolic], timeIndex) => {
      const time = timeIndex === 0 ? '07:00' : '20:30'
      return {
        id: `vital-demo-d${6 - dayIndex}-${timeIndex === 0 ? 'am' : 'pm'}`,
        patientId: PATIENT_ID,
        date: dateISO,
        time,
        systolic,
        diastolic,
        by: dayIndex === 3 && timeIndex === 0 ? '康复护士' as const : '家属' as const,
        at: new Date(`${dateISO}T${time}:00+08:00`).toISOString(),
      }
    })
  })
}

/** 三次固定的互动游戏历史，供初次演示与“重置演示”恢复使用。 */
export function buildGameStageHistory(today: Date, patientId = PATIENT_ID): GameStageRecord[] {
  const actions = [
    ['march-warmup', '踏步热身'], ['side-step', '左右侧步'],
    ['walking-transition', '前后侧步'], ['arm-step', '上肢拍手'],
    ['arm-cross', '上肢拍肩'], ['reach-march', '上肢交替拍手肘'],
  ] as const
  const durationSets = [[128, 112, 134, 96, 103, 141], [121, 106, 126, 91, 98, 132], [116, 101, 118, 87, 94, 124]]
  return durationSets.flatMap((durations, dayIndex) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (3 - dayIndex))
    const dateISO = toISODate(date)
    return actions.map(([actionId, actionTitle], actionIndex) => {
      const start = new Date(`${dateISO}T16:${String(actionIndex * 3).padStart(2, '0')}:00+08:00`)
      const durationSec = durations[actionIndex]
      return {
        id: `game-demo-${dayIndex}-${actionIndex}`,
        patientId,
        sessionId: `game-demo-${dayIndex}`,
        taskId: 'task-cognition',
        date: dateISO,
        actionId,
        actionTitle,
        actionIndex,
        startedAt: start.toISOString(),
        completedAt: new Date(start.getTime() + durationSec * 1000).toISOString(),
        durationSec,
        pauseCount: 0,
        retryCount: dayIndex === 0 && actionIndex === 2 ? 1 : 0,
        status: 'completed' as const,
      }
    })
  })
}
