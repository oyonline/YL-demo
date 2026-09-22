import { PATIENT_ID, taskDefs } from './seed'
import type { TaskDef } from './types'

export const FEEDING_PLAN_START = '2026-09-01'
export const FEEDING_PLAN_END = '2026-09-28'
export const CURRENT_PLAN_START = '2026-09-29'

/** 2026-09-22 用户提供并要求直接启用的 9 月鼻饲饮食安排。 */
export const SEPTEMBER_FEEDING_TASKS: TaskDef[] = [
  {
    id: 'task-feed-meal-1', patientId: PATIENT_ID, kind: 'record',
    title: '正餐1', scheduledTime: '07:00', instruction: '山药瘦肉粥', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
  {
    id: 'task-feed-medication', patientId: PATIENT_ID, kind: 'medication',
    title: '鼻饲后给予降压药', scheduledTime: '07:30', instruction: '做好冲管', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
  {
    id: 'task-feed-meal-2', patientId: PATIENT_ID, kind: 'record',
    title: '正餐2', scheduledTime: '11:00', instruction: '菠菜鱼片粥', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
  {
    id: 'task-feed-snack-1', patientId: PATIENT_ID, kind: 'record',
    title: '辅食加餐1', scheduledTime: '13:00', instruction: '过滤果蔬汁', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
  {
    id: 'task-feed-meal-3', patientId: PATIENT_ID, kind: 'record',
    title: '正餐3', scheduledTime: '15:00', instruction: '胡萝卜鸡肉粥', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
  {
    id: 'task-feed-snack-2', patientId: PATIENT_ID, kind: 'record',
    title: '辅食加餐2', scheduledTime: '17:00', instruction: '过滤果蔬汁', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
  {
    id: 'task-feed-meal-4', patientId: PATIENT_ID, kind: 'record',
    title: '正餐4', scheduledTime: '19:00', instruction: '去油南瓜排骨粥', cautions: [],
    origin: 'user_provided', activeFrom: FEEDING_PLAN_START, activeTo: FEEDING_PLAN_END,
  },
]

/** 数据库保存完整版本链；页面再按日期选出当天生效的 7 项。 */
export const TASK_SCHEDULE: TaskDef[] = [
  ...SEPTEMBER_FEEDING_TASKS,
  ...taskDefs.map((task) => ({ ...task, activeFrom: CURRENT_PLAN_START, activeTo: undefined })),
]
