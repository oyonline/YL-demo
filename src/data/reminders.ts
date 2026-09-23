import type { ClockTime } from './types'

/**
 * 主动消息提醒 —— 文案逐条取自甲方《模块3.3 主动消息提醒（单端修订版）》
 * （2026-08-28 修订），本项目未改写。
 *
 * 该文档自己写明：「应急指导类内容已全部删除，系统异常预警仅做通知和
 * 提示联系康复师/拨打 120，不提供应急医疗指导」—— 与本项目一贯边界一致，
 * 因此可以原样采用，不必再收敛措辞。
 *
 * 任务提醒与当前生效计划保持一致；甲方原表里的饮水、口腔护理、
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
    text: '☀️ 李英早上好～该给王萍量血压啦。量完把数值录进来，小安帮您记着。',
  },
  ...(['10:30', '12:30', '14:30', '16:30', '18:30'] as const).map((time) => ({
    id: `rm-feed-${time.replace(':', '')}`,
    time,
    text: `🥣 ${time} 进食提醒：请按已确认的鼻饲方案操作；出现腹胀或腹泻立即停止并联系专业人员。`,
  })),
  {
    id: 'rm-bp-afternoon',
    time: '15:00',
    taskId: 'task-vitals-afternoon',
    text: '15:00 血压测量时间到了，请测量并记录。',
  },
  {
    id: 'rm-cognition',
    time: '15:30',
    taskId: 'task-cognition',
    text: '🦿 15:30 智能辅具助力行走时间到了，请先完成设备与环境检查，再跟随动态图完成下肢步态与上肢协同六个训练阶段，全程在旁保护。',
  },
  {
    id: 'rm-skin',
    time: '16:30',
    taskId: 'task-skin',
    text: '🎵 16:30 非遗踏鼓时间到了，请充分热身，建议训练 10 分钟。',
  },
  {
    id: 'rm-bp-night',
    time: '20:30',
    taskId: 'task-vitals-night',
    highlight: true,
    text: '🌙 准备睡觉啦，睡前再给王萍量一次血压，录进来就安心了。',
  },
]

/**
 * 血压超标时的触发式提醒（甲方原表第 14 条，标★）。
 * 只在今日确实出现过超标记录时才进入提醒列表 —— 不是预先摆在那里的假记录。
 */
export function abnormalBpReminder(systolic: number, diastolic: number): string {
  return `⚠️ 王萍本次血压为 ${systolic}/${diastolic} mmHg，超出安全范围（90–139 / 60–89）。请让她安静坐下休息，不要自行加药，10 分钟后复测一次。此预警已同步通知康康·资深护理员，我们会尽快联系您。`
}
