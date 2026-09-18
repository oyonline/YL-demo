import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DAILY_REMINDERS } from '../src/data/reminders.ts'
import { taskDefs } from '../src/data/seed.ts'
import { EXOSKELETON_ACTIONS } from '../src/features/exoskeleton/session.ts'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('外骨骼动作素材', () => {
  it('六个训练阶段各有独立的本地动态图和静态降级图', () => {
    expect(EXOSKELETON_ACTIONS).toHaveLength(6)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.id)).size).toBe(6)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.animatedSrc)).size).toBe(6)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.stillSrc)).size).toBe(6)

    for (const action of EXOSKELETON_ACTIONS) {
      expect(action.animatedSrc).toMatch(/^\/exoskeleton\/[a-z0-9-]+\.png$/)
      expect(action.stillSrc).toMatch(/^\/exoskeleton\/[a-z0-9-]+\.jpg$/)
      expect(action.animatedSrc).not.toMatch(/^https?:|^data:|^blob:/)

      const animatedPath = join(projectRoot, 'public', action.animatedSrc!)
      const stillPath = join(projectRoot, 'public', action.stillSrc)
      expect(statSync(animatedPath).size).toBeGreaterThan(1_000)
      expect(statSync(stillPath).size).toBeGreaterThan(1_000)
      expect([...readFileSync(animatedPath).subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
      expect([...readFileSync(stillPath).subarray(0, 3)]).toEqual([255, 216, 255])
    }
  })

  it('计划与提醒都已更新为六阶段动态图口径', () => {
    const task = taskDefs.find((item) => item.id === 'task-cognition')
    const reminder = DAILY_REMINDERS.find((item) => item.taskId === 'task-cognition')

    expect(task?.instruction).toContain('六个阶段')
    expect(task?.instruction).toContain('跟随动态图')
    expect(task?.reps).toContain('共 6 个阶段')
    expect(reminder?.text).toContain('六个训练阶段')
    expect(`${task?.instruction}${task?.reps}${reminder?.text}`).not.toMatch(/四步|资料未提供/)
  })
})
