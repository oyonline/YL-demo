import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {BP_SAFE, isBpAbnormal} from '../../data/seed'
import { usePatientData } from '../../data/context'
import { addVital, useDemoState } from '../../store/store'
import { BpChart } from '../../components/BpChart'
import { IconAlert, IconCheck, IconHeart } from '../../components/Icons'

/**
 * 健康数据（甲方需求书 3.5）。
 *
 * 只做血压。录入项越多，45 秒的演示环节越容易卡在填表上；
 * 心率、血氧在她的评估表里有基线值，但每日不需家属反复录。
 *
 * 「不提供医疗诊断或用药指导」是甲方原文要求，也与本项目一贯边界一致：
 * 超标提示只给「当前值 / 安全范围 / 休息后复测 / 已同步康复师」，
 * 不判断高血压分级，更不建议加药。
 */
export function VitalsView() {
  const [tab, setTab] = useState<'blood-pressure' | 'feeding'>('blood-pressure')

  return (
    <div className="stack">
      <div className="vitals-tabs" role="tablist" aria-label="健康数据类型">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'blood-pressure'}
          className="vitals-tab"
          onClick={() => setTab('blood-pressure')}
        >
          血压记录
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'feeding'}
          className="vitals-tab"
          onClick={() => setTab('feeding')}
        >
          鼻饲液监测
        </button>
      </div>
      {tab === 'blood-pressure' ? <BloodPressurePanel /> : <FeedingMonitor />}
    </div>
  )
}

function BloodPressurePanel() {
  const { patient, therapist } = usePatientData()
  const state = useDemoState()
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [err, setErr] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const savedTimer = useRef<number | undefined>(undefined)

  const records = [...state.vitals].sort((a, b) => a.at.localeCompare(b.at))
  const latest = records[records.length - 1]
  const latestBad = latest ? isBpAbnormal(latest) : false

  function submit() {
    const s = Number(sys)
    const d = Number(dia)
    if (!Number.isFinite(s) || !Number.isFinite(d) || !sys.trim() || !dia.trim()) {
      setErr('请把高压和低压都填上')
      return
    }
    if (s < 50 || s > 260 || d < 30 || d > 180) {
      setErr('数值超出血压计的常见量程，请核对后重填')
      return
    }
    if (d >= s) {
      setErr('低压不应大于或等于高压，请核对')
      return
    }
    setErr('')
    addVital(s, d)
    setSys('')
    setDia('')
    window.clearTimeout(savedTimer.current)
    setJustSaved(true)
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 1600)
  }

  return (
    <div className="stack">
      <section className="card card-pad">
        <div className="card-hd">
          <div>
            <div className="eyebrow">健康数据</div>
            <h2 className="card-title">记录 {patient.name} 血压</h2>
          </div>
          <span className="card-note">安全范围 {BP_SAFE.sysMin}–{BP_SAFE.sysMax} / {BP_SAFE.diaMin}–{BP_SAFE.diaMax} mmHg</span>
        </div>

        <div className="bp-form">
          <label className="bp-field">
            <span>高压（收缩压）</span>
            <input className="input num" inputMode="numeric" value={sys} onChange={(e) => setSys(e.target.value.replace(/\D/g, ''))} />
          </label>
          <span className="bp-sep">/</span>
          <label className="bp-field">
            <span>低压（舒张压）</span>
            <input className="input num" inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, ''))} />
          </label>
          <span className="bp-unit">mmHg</span>
          <button className="btn btn-lg" onClick={submit} data-done={justSaved}><IconCheck size={13} /> {justSaved ? '已记录' : records.length === 0 ? '开始今日测量' : '记录'}</button>
        </div>
        {err && <p className="card-note" style={{ color: 'var(--miss)', marginTop: 10 }}>{err}</p>}

        <p className="card-note" style={{ marginTop: 12 }}>
          测前安静休息 5 分钟，坐位、手臂与心脏同高。测完点「记录」，{therapist.name} 那边会同步看到。
        </p>
      </section>

      {/* 超标预警 —— 只给数值、范围与复测建议，不做诊断、不谈用药 */}
      {latestBad && latest && (
        <section className="card card-pad alert-card">
          <div className="alert-hd"><IconAlert size={17} /> 这次的血压超出安全范围</div>
          <div className="alert-big num">{latest.systolic} / {latest.diastolic} <span>mmHg</span></div>
          <ul className="alert-list">
            <li>安全范围是 {BP_SAFE.sysMin}–{BP_SAFE.sysMax} / {BP_SAFE.diaMin}–{BP_SAFE.diaMax} mmHg。</li>
            <li>请让她<strong>安静休息 5–10 分钟后再测一次</strong>，两次数值都记下来。</li>
            <li><strong>不要自行加药或调整剂量</strong>——用法用量须由医师或护理员决定。</li>
            <li>已同步给 {therapist.name}，她会在工作台看到这条记录。</li>
          </ul>
          <div className="alert-emg">
            出现剧烈头痛、视物模糊、胸闷、恶心呕吐，或一侧肢体较平时明显无力，<strong>不要等待，立即就医</strong>。
          </div>
        </section>
      )}

      <section className="card card-pad">
        <div className="card-hd">
          <div>
            <div className="eyebrow">近期趋势</div>
            <h2 className="card-title" style={{ fontSize: 'var(--t-md)' }}>共 {records.length} 次记录</h2>
          </div>
          <span className="bp-legend">
            <i className="dot-sys" />高压<i className="dot-dia" />低压<i className="dot-bad" />超范围
          </span>
        </div>
        <BpChart records={records} />
      </section>

      <section className="card card-pad">
        <div className="eyebrow">记录明细</div>
        <div className="bp-rows">
          {records.length === 0 && <div className="card-note" style={{ padding: '18px 0' }}>暂无</div>}
          {[...records].reverse().slice(0, 10).map((r, i) => {
            const bad = isBpAbnormal(r)
            return (
              <div className="bp-row" key={r.id} data-bad={bad} data-fresh={justSaved && i === 0}>
                <span className="bp-when num">{Number(r.date.slice(5, 7))}/{Number(r.date.slice(8, 10))} {r.time}</span>
                <span className="bp-val num">{r.systolic} / {r.diastolic}</span>
                <span className="bp-by">{r.by}</span>
                {bad
                  ? <span className="chip" style={{ background: 'var(--miss-bg)', color: 'var(--miss)' }}>超出范围</span>
                  : <span className="chip chip-ok"><IconCheck size={10} /> 正常</span>}
              </div>
            )
          })}
        </div>
        <p className="card-note" style={{ marginTop: 14 }}>
          <IconHeart size={13} /> 每日 7:00 与 20:30 各测一次是计划里的任务，见 <Link to="/patient">今日安排</Link>。
        </p>
      </section>
    </div>
  )
}

