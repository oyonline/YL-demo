export const EXOSKELETON_TASK_ID = 'task-cognition'

export interface ExoskeletonAction {
  id: 'squat' | 'walk-forward' | 'walk-backward' | 'step-left' | 'step-right'
  title: string
  shortTitle: string
  direction: string
  instruction: string
  gifSrc: string
  stillSrc: string
}

/**
 * 动作名称与顺序来自本轮已确认需求。
 * 页面只说明动作方向，不生成次数、速度、幅度或质量评分等医疗训练参数。
 */
export const EXOSKELETON_ACTIONS: readonly ExoskeletonAction[] = [
  {
    id: 'squat',
    title: '蹲起',
    shortTitle: '蹲起',
    direction: '↕',
    instruction: '跟随画面完成蹲下与起身。',
    gifSrc: '/exoskeleton/squat.gif',
    stillSrc: '/exoskeleton/squat.png',
  },
  {
    id: 'walk-forward',
    title: '向前走',
    shortTitle: '向前',
    direction: '↑',
    instruction: '跟随画面向前行走。',
    gifSrc: '/exoskeleton/walk-forward.gif',
    stillSrc: '/exoskeleton/walk-forward.png',
  },
  {
    id: 'walk-backward',
    title: '后撤一步',
    shortTitle: '后撤',
    direction: '↓',
    instruction: '站稳后向后迈一步，再回到原位。',
    gifSrc: '/exoskeleton/back-step.gif',
    stillSrc: '/exoskeleton/back-step.png',
  },
  {
    id: 'step-left',
    title: '向左走',
    shortTitle: '向左',
    direction: '←',
    instruction: '跟随画面向左侧行走。',
    gifSrc: '/exoskeleton/step-left.gif',
    stillSrc: '/exoskeleton/step-left.png',
  },
  {
    id: 'step-right',
    title: '向右走',
    shortTitle: '向右',
    direction: '→',
    instruction: '跟随画面向右侧行走。',
    gifSrc: '/exoskeleton/step-right.gif',
    stillSrc: '/exoskeleton/step-right.png',
  },
] as const

export type ExoskeletonPhase = 'ready' | 'training' | 'celebrating' | 'complete' | 'stopped'

export interface ExoskeletonSession {
  phase: ExoskeletonPhase
  actionIndex: number
  completedCount: number
  checkInIssued: boolean
}

export type ExoskeletonEvent =
  | { type: 'START' }
  | { type: 'ACTION_DONE' }
  | { type: 'CONTINUE' }
  | { type: 'STOP' }
  | { type: 'SYNC_DONE' }

export interface ExoskeletonTransition {
  state: ExoskeletonSession
  effect?: 'MARK_TODAY_DONE'
}

export function createExoskeletonSession(alreadyComplete = false): ExoskeletonSession {
  if (alreadyComplete) {
    return {
      phase: 'complete',
      actionIndex: EXOSKELETON_ACTIONS.length - 1,
      completedCount: EXOSKELETON_ACTIONS.length,
      checkInIssued: true,
    }
  }

  return { phase: 'ready', actionIndex: 0, completedCount: 0, checkInIssued: false }
}

/**
 * 纯状态转换供页面和测试共用：
 * - GIF 播放本身不会推进进度；
 * - 每次 ACTION_DONE 只进入一次完成提示；
 * - 第 5 次点击“我完成了”时才产生打卡副作用。
 */
export function transitionExoskeletonSession(
  current: ExoskeletonSession,
  event: ExoskeletonEvent,
): ExoskeletonTransition {
  if (event.type === 'SYNC_DONE') {
    return { state: createExoskeletonSession(true) }
  }

  if (event.type === 'STOP') {
    if (current.phase !== 'training') return { state: current }
    return { state: { ...current, phase: 'stopped' } }
  }

  if (event.type === 'START') {
    if (current.phase !== 'ready') return { state: current }
    return { state: { ...current, phase: 'training' } }
  }

  if (event.type === 'ACTION_DONE') {
    if (current.phase !== 'training' || current.completedCount !== current.actionIndex) {
      return { state: current }
    }
    const completedCount = current.actionIndex + 1
    const finishedAllActions = completedCount === EXOSKELETON_ACTIONS.length
    return {
      state: {
        ...current,
        phase: 'celebrating',
        completedCount,
        checkInIssued: finishedAllActions || current.checkInIssued,
      },
      effect: finishedAllActions && !current.checkInIssued ? 'MARK_TODAY_DONE' : undefined,
    }
  }

  if (event.type === 'CONTINUE') {
    if (current.phase !== 'celebrating') return { state: current }

    if (current.completedCount === EXOSKELETON_ACTIONS.length) {
      return { state: { ...current, phase: 'complete' } }
    }

    return {
      state: {
        ...current,
        phase: 'training',
        actionIndex: current.actionIndex + 1,
      },
    }
  }

  return { state: current }
}
