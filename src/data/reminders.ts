import type { ClockTime } from './types'

/**
 * 主动消息提醒 —— 文案逐条取自甲方《模块3.3 主动消息提醒（单端修订版）》
 * （2026-08-28 修订），本项目未改写。
 *
 * 该文档自己写明：「应急指导类内容已全部删除，系统异常预警仅做通知和
 * 提示联系康复师/拨打 120，不提供应急医疗指导」—— 与本项目一贯边界一致，
 * 因此可以原样采用，不必再收敛措辞。
 *
 * 只收录与今日 7 项任务对应的定时提醒；甲方原表里的饮水、口腔护理、
 * 天气、节日、周小结等条目与当前演示任务无对应关系，不放进来充数。
 */

export interface ReminderDef {
  id: string
  time: ClockTime
  text: string
  /** 对应的今日任务，用于在提醒记录里标出「已完成 / 未完成」 */
  taskId?: string
  /** 甲方标★的演示重点 */
  highlight?: boolean
}

export const DAILY_REMINDERS: ReminderDef[] = [
  {
    id: 'rm-bp-morning',
    time: '07:00',
    taskId: 'task-vitals-morning',
    text: '☀️ 李英女士早上好～该给王萍奶奶量血压啦。量完把数值录进来，小安帮您记着。',
  },
  {
    id: 'rm-med',
    time: '07:30',
    taskId: 'task-med-morning',
    text: '💊 该给王萍奶奶服用降压药了，请严格按医嘱执行，完成后点一下「已服药」。',
  },
  {
    id: 'rm-training',
    time: '08:00',
    taskId: 'task-lower-limb',
    text: '👄 08:00 吞咽训练时间到了，请按计划完成；如有明显不适立即停止并联系康康·资深护理员。',
  },
  {
    id: 'rm-swallow',
    time: '08:30',
    taskId: 'task-swallow',
    text: '🥣 08:30 鼻饲喂食时间到了。请按 3-1-3 检查法与鼻饲流程操作，结束后保持体位 30～60 分钟；腹胀或腹泻时立即停止。',
  },
  ...(['10:30', '12:30', '14:30', '16:30', '18:30'] as const).map((time) => ({
    id: `rm-feed-${time.replace(':', '')}`,
    time,
    text: `🥣 ${time} 进食提醒：请按已确认的鼻饲方案操作；出现腹胀或腹泻立即停止并联系专业人员。`,
  })),
  {
    id: 'rm-cognition',
    time: '16:00',
    taskId: 'task-cognition',
    text: '🦿 16:00 外骨骼助力行走时间到了，请先完成设备与环境检查，再依次完成蹲起、向前走、后撤一步、向左走、向右走五个动作，全程在旁保护。',
  },
  {
    id: 'rm-skin',
    time: '17:00',
    taskId: 'task-skin',
    text: '🎵 17:00 音乐律动操时间到了，请充分热身，建议训练 10 分钟。',
  },
  {
    id: 'rm-bp-night',
    time: '20:30',
    taskId: 'task-vitals-night',
    highlight: true,
    text: '🌙 准备睡觉啦，睡前再给王萍奶奶量一次血压，录进来就安心了。',
  },
]

/**
 * 血压超标时的触发式提醒（甲方原表第 14 条，标★）。
 * 只在今日确实出现过超标记录时才进入提醒列表 —— 不是预先摆在那里的假记录。
 */
export function abnormalBpReminder(systolic: number, diastolic: number): string {
  return `⚠️ 王萍奶奶本次血压为 ${systolic}/${diastolic} mmHg，超出安全范围（90–139 / 60–89）。请让奶奶安静坐下休息，不要自行加药，10 分钟后复测一次。此预警已同步通知康康·资深护理员，我们会尽快联系您。`
}