function FeedingMonitor() {
  const { patient } = usePatientData()
  const [now, setNow] = useState(() => new Date())
  const [targetTemperature, setTargetTemperature] = useState(38)
  const [temperature, setTemperature] = useState(38)
  const [infused, setInfused] = useState(12.5)
  const [running, setRunning] = useState(true)
  const [trend, setTrend] = useState(() => Array.from(
    { length: 60 },
    (_, i) => 38 + Math.sin(i / 4) * 0.07 + Math.sin(i / 11) * 0.03,
  ))
  const [events, setEvents] = useState(() => [
    { time: formatClock(new Date()), text: '开始鼻饲：水果汁 50mL，流速 10mL/分' },
    { time: formatClock(new Date()), text: '设备自检完成，温度传感器与恒温夹正常' },
  ])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const tick = new Date()
      setNow(tick)
      setTemperature((current) => {
        const correction = (targetTemperature - current) * 0.2
        const sensorDrift = (Math.random() - 0.5) * 0.055
        const next = current + correction + sensorDrift
        const stable = Math.max(targetTemperature - 0.16, Math.min(targetTemperature + 0.16, next))
        setTrend((values) => [...values.slice(1), stable])
        return stable
      })
      if (running) setInfused((value) => Math.min(50, value + 1 / 6))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, targetTemperature])

  const remaining = Math.max(0, 50 - infused)
  const temperatureGap = Math.abs(targetTemperature - temperature)
  const powerPercent = temperatureGap < 0.03 ? 24 : temperatureGap < 0.5 ? 46 : 72
  const powerWatts = Math.round(powerPercent * 0.25)
  const temperatureAlert = temperature > 40

  function chooseTemperature(value: number) {
    setTargetTemperature(value)
    setEvents((items) => [
      { time: formatClock(new Date()), text: `设定液温调整为 ${value.toFixed(1)}℃` },
      ...items,
    ].slice(0, 4))
  }

  function toggleRunning() {
    const nextRunning = !running
    setRunning(nextRunning)
    setEvents((items) => [
      { time: formatClock(new Date()), text: nextRunning ? '鼻饲监测已继续' : '鼻饲监测已暂停' },
      ...items,
    ].slice(0, 4))
  }

  function restart() {
    setInfused(0)
    setRunning(true)
    setEvents((items) => [
      { time: formatClock(new Date()), text: '重新开始鼻饲：水果汁 50mL' },
      ...items,
    ].slice(0, 4))
  }

  return (
    <section className="feed-monitor" aria-label="鼻饲液恒温监测">
      <header className="feed-topbar">
        <div className="feed-device">
          <span className="feed-logo" aria-hidden="true">温</span>
          <span><strong>鼻饲液监测</strong><small>健康数据 · 实时照护</small></span>
        </div>
        <div className="feed-patient"><i />患者 <strong>{patient.name}</strong><b>·</b> 水果汁 <strong>50mL</strong></div>
        <div className="feed-clock"><strong>{formatClock(now)}</strong><small>{formatDate(now)}</small></div>
      </header>

      <div className="feed-status" data-alert={temperatureAlert}>
        <span aria-hidden="true">✓</span>
        {temperatureAlert ? '液温超过 40℃，请立即检查恒温夹' : '系统运行正常，液温恒定，流速稳定'}
      </div>

      <div className="feed-grid">
        <section className="feed-panel feed-temperature">
          <PanelTitle icon="♨" text="液温控制" />
          <div className="temp-dial" style={{ '--temp-progress': `${((temperature - 38) / 2) * 100}%` } as React.CSSProperties}>
            <div><strong>{temperature.toFixed(1)}</strong><span>℃</span><small>当前液温</small></div>
          </div>
          <div className="temp-setting">设定 <strong>{targetTemperature.toFixed(1)}℃</strong></div>
          <span className="feed-pill">恒温保持中</span>
          <div className="temp-controls">
            <button type="button" onClick={() => chooseTemperature(Math.max(38, targetTemperature - 0.1))} aria-label="降低设定温度">−</button>
            <div><strong>{targetTemperature.toFixed(1)}</strong><span>℃</span><small>设定温度</small></div>
            <button type="button" onClick={() => chooseTemperature(Math.min(40, targetTemperature + 0.1))} aria-label="提高设定温度">＋</button>
          </div>
          <div className="temp-presets">
            {[38, 39, 40].map((value) => (
              <button type="button" key={value} data-active={targetTemperature === value} onClick={() => chooseTemperature(value)}>{value}℃</button>
            ))}
          </div>
          <p>可调范围 <strong>38.0–40.0℃</strong>，超过 40℃ 系统报警</p>
        </section>

        <section className="feed-panel feed-realtime">
          <PanelTitle icon="◉" text="实时检查" />
          <div className="flow-hero">
            <div className="feed-bag" aria-hidden="true"><span style={{ height: `${remaining * 2}%` }} /></div>
            <div className="flow-reading"><strong>10</strong><span>mL/分</span><em>流速正常</em></div>
          </div>
          <div className="feed-metrics">
            <Metric label="已输入量" value={infused.toFixed(1)} unit="mL" />
            <Metric label="剩余液量" value={remaining.toFixed(1)} unit="mL" />
            <Metric label="恒温夹功率" value={`${powerPercent}%`} unit={`${powerWatts}W`} />
          </div>
          <div className="feed-progress">
            <span>鼻饲进度</span>
            <div><i style={{ width: `${infused * 2}%` }} /></div>
            <small><b>总量 50mL</b><b>{infused.toFixed(1)}mL 已完成</b></small>
          </div>
          <div className="feed-actions">
            <span className="feed-pill"><i />{running ? '运行中' : '已暂停'}</span>
            <button type="button" onClick={toggleRunning}>{running ? '暂停' : '继续'}</button>
            <button type="button" className="danger" onClick={restart}>重新开始</button>
          </div>
        </section>

        <section className="feed-panel feed-side">
          <PanelTitle icon="⌁" text="液温趋势（近60秒）" />
          <TemperatureTrend values={trend} setTemperature={targetTemperature} />
          <div className="trend-legend"><i />实际液温 <i />设定温度</div>
          <PanelTitle icon="▤" text="事件 / 报警日志" />
          <div className="feed-events">
            {events.map((event, index) => <div key={`${event.time}-${index}`}><time>{event.time}</time><span>{event.text}</span></div>)}
            <p className="feed-events-status"><i />当前无报警，系统持续监测中</p>
          </div>
        </section>
      </div>
    </section>
  )
}

