import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DAILY_REMINDERS } from '../src/data/reminders.ts'
import { taskDefs } from '../src/data/seed.ts'
import { EXOSKELETON_ACTIONS } from '../src/features/exoskeleton/session.ts'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('外骨骼动作素材', () => {
  it('五个视频阶段各有独立的本地 MP4 和静态降级图', () => {
    expect(EXOSKELETON_ACTIONS).toHaveLength(5)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.id)).size).toBe(5)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.videoSrc)).size).toBe(5)
    expect(new Set(EXOSKELETON_ACTIONS.map((action) => action.stillSrc)).size).toBe(5)

    for (const action of EXOSKELETON_ACTIONS) {
      expect(action.videoSrc).toMatch(/^\/exoskeleton\/[a-z0-9-]+\.mp4$/)
      expect(action.stillSrc).toMatch(/^\/exoskeleton\/[a-z0-9-]+\.jpg$/)
      expect(action.videoSrc).not.toMatch(/^https?:|^data:|^blob:/)

      const videoPath = join(projectRoot, 'public', action.videoSrc)
      const stillPath = join(projectRoot, 'public', action.stillSrc)
      expect(statSync(videoPath).size).toBeGreaterThan(1_000)
      expect(statSync(stillPath).size).toBeGreaterThan(1_000)
      expect(readFileSync(videoPath).subarray(4, 8).toString('ascii')).toBe('ftyp')
      expect([...readFileSync(stillPath).subarray(0, 3)]).toEqual([255, 216, 255])
    }
  })

  it('计划与提醒都已更新为五动作口径', () => {
    const task = taskDefs.find((item) => item.id === 'task-cognition')
    const reminder = DAILY_REMINDERS.find((item) => item.taskId === 'task-cognition')

    expect(task?.instruction).toContain('踏步、侧步、步态衔接及上肢协同五个阶段')
    expect(task?.reps).toContain('共 5 个阶段')
    expect(reminder?.text).toContain('五个训练阶段')
    expect(`${task?.instruction}${task?.reps}${reminder?.text}`).not.toMatch(/四步|资料未提供/)
  })
})
