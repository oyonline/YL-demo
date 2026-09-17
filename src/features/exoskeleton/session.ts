export const EXOSKELETON_TASK_ID = 'task-cognition'

export interface ExoskeletonAction {
  id: 'march-warmup' | 'side-step' | 'walking-transition' | 'arm-step' | 'cross-reach'
  title: string
  shortTitle: string
  direction: string
  instruction: string
  videoSrc: string
  animatedSrc?: string
  stillSrc: string
}

/**
 * 动作名称、顺序和素材均按真人参考视频的连续时间段整理。
 * 页面只说明动作方向，不生成次数、速度、幅度或质量评分等医疗训练参数。
 */
export const EXOSKELETON_ACTIONS: readonly ExoskeletonAction[] = [
  {
    id: 'march-warmup',
    title: '踏步热身',
    shortTitle: '踏步',
    direction: '↑',
    instruction: '跟随动态角色交替抬腿踏步，配合节奏完成热身。',
    videoSrc: '/exoskeleton/reference-step-1.mp4',
    animatedSrc: '/exoskeleton/march-game-v2.png',
    stillSrc: '/exoskeleton/march-game-poster-v2.jpg',
  },
  {
    id: 'side-step',
    title: '左右侧步',
    shortTitle: '侧步',
    direction: '↔',
    instruction: '跟随真人示范向左右两侧交替迈步，再回到中间站稳。',
    videoSrc: '/exoskeleton/reference-step-2.mp4',
    stillSrc: '/exoskeleton/reference-step-2.jpg',
  },
  {
    id: 'walking-transition',
    title: '步态衔接',
    shortTitle: '衔接',
    direction: '↗',
    instruction: '继续跟随前半段示范完成移动与踏步衔接，保持动作连贯。',
    videoSrc: '/exoskeleton/reference-step-3.mp4',
    stillSrc: '/exoskeleton/reference-step-3.jpg',
  },
  {
    id: 'arm-step',
    title: '上肢开合配合踏步',
    shortTitle: '开合',
    direction: '↔',
    instruction: '跟随后半段示范，在踏步过程中完成双臂开合配合。',
    videoSrc: '/exoskeleton/reference-step-4.mp4',
    stillSrc: '/exoskeleton/reference-step-4.jpg',
  },
  {
    id: 'cross-reach',
    title: '交叉与伸臂协同',
    shortTitle: '协同',
    direction: '×',
    instruction: '跟随真人示范完成双臂交叉、交替伸臂与抬腿协同动作。',
    videoSrc: '/exoskeleton/reference-step-5.mp4',
    stillSrc: '/exoskeleton/reference-step-5.jpg',
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
