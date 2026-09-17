import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconAlert, IconCheck, IconHome, IconPlay, IconShield } from '../../components/Icons'
import { usePatientData } from '../../data/context'
import { toISODate } from '../../data/seed'
import {
  EXOSKELETON_ACTIONS,
  EXOSKELETON_TASK_ID,
  createExoskeletonSession,
  transitionExoskeletonSession,
  type ExoskeletonEvent,
} from '../../features/exoskeleton/session'
import { effectiveStatus, setCheckInWithServerAck, useDemoState } from '../../store/store'

type SyncStatus = 'idle' | 'pending' | 'success' | 'failed'

export function ExoskeletonView() {
  const { patient, taskDefs } = usePatientData()
  const state = useDemoState()
  const task = taskDefs.find((candidate) => candidate.id === EXOSKELETON_TASK_ID)
  const today = toISODate(new Date())
  const checkIn = state.checkIns.find((entry) => entry.taskId === task?.id && entry.date === today)
  const alreadyComplete = task ? effectiveStatus(task, checkIn) === 'done' : false
  const [session, setSession] = useState(() => createExoskeletonSession(alreadyComplete))
  const [guardianReady, setGuardianReady] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [motionPlaying, setMotionPlaying] = useState(() => !prefersReducedMotion)
  const [mediaFailed, setMediaFailed] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(alreadyComplete ? 'success' : 'idle')
  const submittedRef = useRef(alreadyComplete)
  const mountedRef = useRef(true)
  const actionButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  // 仅在尚未开练时接受外部完成态。训练中的本地流程优先，避免第 5 次
  // 打卡的同步回流抢先盖掉最后一项的原地胜利反馈。
  const viewSession = alreadyComplete && session.phase === 'ready'
    ? createExoskeletonSession(true)
    : session
  const finishedAllActions = viewSession.completedCount === EXOSKELETON_ACTIONS.length
  const trainingStarted = viewSession.phase !== 'ready'

  useEffect(() => {
    mountedRef.current = true
    window.scrollTo(0, 0)
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (viewSession.phase !== 'celebrating' || finishedAllActions) return
    const timer = window.setTimeout(() => {
      setMotionPlaying(!prefersReducedMotion)
      setMediaFailed(false)
      setSession((current) => transitionExoskeletonSession(current, { type: 'CONTINUE' }).state)
    }, 2100)
    return () => window.clearTimeout(timer)
  }, [finishedAllActions, prefersReducedMotion, viewSession.actionIndex, viewSession.phase])

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

  if (!task) {
    return (
      <section className="card card-pad exo-empty">
        <h1>今天没有这项训练</h1>
        <p>请从“今日安排”中查看护理员制定的训练计划。</p>
      </section>
    )
  }

  function send(event: ExoskeletonEvent) {
    const result = transitionExoskeletonSession(viewSession, event)
    setSession(result.state)
    if (result.effect === 'MARK_TODAY_DONE' && !submittedRef.current) {
      if (alreadyComplete) {
        submittedRef.current = true
        setSyncStatus('success')
      } else {
        void submitCompletion()
      }
    }
  }

  async function submitCompletion() {
    if (submittedRef.current) return
    submittedRef.current = true
    setSyncStatus('pending')
    const ok = await setCheckInWithServerAck(EXOSKELETON_TASK_ID, 'done')
    if (!mountedRef.current) return
    setSyncStatus(ok ? 'success' : 'failed')
    if (!ok) submittedRef.current = false
  }

  function startTraining() {
    setMotionPlaying(!prefersReducedMotion)
    setMediaFailed(false)
    send({ type: 'START' })
  }

  return (
    <div className="exo-view exo-onepage">
      <section className="exo-overview" aria-labelledby="exo-page-title">
        <div className="exo-overview-copy">
          <div className="exo-kicker">今日训练 · {task.scheduledTime}</div>
          <h1 id="exo-page-title">外骨骼助力行走</h1>
          <p className="exo-lead">训练包含下肢步态与上肢协同动作；完成安全确认后，跟随下方画面逐项练习并打卡。</p>
          <div className="exo-meta">
            <span><b>5</b> 个训练阶段</span>
            {task.durationMin && <span>约 <b>{task.durationMin}</b> 分钟</span>}
            <span>照护人全程陪同</span>
          </div>
        </div>

        <div className="exo-overview-score" data-complete={finishedAllActions}>
          <strong className="num">{viewSession.completedCount}<small> / 5</small></strong>
          <span>{finishedAllActions ? '今日训练已完成' : '动作完成进度'}</span>
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
              开始训练 <span aria-hidden="true">→</span>
            </button>
          ) : (
            <span className="exo-started-state">
              <IconCheck size={17} /> {finishedAllActions ? '今日训练已完成' : '已进入训练流程'}
            </span>
          )}
        </div>
      </section>

      <section className="exo-workspace" aria-labelledby="exo-actions-title">
        <header className="exo-workspace-head">
          <div>
            <div className="exo-kicker">跟着画面，逐项完成</div>
            <h2 id="exo-actions-title">5 个训练阶段</h2>
          </div>
          <div className="exo-progress-copy" aria-live="polite">
            <span>当前进度</span>
            <strong className="num">{viewSession.completedCount} / {EXOSKELETON_ACTIONS.length}</strong>
          </div>
        </header>

        <div
          className="exo-progress"
          role="progressbar"
          aria-label="外骨骼助力行走训练进度"
          aria-valuemin={0}
          aria-valuemax={EXOSKELETON_ACTIONS.length}
          aria-valuenow={viewSession.completedCount}
        >
          {EXOSKELETON_ACTIONS.map((item, index) => (
            <span
              key={item.id}
              className={index < viewSession.completedCount ? 'is-done' : index === viewSession.actionIndex && trainingStarted ? 'is-current' : ''}
            />
          ))}
        </div>

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

        <div className="exo-action-grid">
          {EXOSKELETON_ACTIONS.map((item, index) => {
            const done = finishedAllActions || index < viewSession.completedCount
            const current = viewSession.phase === 'training' && index === viewSession.actionIndex
            const celebrating = viewSession.phase === 'celebrating' && index === viewSession.actionIndex
            const stoppedHere = viewSession.phase === 'stopped' && index === viewSession.actionIndex
            const showMotion = Boolean(item.animatedSrc)
              ? motionPlaying && !prefersReducedMotion && !mediaFailed
              : (current || celebrating) && motionPlaying && !prefersReducedMotion && !mediaFailed
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
                className={`exo-step-card${item.animatedSrc ? ' is-game-demo' : ''}${done ? ' is-done' : ''}${current ? ' is-current' : ''}${celebrating ? ' is-celebrating' : ''}${stoppedHere ? ' is-stopped' : ''}`}
                aria-labelledby={`exo-action-${item.id}`}
              >
                <header className="exo-step-head">
                  <span className="exo-step-number num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="exo-step-status" data-state={done ? 'done' : current ? 'current' : stoppedHere ? 'stopped' : 'waiting'}>
                    {done && <IconCheck size={13} />}{status}
                  </span>
                </header>

                <div className="exo-step-media">
                  {showMotion && item.animatedSrc ? (
                    <img
                      key={`${item.id}-game-motion`}
                      src={item.animatedSrc}
                      alt={`${item.title}游戏化动态示范`}
                      onError={() => setMediaFailed(true)}
                    />
                  ) : showMotion ? (
                    <video
                      key={`${item.id}-motion`}
                      src={item.videoSrc}
                      poster={item.stillSrc}
                      autoPlay
                      muted
                      playsInline
                      aria-label={`${item.title}真人动作示范`}
                      onError={() => setMotionPlaying(false)}
                      onEnded={() => setMotionPlaying(false)}
                    />
                  ) : (
                    <img
                      key={`${item.id}-still`}
                      src={item.stillSrc}
                      alt={`${item.title}真人动作示范`}
                      onError={() => { if (current) setMediaFailed(true) }}
                    />
                  )}
                  {item.animatedSrc && (
                    <span className="exo-game-badge"><b>✦</b> 节奏跟练 · 样例</span>
                  )}
                  <span className="exo-step-direction" aria-hidden="true">{item.direction}</span>
                  {current && mediaFailed && (
                    <div className="exo-media-fallback">动作示范暂时无法显示，请让照护人协助。</div>
                  )}
                </div>

                <div className="exo-step-body">
                  <div className="exo-step-title-row">
                    <div>
                      <div className="exo-kicker">动作 {index + 1}</div>
                      <h3 id={`exo-action-${item.id}`}>{item.title}</h3>
                    </div>
                    {current && (
                      <button
                        className="exo-motion-toggle"
                        onClick={() => setMotionPlaying((playing) => !playing)}
                        disabled={prefersReducedMotion || mediaFailed}
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
                        {Array.from({ length: 16 }, (_, piece) => <i key={piece} />)}
                      </div>
                      <span className="exo-win-burst" aria-hidden="true"><i /><i /></span>
                      <span className="exo-inline-win-mark"><IconCheck size={25} /></span>
                      <div>
                        <strong>太棒了，{item.title}完成！</strong>
                        <span className="num">已完成 {viewSession.completedCount} / {EXOSKELETON_ACTIONS.length}</span>
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
                        <small>训练进度 +1，继续保持</small>
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
              <div className="exo-kicker">今日训练完成</div>
              <h2 id="exo-finish-title">5 个训练阶段全部完成</h2>
              <p>
                {syncStatus === 'pending'
                  ? `${patient.name}今天完成得很棒，完成记录正在同步给护理员。`
                  : syncStatus === 'failed'
                    ? '动作已经完成，但记录尚未同步，请检查网络后重试。'
                    : `${patient.name}今天完成得很棒，完成记录已同步给护理员。`}
              </p>
              <div className="exo-sync-status" role="status" aria-live="polite" data-state={syncStatus}>
                {syncStatus === 'pending'
                  ? '正在同步完成记录…'
                  : syncStatus === 'failed'
                    ? '完成记录同步失败'
                    : '完成记录已同步'}
              </div>
            </div>
            <div className="exo-finish-actions">
              {syncStatus === 'failed' && (
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
