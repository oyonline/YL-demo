export const EXOSKELETON_TASK_ID = 'task-cognition'

export interface ExoskeletonAction {
  id: 'march-warmup' | 'side-step' | 'walking-transition' | 'arm-step' | 'arm-cross' | 'reach-march'
  title: string
  shortTitle: string
  direction: string
  instruction: string
  encouragement: string
  videoSrc?: string
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
    instruction: '跟随角色交替抬腿踏步，配合节奏热身。',
    encouragement: '真棒！热身做得很到位，继续加油！',
    videoSrc: '/videos/march-cartoon-refined-v1.mp4',
    stillSrc: '/exoskeleton/march-cartoon-refined-poster-v1.jpg',
  },
  {
    id: 'side-step',
    title: '左右侧步',
    shortTitle: '侧步',
    direction: '↔',
    instruction: '左右横向小步移动，保持身体平衡。',
    encouragement: '做得很好，节奏越来越稳啦！',
    animatedSrc: '/exoskeleton/side-step-v9.png',
    stillSrc: '/exoskeleton/side-step-poster-v9.jpg',
  },
  {
    id: 'walking-transition',
    title: '前后侧步',
    shortTitle: '前后步',
    direction: '↕',
    instruction: '小幅度前后移步，脚下踩稳，注意安全。',
    encouragement: '太出色了！动作越来越熟练！',
    animatedSrc: '/exoskeleton/gait-transition-v1.png',
    stillSrc: '/exoskeleton/gait-transition-poster-v1.jpg',
  },
  {
    id: 'arm-step',
    title: '上肢拍手',
    shortTitle: '拍手',
    direction: '⇆',
    instruction: '双臂抬起，双手对拍，活动关节。',
    encouragement: '非常厉害，保持住这个状态！',
    animatedSrc: '/exoskeleton/arm-cross-v1.png',
    stillSrc: '/exoskeleton/arm-cross-poster-v1.jpg',
  },
  {
    id: 'arm-cross',
    title: '上肢拍肩',
    shortTitle: '拍肩',
    direction: '⌁',
    instruction: '双手轻拍双肩，舒缓肩颈肌肉。',
    encouragement: '再坚持一会，马上就要结束了！',
    animatedSrc: '/exoskeleton/arm-open-v1.png',
    stillSrc: '/exoskeleton/arm-open-poster-v1.jpg',
  },
  {
    id: 'reach-march',
    title: '上肢交替拍手肘',
    shortTitle: '拍手肘',
    direction: '×',
    instruction: '左右手交替触碰对侧手肘，活动肩颈。',
    encouragement: '太棒啦！全部挑战完成，你真了不起！',
    animatedSrc: '/exoskeleton/reach-march-v1.png',
    stillSrc: '/exoskeleton/reach-march-poster-v1.jpg',
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
 * - 最后一次点击“我完成了”时才产生打卡副作用。
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
