import { describe, expect, it } from 'vitest'
import { buildHistory, buildHistoryForPatient } from '../src/data/seed.ts'

describe('9 月历史打卡数据', () => {
  it('9 月 1 日至 26 日不生成演示打卡', () => {
    expect(buildHistory(new Date('2026-09-27T12:00:00+08:00'))).toEqual([])
    expect(buildHistory(new Date('2026-11-27T12:00:00+08:00'), '2026-09-01')).toEqual([])
  })

  it('重置患者时也不会补入历史打卡', () => {
    expect(buildHistoryForPatient(
      new Date('2026-09-27T12:00:00+08:00'),
      'p-001',
    )).toEqual([])
    expect(buildHistoryForPatient(
      new Date('2026-09-27T12:00:00+08:00'),
      'p-zhao-grandpa',
    )).toEqual([])
  })
})