function PanelTitle({ icon, text }: { icon: string; text: string }) {
  return <h3 className="feed-panel-title"><span aria-hidden="true">{icon}</span>{text}</h3>
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <div className="feed-metric"><span>{label}</span><strong>{value}</strong><small>{unit}</small></div>
}

function TemperatureTrend({ values, setTemperature }: { values: number[]; setTemperature: number }) {
  const points = values.map((value, index) => {
    const x = 8 + (index / Math.max(1, values.length - 1)) * 284
    const y = 60 - (value - setTemperature) * 230
    return `${x.toFixed(1)},${Math.max(14, Math.min(106, y)).toFixed(1)}`
  }).join(' ')
  const lastY = points.split(' ').at(-1)?.split(',')[1] ?? '60'
  return (
    <svg className="feed-trend" viewBox="0 0 300 120" role="img" aria-label="近60秒液温趋势">
      <defs>
        <linearGradient id="temperatureArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--teal-300)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--teal-300)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 48, 76, 104].map((y) => <line key={y} x1="8" x2="292" y1={y} y2={y} />)}
      <line className="set-line" x1="8" x2="292" y1="60" y2="60" />
      <polygon className="temperature-area" points={`8,106 ${points} 292,106`} />
      <polyline points={points} />
      <circle className="trend-pulse" cx="292" cy={lastY} r="7" />
      <circle className="trend-point" cx="292" cy={lastY} r="3.5" />
    </svg>
  )
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
