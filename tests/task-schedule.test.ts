import { describe, expect, it } from 'vitest'
import {
  CURRENT_PLAN_START,
  FEEDING_PLAN_END,
  FEEDING_PLAN_START,
  FEEDING_TASKS,
  TASK_SCHEDULE,
} from '../src/data/feedingPlan.ts'
import { tasksForDate } from '../src/data/taskSchedule.ts'

describe('日期分段康复计划', () => {
  it('9 月 27 日至 11 月 26 日使用六项饮食计划', () => {
    expect(tasksForDate(TASK_SCHEDULE, FEEDING_PLAN_START)).toEqual(FEEDING_TASKS)
    expect(tasksForDate(TASK_SCHEDULE, '2026-09-27')).toEqual(FEEDING_TASKS)
    expect(tasksForDate(TASK_SCHEDULE, FEEDING_PLAN_END)).toEqual(FEEDING_TASKS)
    expect(FEEDING_TASKS.map((task) => [task.scheduledTime, task.title, task.instruction])).toEqual([
      ['08:00', '第一餐正餐', '山药瘦肉粥'],
      ['12:00', '第二餐正餐', '菠菜鱼片粥'],
      ['14:00', '第一餐辅餐', '过滤果蔬汁'],
      ['16:00', '第三餐正餐', '胡萝卜鸡肉粥'],
      ['18:00', '第二餐辅餐', '过滤果蔬汁'],
      ['20:00', '第四餐正餐', '去油南瓜排骨粥'],
    ])
    expect(FEEDING_TASKS.map((task) => task.id)).not.toContain('task-feed-medication')
  })

  it('11 月 27 日起使用五项康复计划', () => {
    const current = tasksForDate(TASK_SCHEDULE, CURRENT_PLAN_START)
    expect(current.map((task) => [task.scheduledTime, task.title])).toEqual([
      ['07:00', '晨起测量血压'],
      ['15:00', '血压测量'],
      ['15:30', '智能辅具助力行走'],
      ['16:30', '非遗踏鼓'],
      ['20:30', '睡前测量血压'],
    ])
    expect(current.map((task) => task.id)).not.toContain('task-feed-meal-1')
  })

  it('9 月 27 日前没有计划', () => {
    expect(tasksForDate(TASK_SCHEDULE, '2026-08-31')).toEqual([])
    expect(tasksForDate(TASK_SCHEDULE, '2026-09-01')).toEqual([])
    expect(tasksForDate(TASK_SCHEDULE, '2026-09-26')).toEqual([])
  })
})
