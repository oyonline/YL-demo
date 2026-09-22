import { describe, expect, it } from 'vitest'
import {
  CURRENT_PLAN_START,
  FEEDING_PLAN_END,
  FEEDING_PLAN_START,
  SEPTEMBER_FEEDING_TASKS,
  TASK_SCHEDULE,
} from '../src/data/feedingPlan.ts'
import { tasksForDate } from '../src/data/taskSchedule.ts'

describe('日期分段康复计划', () => {
  it('9 月 1 日至 28 日每天使用用户提供的七项鼻饲饮食计划', () => {
    expect(tasksForDate(TASK_SCHEDULE, FEEDING_PLAN_START)).toEqual(SEPTEMBER_FEEDING_TASKS)
    expect(tasksForDate(TASK_SCHEDULE, FEEDING_PLAN_END)).toEqual(SEPTEMBER_FEEDING_TASKS)
    expect(SEPTEMBER_FEEDING_TASKS.map((task) => [task.scheduledTime, task.title, task.instruction])).toEqual([
      ['07:00', '正餐1', '山药瘦肉粥'],
      ['07:30', '鼻饲后给予降压药', '做好冲管'],
      ['11:00', '正餐2', '菠菜鱼片粥'],
      ['13:00', '辅食加餐1', '过滤果蔬汁'],
      ['15:00', '正餐3', '胡萝卜鸡肉粥'],
      ['17:00', '辅食加餐2', '过滤果蔬汁'],
      ['19:00', '正餐4', '去油南瓜排骨粥'],
    ])
    expect(SEPTEMBER_FEEDING_TASKS.every((task) => task.origin === 'user_provided')).toBe(true)
  })

  it('9 月 29 日起恢复原有七项训练计划', () => {
    const current = tasksForDate(TASK_SCHEDULE, CURRENT_PLAN_START)
    expect(current).toHaveLength(7)
    expect(current.map((task) => task.id)).toContain('task-cognition')
    expect(current.map((task) => task.id)).not.toContain('task-feed-meal-1')
  })

  it('计划开始日前没有安排', () => {
    expect(tasksForDate(TASK_SCHEDULE, '2026-08-31')).toEqual([])
  })
})
