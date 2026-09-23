import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { IconAlert, IconCheck, IconHome, IconPlay, IconShield } from '../../components/Icons'
import { CelebrationCanvas } from '../../components/CelebrationCanvas'
import { usePatientData } from '../../data/context'
import { toISODate } from '../../data/seed'
import { tasksForDate } from '../../data/taskSchedule'
import {
  EXOSKELETON_CELEBRATION_AUDIO,
  EXOSKELETON_TASK_ID,
  createExoskeletonSession,
  exoskeletonActionsForDate,
  transitionExoskeletonSession,
  type ExoskeletonEvent,
} from '../../features/exoskeleton/session'
import { effectiveStatus, recordGameStage, setCheckInWithServerAck, useDemoState } from '../../store/store'

type SyncStatus = 'idle' | 'pending' | 'success' | 'failed'
const STANDARD_CELEBRATION_MS = 5000
const FINAL_CELEBRATION_MS = 5600

export function ExoskeletonView() {
  const { patient, taskDefs, taskSchedule } = usePatientData()
  const [searchParams] = useSearchParams()
  const state = useDemoState()
  const today = toISODate(new Date())
  const previewDate = searchParams.get('date') ?? ''
  const isPlanPreview = searchParams.get('mode') === 'preview' && /^\d{4}-\d{2}-\d{2}$/.test(previewDate)
  const actionDate = isPlanPreview ? previewDate : today
  const actions = exoskeletonActionsForDate(actionDate)
  const task = (isPlanPreview ? tasksForDate(taskSchedule, previewDate) : taskDefs)
    .find((candidate) => candidate.id === EXOSKELETON_TASK_ID)
  const checkIn = state.checkIns.find((entry) => entry.taskId === task?.id && entry.date === today)
  const alreadyComplete = !isPlanPreview && task ? effectiveStatus(task, checkIn) === 'done' : false
  const [session, setSession] = useState(() => createExoskeletonSession(alreadyComplete, actions.length))
  const [guardianReady, setGuardianReady] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [motionPlaying, setMotionPlaying] = useState(() => !prefersReducedMotion)
  const [failedMotionIds, setFailedMotionIds] = useState<Set<string>>(() => new Set())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(alreadyComplete ? 'success' : 'idle')
  const [visibleActionIndex, setVisibleActionIndex] = useState(() => alreadyComplete ? actions.length - 1 : 0)
  const submittedRef = useRef(alreadyComplete)
  const mountedRef = useRef(true)
  const actionButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const actionStartedAtRef = useRef<Date | null>(null)
  const gameSessionIdRef = useRef(`game-${today}-${EXOSKELETON_TASK_ID}`)
  const celebrationAudioRefs = useRef<HTMLAudioElement[]>([])
  // 仅在尚未开练时接受外部完成态。训练中的本地流程优先，避免最后一次
  // 打卡的同步回流抢先盖掉最后一项的原地胜利反馈。
  const viewSession = alreadyComplete && session.phase === 'ready'
    ? createExoskeletonSession(true, actions.length)
    : session
  const finishedAllActions = viewSession.completedCount === actions.length
  const trainingStarted = viewSession.phase !== 'ready'
  const maxAccessibleActionIndex = finishedAllActions
    ? actions.length - 1
    : viewSession.actionIndex
  const showingCurrentAction = visibleActionIndex === viewSession.actionIndex
  const celebrationLevel = viewSession.actionIndex + 1
  const celebrationAction = actions[viewSession.actionIndex]

  useEffect(() => {
    mountedRef.current = true
    window.scrollTo(0, 0)
    return () => {
      mountedRef.current = false
      celebrationAudioRefs.current.forEach((audio) => audio.pause())
    }
  }, [])

  useEffect(() => {
    if (viewSession.phase !== 'celebrating') return
    const timer = window.setTimeout(() => {
      setMotionPlaying(!prefersReducedMotion)
      setFailedMotionIds(new Set())
      setSession((current) => transitionExoskeletonSession(current, { type: 'CONTINUE' }, actions.length).state)
    }, finishedAllActions ? FINAL_CELEBRATION_MS : STANDARD_CELEBRATION_MS)
    return () => window.clearTimeout(timer)
  }, [actions.length, finishedAllActions, prefersReducedMotion, viewSession.actionIndex, viewSession.phase])

  useEffect(() => {
    if (viewSession.phase !== 'training') return
    const frame = window.requestAnimationFrame(() => {
      const button = actionButtonRefs.current[viewSession.actionIndex]
      button?.focus({ preventScroll: true })
      const card = button?.closest('article')
      const cardRect = card?.getBoundingClientRect()
      if (card && cardRect && (cardRect.top < 92 || cardRect.bottom > window.innerHeight - 28)) {
        card.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [prefersReducedMotion, viewSession.actionIndex, viewSession.phase])

  useEffect(() => {
    setVisibleActionIndex(viewSession.actionIndex)
  }, [viewSession.actionIndex])

  useEffect(() => {
    if (viewSession.phase === 'training' && !actionStartedAtRef.current) {
      actionStartedAtRef.current = new Date()
    }
  }, [viewSession.actionIndex, viewSession.phase])

  if (!task) {
    return (
      <section className="card card-pad exo-empty">
        <h1>今天没有这项训练</h1>
        <p>请从“今日安排”中查看护理员制定的训练计划。</p>
      </section>
    )
  }

  function send(event: ExoskeletonEvent) {
    if (event.type === 'ACTION_DONE' && viewSession.phase === 'training') {
      celebrationAudioRefs.current.forEach((audio) => audio.pause())
      const finalStage = viewSession.actionIndex === actions.length - 1
      const layers = [
        { src: actions[viewSession.actionIndex].encouragementAudioSrc, volume: 1 },
        { src: EXOSKELETON_CELEBRATION_AUDIO.confetti, volume: 0.22 },
        {
          src: finalStage
            ? EXOSKELETON_CELEBRATION_AUDIO.finalMusic
            : EXOSKELETON_CELEBRATION_AUDIO.standardMusic,
          volume: finalStage ? 0.18 : 0.14,
        },
      ]
      celebrationAudioRefs.current = layers.map(({ src, volume }) => {
        const audio = new Audio(src)
        audio.volume = volume
        void audio.play().catch(() => undefined)
        return audio
      })
    }
    if (!isPlanPreview && (event.type === 'ACTION_DONE' || event.type === 'STOP') && viewSession.phase === 'training') {
      const completedAt = new Date()
      const startedAt = actionStartedAtRef.current ?? completedAt
      const action = actions[viewSession.actionIndex]
      recordGameStage({
        sessionId: gameSessionIdRef.current,
        taskId: EXOSKELETON_TASK_ID,
        date: today,
        actionId: action.id,
        actionTitle: action.title,
        actionIndex: viewSession.actionIndex,
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationSec: Math.max(1, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)),
        pauseCount: 0,
        retryCount: 0,
        status: event.type === 'ACTION_DONE' ? 'completed' : 'stopped',
      })
      actionStartedAtRef.current = null
    }
    const result = transitionExoskeletonSession(viewSession, event, actions.length)
    setSession(result.state)
    if (!isPlanPreview && result.effect === 'MARK_TODAY_DONE' && !submittedRef.current) {
      if (alreadyComplete) {
        submittedRef.current = true
        setSyncStatus('success')
      } else {
        void submitCompletion()
      }
    }
  }

  async function submitCompletion() {
    if (isPlanPreview || submittedRef.current) return
    submittedRef.current = true
    setSyncStatus('pending')
    const ok = await setCheckInWithServerAck(EXOSKELETON_TASK_ID, 'done')
    if (!mountedRef.current) return
    setSyncStatus(ok ? 'success' : 'failed')
    if (!ok) submittedRef.current = false
  }

  function startTraining() {
    actionStartedAtRef.current = new Date()
    setMotionPlaying(!prefersReducedMotion)
    setFailedMotionIds(new Set())
    send({ type: 'START' })
  }

  return (
    <div className="exo-view exo-onepage">
      {viewSession.phase === 'celebrating' && (
        <div
          className={`exo-screen-celebration${finishedAllActions ? ' is-final' : ''}`}
          data-level={celebrationLevel}
          role="status"
          aria-live="assertive"
        >
          {finishedAllActions && <span className="exo-grand-flash" aria-hidden="true"><i /><i /><i /></span>}
          <video
            key={`${viewSession.actionIndex}-${finishedAllActions ? 'final' : 'standard'}`}
            className={`exo-effect-video ${finishedAllActions ? 'is-final-confetti' : 'is-confetti'}`}
            src={finishedAllActions
              ? '/effects/stage-1-5-confetti-xmas-alpha.webm?v=4'
              : '/effects/stage-1-5-confetti-121983-alpha.webm?v=1'}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <CelebrationCanvas level={celebrationLevel} finalStage={finishedAllActions} />
          {finishedAllActions && (['is-left', 'is-right'] as const).map((side) => (
            <span className={`exo-side-spray ${side}`} aria-hidden="true" key={side}>
              {Array.from({ length: 6 + celebrationLevel * 3 }, (_, piece) => (
                <i
                  key={piece}
                  style={{
                    '--spray-x': `${6 + (piece % 9) * 3.6}vw`,
                    '--spray-y': `${-(25 + (piece * 7) % 20)}vh`,
                    '--spray-delay': `${(piece % 6) * 0.045}s`,
                  } as CSSProperties}
                />
              ))}
            </span>
          ))}
          {finishedAllActions && <span className="exo-party-cannon is-left" aria-hidden="true"><i /><b /><em /></span>}
          {finishedAllActions && <span className="exo-party-cannon is-right" aria-hidden="true"><i /><b /><em /></span>}
          <div className="exo-screen-praise">
            <span className="exo-praise-rays" aria-hidden="true" />
            <span className="exo-praise-thumb" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7.5 10.2 11.2 3c.6-1.1 2.3-.7 2.3.6v4h4.6c1.8 0 3.1 1.7 2.6 3.4l-1.9 7.2a2.7 2.7 0 0 1-2.6 2H7.5v-10Z" />
                <path d="M3.2 10.2h4.3v10H3.2a1.4 1.4 0 0 1-1.4-1.4v-7.2a1.4 1.4 0 0 1 1.4-1.4Z" />
              </svg>
            </span>
            <span className="exo-praise-kicker">{finishedAllActions ? `${actions.length} 项挑战全部完成` : `完成第 ${celebrationLevel} 阶段`}</span>
            <strong>{celebrationAction.encouragement}</strong>
            <span>{finishedAllActions ? (isPlanPreview ? '本次动作体验顺利通关' : '今日律动训练顺利通关') : '即将自动进入下一环节'}</span>
          </div>
        </div>
      )}
      <section className="exo-overview" aria-labelledby="exo-page-title">
        <div className="exo-overview-copy">
          <div className="exo-kicker">{isPlanPreview ? `${previewDate} 计划体验` : '今日训练'} · {task.scheduledTime}</div>
          <h1 id="exo-page-title">{task?.title ?? '智能辅具助力行走'}</h1>
          <p className="exo-lead">
            {isPlanPreview
              ? '这是未来计划的提前体验，不会写入打卡或训练记录；完成安全确认后，可跟随下方画面逐项熟悉动作。'
              : '训练包含下肢步态与上肢协同动作；完成安全确认后，跟随下方画面逐项练习并打卡。'}
          </p>
          <div className="exo-meta">
            <span><b>{actions.length}</b> 个训练阶段</span>
            {task.durationMin && <span>约 <b>{task.durationMin}</b> 分钟</span>}
            <span>照护人全程陪同</span>
          </div>
        </div>

        <div className="exo-overview-score" data-complete={finishedAllActions}>
          <strong className="num">{viewSession.completedCount}<small> / {actions.length}</small></strong>
          <span>{finishedAllActions ? (isPlanPreview ? '本次体验已完成' : '今日训练已完成') : (isPlanPreview ? '动作体验进度' : '动作完成进度')}</span>
        </div>

        <div className="exo-safety-box">
          <span className="exo-safety-icon"><IconShield size={21} /></span>
          <div>
            <strong>开始前请确认安全</strong>
            <p>{task.cautions.join('；')}。</p>
          </div>
        </div>

        <div className="exo-ready-row">
          <label className="exo-ready-check">
            <input
              type="checkbox"
              checked={guardianReady || trainingStarted}
              disabled={trainingStarted}
              onChange={(event) => setGuardianReady(event.target.checked)}
            />
            <span>{trainingStarted ? '安全确认已完成，照护人全程在旁' : '照护人已在身边，并已完成设备检查'}</span>
          </label>
          {viewSession.phase === 'ready' ? (
            <button className="btn exo-primary" disabled={!guardianReady} onClick={startTraining}>
              {isPlanPreview ? '开始体验' : '开始训练'} <span aria-hidden="true">→</span>
            </button>
          ) : (
            <span className="exo-started-state">
              <IconCheck size={17} /> {finishedAllActions ? (isPlanPreview ? '本次体验已完成' : '今日训练已完成') : (isPlanPreview ? '已进入体验流程' : '已进入训练流程')}
            </span>
          )}
        </div>
      </section>

      <section className="exo-workspace" aria-labelledby="exo-actions-title">
        <header className="exo-workspace-head">
          <div>
            <div className="exo-kicker">一次专注一个动作</div>
            <h2 id="exo-actions-title">当前训练阶段</h2>
          </div>
          <div className="exo-progress-copy" aria-live="polite">
            <span>当前进度</span>
            <strong className="num">{viewSession.completedCount} / {actions.length}</strong>
          </div>
        </header>

        <div
          className="exo-progress"
          role="progressbar"
          aria-label="智能辅具助力行走训练进度"
          aria-valuemin={0}
          aria-valuemax={actions.length}
          aria-valuenow={viewSession.completedCount}
        >
          {actions.map((item, index) => (
            <span
              key={item.id}
              className={index < viewSession.completedCount ? 'is-done' : index === viewSession.actionIndex && trainingStarted ? 'is-current' : ''}
            />
          ))}
        </div>

        <nav className="exo-stage-nav" aria-label="训练阶段切换">
          <button
            className="btn-quiet exo-stage-nav-button"
            disabled={visibleActionIndex === 0}
            onClick={() => setVisibleActionIndex((index) => Math.max(0, index - 1))}
          >
            <span aria-hidden="true">←</span> 上一阶段
          </button>
          <div className="exo-stage-nav-current" aria-live="polite">
            <span>第 {visibleActionIndex + 1} / {actions.length} 阶段</span>
            <strong>{actions[visibleActionIndex].title}</strong>
            {!showingCurrentAction && <small>正在回看已完成阶段</small>}
          </div>
          <button
            className="btn-quiet exo-stage-nav-button"
            disabled={visibleActionIndex >= maxAccessibleActionIndex}
            onClick={() => setVisibleActionIndex((index) => Math.min(maxAccessibleActionIndex, index + 1))}
          >
            {visibleActionIndex + 1 === viewSession.actionIndex ? '回到当前阶段' : '下一阶段'} <span aria-hidden="true">→</span>
          </button>
        </nav>

        {viewSession.phase === 'stopped' && (
          <div className="exo-inline-stop" role="alert">
            <span className="exo-stop-icon"><IconAlert size={28} /></span>
            <div>
              <strong>训练已停止，本次不计入完成</strong>
              <p>请先休息并告诉身边的照护人；如有不适，请联系护理员或及时就医。</p>
            </div>
            <Link className="btn-quiet exo-secondary" to="/patient"><IconHome size={17} /> 返回首页</Link>
          </div>
        )}

        <div className="exo-action-grid is-single">
          {[actions[visibleActionIndex]].map((item) => {
            const index = visibleActionIndex
            const done = finishedAllActions || index < viewSession.completedCount
            const current = viewSession.phase === 'training' && index === viewSession.actionIndex
            const celebrating = viewSession.phase === 'celebrating' && index === viewSession.actionIndex
            const stoppedHere = viewSession.phase === 'stopped' && index === viewSession.actionIndex
            const isPreviewAction = viewSession.phase === 'ready' && index === 0
            const isFocusedAction = isPreviewAction || current || celebrating || done
            const motionFailed = failedMotionIds.has(item.id)
            const showMotion = isFocusedAction && motionPlaying && !prefersReducedMotion && !motionFailed
            const imageClassName = item.videoSrc
              ? 'exo-step-image is-portrait-demo'
              : 'exo-step-image is-scale-matched'
            const status = done
              ? (celebrating ? '刚刚完成' : '已完成')
              : current
                ? '进行中'
                : stoppedHere
                  ? '已停止'
                  : '待完成'

            return (
              <article
                key={item.id}
                className={`exo-step-card${item.animatedSrc || item.videoSrc ? ' is-game-demo' : ''}${done ? ' is-done' : ''}${current ? ' is-current' : ''}${celebrating ? ' is-celebrating' : ''}${stoppedHere ? ' is-stopped' : ''}`}
                aria-labelledby={`exo-action-${item.id}`}
              >
                <header className="exo-step-head">
                  <span className="exo-step-number num">{String(index + 1).padStart(2, '0')}</span>
                  {!done && (
                    <span className="exo-step-status" data-state={current ? 'current' : stoppedHere ? 'stopped' : 'waiting'}>
                      {status}
                    </span>
                  )}
                </header>

                <div className="exo-step-media" data-action-id={item.id}>
                  {showMotion && item.animatedSrc ? (
                    <img
                      key={`${item.id}-game-motion`}
                      className={imageClassName}
                      src={item.animatedSrc}
                      alt={`${item.title}游戏化动态示范`}
                      onError={() => setFailedMotionIds((currentIds) => new Set(currentIds).add(item.id))}
                    />
                  ) : showMotion && item.videoSrc ? (
                    <video
                      key={`${item.id}-motion`}
                      className={imageClassName}
                      src={item.videoSrc}
                      poster={item.stillSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-label={`${item.title}动作示范`}
                      onError={() => setFailedMotionIds((currentIds) => new Set(currentIds).add(item.id))}
                    />
                  ) : (
                    <img
                      key={`${item.id}-still`}
                      className={imageClassName}
                      src={item.stillSrc}
                      alt={`${item.title}动作定格示范`}
                    />
                  )}
                  {(item.animatedSrc || item.videoSrc) && (
                    <span className="exo-game-badge"><b>✦</b> 节奏跟练</span>
                  )}
                  <span className="exo-step-direction" aria-hidden="true">{item.direction}</span>
                </div>

                <div className="exo-step-body">
                  <div className="exo-step-title-row">
                    <div>
                      <div className="exo-kicker">动作 {index + 1}</div>
                      <h3 id={`exo-action-${item.id}`}>{item.title}</h3>
                    </div>
                    {isFocusedAction && trainingStarted && viewSession.phase !== 'stopped' && (
                      <button
                        className="exo-motion-toggle"
                        onClick={() => setMotionPlaying((playing) => !playing)}
                        disabled={prefersReducedMotion || motionFailed}
                        aria-label={showMotion ? `暂停${item.title}动作示范` : `播放${item.title}动作示范`}
                      >
                        {showMotion
                          ? <><span className="exo-pause" aria-hidden="true" /> 暂停</>
                          : <><IconPlay size={15} /> 播放</>}
                      </button>
                    )}
                  </div>
                  <p>{item.instruction}</p>

                  {current && (
                    <div className="exo-step-controls">
                      <div className="exo-guardian-note"><IconShield size={17} /> 全程请由照护人在旁保护</div>
                      {prefersReducedMotion && <p className="exo-motion-note">已按系统设置显示静态示范图</p>}
                      <button
                        ref={(node) => { actionButtonRefs.current[index] = node }}
                        className="btn exo-primary"
                        onClick={() => send({ type: 'ACTION_DONE' })}
                      >
                        <IconCheck size={17} /> 我完成了
                      </button>
                      <button className="exo-stop" onClick={() => send({ type: 'STOP' })}>
                        <IconAlert size={17} /> 身体不适，立即停止
                      </button>
                    </div>
                  )}

                  {celebrating && (
                    <div className="exo-inline-win" role="status" aria-live="assertive">
                      <div className="exo-confetti" aria-hidden="true">
                        {Array.from({ length: 8 + celebrationLevel * 4 }, (_, piece) => <i key={piece} />)}
                      </div>
                      <span className="exo-win-burst" aria-hidden="true"><i /><i /></span>
                      <span className="exo-inline-win-mark"><IconCheck size={25} /></span>
                      <div>
                        <strong>{item.encouragement}</strong>
                        <span className="num">已完成 {viewSession.completedCount} / {actions.length}</span>
                      </div>
                      <span className="exo-win-reward" aria-hidden="true">+1 <small>完成</small></span>
                      {!finishedAllActions && (
                        <span className="exo-auto-next">下一项即将自动开始…</span>
                      )}
                    </div>
                  )}

                  {!done && !current && !celebrating && (
                    <div className="exo-step-waiting">
                      {viewSession.phase === 'ready'
                        ? '完成上方安全确认后开始'
                        : stoppedHere
                          ? '本次训练已停止'
                          : '完成上一项后自动解锁'}
                    </div>
                  )}

                  {done && !celebrating && (
                    <div className="exo-step-done">
                      <span className="exo-step-done-mark"><IconCheck size={18} /></span>
                      <span>
                        <strong>本项挑战完成</strong>
                        <small>{isPlanPreview ? '体验进度 +1，继续保持' : '训练进度 +1，继续保持'}</small>
                      </span>
                      <b aria-hidden="true">✦</b>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {finishedAllActions && (
          <section className="exo-finish-panel" aria-labelledby="exo-finish-title">
            <div className="exo-result-mark"><IconCheck size={38} /></div>
            <div>
              <div className="exo-kicker">{isPlanPreview ? '未来计划体验完成' : '今日训练完成'}</div>
              <h2 id="exo-finish-title">{actions.length} 个训练阶段全部完成</h2>
              <p>
                {isPlanPreview
                  ? '本次仅用于提前熟悉动作，没有生成未来日期打卡或训练记录。'
                  : syncStatus === 'pending'
                  ? `${patient.name}今天完成得很棒，完成记录正在同步给护理员。`
                  : syncStatus === 'failed'
                    ? '动作已经完成，但记录尚未同步，请检查网络后重试。'
                    : `${patient.name}今天完成得很棒，完成记录已同步给护理员。`}
              </p>
              <div className="exo-sync-status" role="status" aria-live="polite" data-state={syncStatus}>
                {isPlanPreview
                  ? '体验记录未写入'
                  : syncStatus === 'pending'
                  ? '正在同步完成记录…'
                  : syncStatus === 'failed'
                    ? '完成记录同步失败'
                    : '完成记录已同步'}
              </div>
            </div>
            <div className="exo-finish-actions">
              {!isPlanPreview && syncStatus === 'failed' && (
                <button className="btn exo-primary" onClick={() => void submitCompletion()}>重新同步</button>
              )}
              <Link className="btn-quiet exo-secondary" to="/patient"><IconHome size={17} /> 返回首页</Link>
            </div>
          </section>
        )}
      </section>
    </div>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ))

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}
