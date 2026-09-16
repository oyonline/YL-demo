import { describe, expect, it } from 'vitest'
import {
  EXOSKELETON_ACTIONS,
  createExoskeletonSession,
  transitionExoskeletonSession,
  type ExoskeletonSession,
} from '../src/features/exoskeleton/session.ts'

function dispatch(state: ExoskeletonSession, type: 'START' | 'ACTION_DONE' | 'CONTINUE' | 'STOP') {
  return transitionExoskeletonSession(state, { type })
}

describe('外骨骼五步训练状态机', () => {
  it('动作顺序固定为本轮确认的五项', () => {
    expect(EXOSKELETON_ACTIONS.map((action) => action.title)).toEqual([
      '踏步热身', '左右侧步', '步态衔接', '上肢开合配合踏步', '交叉与伸臂协同',
    ])
  })

  it('只有第五个动作确认后才产生一次今日打卡', () => {
    let state = dispatch(createExoskeletonSession(), 'START').state
    expect(state.phase).toBe('training')

    for (let index = 0; index < EXOSKELETON_ACTIONS.length; index += 1) {
      const completed = dispatch(state, 'ACTION_DONE')
      expect(completed.state.phase).toBe('celebrating')
      expect(completed.state.completedCount).toBe(index + 1)

      if (index < EXOSKELETON_ACTIONS.length - 1) {
        expect(completed.effect).toBeUndefined()
      } else {
        expect(completed.effect).toBe('MARK_TODAY_DONE')
      }

      const continued = dispatch(completed.state, 'CONTINUE')
      if (index < EXOSKELETON_ACTIONS.length - 1) {
        expect(continued.effect).toBeUndefined()
        expect(continued.state.phase).toBe('training')
        expect(continued.state.actionIndex).toBe(index + 1)
      } else {
        expect(continued.effect).toBeUndefined()
        expect(continued.state.phase).toBe('complete')
      }
      state = continued.state
    }

    const duplicate = dispatch(state, 'CONTINUE')
    expect(duplicate.effect).toBeUndefined()
    expect(duplicate.state).toBe(state)
  })

  it('快速重复点击“我完成了”不会跳过动作', () => {
    const training = dispatch(createExoskeletonSession(), 'START').state
    const firstClick = dispatch(training, 'ACTION_DONE').state
    const secondClick = dispatch(firstClick, 'ACTION_DONE').state

    expect(secondClick).toBe(firstClick)
    expect(secondClick.actionIndex).toBe(0)
    expect(secondClick.completedCount).toBe(1)
  })

  it('第五步完成提示阶段既不重复打卡，也不能再改成中止', () => {
    let state = dispatch(createExoskeletonSession(), 'START').state
    for (let index = 0; index < EXOSKELETON_ACTIONS.length - 1; index += 1) {
      state = dispatch(state, 'ACTION_DONE').state
      state = dispatch(state, 'CONTINUE').state
    }

    const fifthClick = dispatch(state, 'ACTION_DONE')
    expect(fifthClick.effect).toBe('MARK_TODAY_DONE')
    expect(fifthClick.state.phase).toBe('celebrating')

    const duplicate = dispatch(fifthClick.state, 'ACTION_DONE')
    expect(duplicate.effect).toBeUndefined()
    expect(duplicate.state).toBe(fifthClick.state)

    const stop = dispatch(fifthClick.state, 'STOP')
    expect(stop.effect).toBeUndefined()
    expect(stop.state).toBe(fifthClick.state)
  })

  it('中途停止不打卡，并保留已完成数量用于说明', () => {
    let state = dispatch(createExoskeletonSession(), 'START').state
    state = dispatch(state, 'ACTION_DONE').state
    state = dispatch(state, 'CONTINUE').state
    const stopped = dispatch(state, 'STOP')

    expect(stopped.effect).toBeUndefined()
    expect(stopped.state.phase).toBe('stopped')
    expect(stopped.state.completedCount).toBe(1)
    expect(stopped.state.checkInIssued).toBe(false)
  })

  it('服务端已有完成记录时直接进入结果页且不重复提交', () => {
    const state = createExoskeletonSession(true)
    expect(state.phase).toBe('complete')
    expect(state.completedCount).toBe(5)
    expect(state.checkInIssued).toBe(true)
    expect(dispatch(state, 'ACTION_DONE').effect).toBeUndefined()
  })
})
