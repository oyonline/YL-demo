import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DAILY_REMINDERS } from '../src/data/reminders.ts'
import { taskDefs } from '../src/data/seed.ts'
import { EXOSKELETON_ACTIONS } from '../src/features/exoskeleton/session.ts'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('外骨骼动作素材', () => {
  it('五个动作各有独立的本地 GIF 和静态降级图', () => {
    expect(EXOSKELETON_ACTIONS).toHaveLength(5)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.id)).size).toBe(5)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.gifSrc)).size).toBe(5)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.stillSrc)).size).toBe(5)

    for (const action of EXOSKELETON_ACTIONS) {
      expect(action.gifSrc).toMatch(/^\/exoskeleton\/[a-z-]+\.gif$/)
      expect(action.stillSrc).toMatch(/^\/exoskeleton\/[a-z-]+\.png$/)
      expect(action.gifSrc).not.toMatch(/^https?:|^data:|^blob:/)

      const gifPath = join(projectRoot, 'public', action.gifSrc)
      const stillPath = join(projectRoot, 'public', action.stillSrc)
      expect(statSync(gifPath).size).toBeGreaterThan(1_000)
      expect(statSync(stillPath).size).toBeGreaterThan(1_000)
      expect(readFileSync(gifPath).subarray(0, 6).toString('ascii')).toMatch(/^GIF8[79]a$/)
      expect([...readFileSync(stillPath).subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    }
  })

  it('计划与提醒都已更新为五动作口径', () => {
    const task = taskDefs.find((item) => item.id === 'task-cognition')
    const reminder = DAILY_REMINDERS.find((item) => item.taskId === 'task-cognition')

    expect(task?.instruction).toContain('蹲起、向前走、后撤一步、向左走、向右走五个动作')
    expect(task?.reps).toContain('共 5 个动作')
    expect(reminder?.text).toContain('五个动作')
    expect(`${task?.instruction}${task?.reps}${reminder?.text}`).not.toMatch(/四步|资料未提供/)
  })
})
