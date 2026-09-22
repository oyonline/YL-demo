import { describe, expect, it } from 'vitest'
import { SEPTEMBER_FEEDING_TASKS } from '../src/data/feedingPlan.ts'
import { buildHistory, buildHistoryForPatient } from '../src/data/seed.ts'

const records = buildHistory(new Date('2026-09-22T12:00:00+08:00'))

function forDate(date: string) {
  return records.filter((record) => record.date === date)
}

describe('9 月历史打卡演示数据', () => {
  it('覆盖七项新计划且不预填今天', () => {
    expect(new Set(records.map((record) => record.taskId))).toEqual(
      new Set(SEPTEMBER_FEEDING_TASKS.map((task) => task.id)),
    )
    expect(forDate('2026-09-22')).toEqual([])
  })

  it('包含全部完成、部分完成、全部未完成和整日无记录', () => {
    expect(forDate('2026-09-01').map((record) => record.status)).toEqual(Array(7).fill('done'))
    expect(forDate('2026-09-03').map((record) => record.status)).toEqual([
      'done', 'done', 'done', 'done', 'done', 'difficulty', 'missed',
    ])
    expect(forDate('2026-09-04').map((record) => record.status)).toEqual(Array(7).fill('missed'))
    expect(forDate('2026-09-08')).toEqual([])
  })

  it('按起始日期裁剪，供重置和局部演示复用', () => {
    const clipped = buildHistory(new Date('2026-09-22T12:00:00+08:00'), '2026-09-17')
    expect(clipped.every((record) => record.date >= '2026-09-17')).toBe(true)
    expect(clipped.some((record) => record.date === '2026-09-20')).toBe(true)
  })

  it('其他患者重置时不会得到王萍的任务与记录 ID', () => {
    expect(buildHistoryForPatient(
      new Date('2026-09-22T12:00:00+08:00'),
      'p-zhao-grandpa',
    )).toEqual([])
  })
})
