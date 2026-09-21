import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { authFetch, currentSession, signOut } from '../../auth/auth'
import { ContentProvider, PatientProvider, usePatientData } from '../../data/context'

import { useDemoLoaded, useDemoState } from '../../store/store'
import { IconAlert, IconCaret, IconFile, IconHome, IconLeaf } from '../../components/Icons'
import { ReminderBell } from '../../components/ReminderBell'
import { ReminderBanner } from '../../components/ReminderBanner'
import { ProfileDrawer } from '../../components/ProfileDrawer'
import { TodayView } from './TodayView'
import { ChatView } from './ChatView'
import { CheckinCalendar } from '../../components/CheckinCalendar'
import { GuidanceView } from './GuidanceView'
import { VitalsView } from './VitalsView'
import { GuidanceDetailView } from './GuidanceDetailView'
import { VideoLibraryView } from './VideoLibraryView'
import { VideoDetailView } from './VideoDetailView'
import { ResourcesView } from './ResourcesView'
import { ResourceDetailView } from './ResourceDetailView'
import { ForumView } from './ForumView'
import { ForumPostView } from './ForumPostView'
import { ExoskeletonView } from './ExoskeletonView'
import '../../styles/app.css'

/**
 * 家属端外壳。
 *
 * 拆成两层是必须的：本组件既要**提供**患者上下文，又要**消费**它
 * （顶栏显示姓名、档案抽屉）。同一个组件不能同时做这两件事 ——
 * useContext 读不到自己这一层的 Provider。
 *
 * 家属绑定哪位患者由服务端决定（patient_members），不由前端猜。
 * 绑定多位时取第一位；真要支持切换是后续的事，这里先不臆造 UI。
 */
export function PatientShell() {
  const [patientId, setPatientId] = useState<string | null>(null)
  const [noPatient, setNoPatient] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const res = await authFetch('/api/auth/me')
        if (!res.ok) return
        const d = await res.json()
        if (!alive) return
        if (d.patientIds?.length) setPatientId(d.patientIds[0])
        else setNoPatient(true)
      } catch { /* 会话失效由 authFetch 处理 */ }
    })()
    return () => { alive = false }
  }, [])

  if (noPatient) {
    return (
      <div className="app" data-skin="warm" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="card card-pad" style={{ maxWidth: 420 }}>
          <h2 className="card-title">尚未关联老人档案</h2>
          <p className="card-note" style={{ marginTop: 8 }}>
            请联系护理员为您的账号关联老人档案后再登录。
          </p>
        </div>
      </div>
    )
  }
  if (!patientId) return <div className="app" style={{ minHeight: '100vh' }} />

  return (
    <ContentProvider>
      <PatientProvider patientId={patientId}>
        <PatientShellInner />
      </PatientProvider>
    </ContentProvider>
  )
}

function PatientShellInner() {
  const { patient, careAlerts } = usePatientData()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const atHome = pathname === '/patient'
  const inExoskeletonTraining = pathname === '/patient/exoskeleton'
  const session = currentSession()
  const [profileOpen, setProfileOpen] = useState(false)
  const state = useDemoState()
  const loaded = useDemoLoaded()
  const unread = state.guidances.filter((g) => !g.readByFamily).length

  const swallowing = patient.assessments.find((a) => a.name === '洼田饮水试验')
  const nutrition = patient.assessments.find((a) => a.name === 'MNA-SF 营养评估')
  const strength = patient.assessments.find((a) => a.name === 'MMT 徒手肌力测试')

  // 首屏数据来自服务端，未到之前先不渲染 —— 否则会闪一下"全部未完成"

  // 再跳成真实值，康复师看到的第一眼是错的。

  if (!loaded) return <div className="app" style={{ minHeight: '100vh' }} />


  return (
    <div className="app" data-skin="warm">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand">
            <span className="brand-mark"><IconLeaf size={17} /></span>
            <span>
              <div className="brand-name">银龄安康</div>
              <div className="brand-sub">居家康复智能助手</div>
            </span>
          </div>
          {/* 2026-09 门户式改版：顶栏 8 项链接撤除，功能入口改为首页宫格（HomeEntries） */}
        </div>
        <div className="topbar-right">
          {/* 消息中心：今日提醒记录 + 未读留言数。任何页面都点得到 */}
          <ReminderBell unreadGuidance={unread} />
          <span className="who">
            <span className="who-dot">{session?.displayName?.[0] ?? '·'}</span>
            {session?.displayName}
            <IconCaret size={13} />
          </span>
          <button className="btn-quiet" onClick={() => { signOut(); nav('/patient/login', { replace: true }) }}>
            退出
          </button>
        </div>
      </header>

      <main
        className={`page${inExoskeletonTraining ? ' exo-page-shell' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: inExoskeletonTraining ? 'minmax(0, 1fr)' : '332px minmax(0, 1fr)',
          gap: 22,
          alignItems: 'start',
        }}
      >
        {/*
          档案卡三段式：身份 → 评估摘要 → 今日须注意。
          这根左栏演示全程常驻可见，是评委看得最久的一块，所以只放三样东西：
          她是谁、现在什么水平、今天要当心什么。
          诊断细节、活动能力全文、入院经过等长文都收进「查看完整档案」——
          放在这里既读不完，也把真正值钱的量表分值挤没了。
        */}
        {!inExoskeletonTraining && <aside className="card profile">
          {/* ① 身份 */}
          {/*
            头像与右侧两行文字上下对齐：头像 56px，恰好等于姓名行 + 年龄行的高度。
            阶段徽标不再塞进姓名行 —— 它靠 vertical-align 魔数跟 25px 的姓名凑基线，
            姓名一长就换行，徽标跟着飘。移到下面与诊断同一行，两者本就是同一类信息。
            不放身高体重：甲方未提供，是合成值，不值得占这个位置。
          */}
          <div className="profile-hd">
            <div className="avatar">{patient.name[0]}</div>
            <div>
              <div className="profile-name">{patient.name}</div>
              <div className="profile-meta">
                {[patient.gender, patient.ageBand, patient.maritalStatus].filter(Boolean).join(' · ') || '基本信息待完善'}
              </div>
            </div>
          </div>

          <ul className="profile-overview">
            <li>{patient.occupation || '职业待完善'}{patient.monthlyPensionYuan ? `，退休金${patient.monthlyPensionYuan}元/月` : ''}</li>
            <li>
              身高{patient.heightCm}cm，体重{patient.weightKg}kg
              {patient.bodyMetrics && `，BMI ${patient.bodyMetrics.bmi}，上臂围${patient.bodyMetrics.upperArmCm}cm，小腿围${patient.bodyMetrics.calfCm}cm`}
            </li>
            <li>{patient.communication || '沟通情况待完善'}</li>
          </ul>

          <div className="fgroup fgroup-bare">核心情况</div>
          <div className="profile-issues">
            <ProfileIssue label="吞咽障碍" value={swallowing ? `${swallowing.name}${swallowing.value}` : '待评估'} />
            <ProfileIssue label="营养失调" value={nutrition ? `MNA-SF ${nutrition.value}` : '待评估'} />
            <ProfileIssue label="步态失衡" value={strength?.value.replaceAll(' / ', '  ') || '待评估'} />
            <ProfileIssue label="情绪波动" value={patient.psychosocial?.replace(/^情绪波动[：:]/, '') || '待评估'} />
          </div>

          <div className="caregiver-summary">
            <div className="fgroup fgroup-bare">主要照护人</div>
            <div className="caregiver-name">
              {[patient.caregiver.name, patient.caregiver.gender, patient.caregiver.age ? `${patient.caregiver.age}岁` : '', patient.caregiver.relation].filter(Boolean).join(' · ')}
            </div>
            <ProfileIssue label="技能缺失" value={patient.caregiver.skillGaps?.join('、') || '待完善'} />
            <ProfileIssue label="心理压力" value={patient.caregiver.pressures?.join('、') || '待完善'} />
          </div>

          <button className="link-more" onClick={() => setProfileOpen(true)}>
            <IconFile /> 查看完整档案
          </button>

          {/* ③ 今日须注意 —— 三条各自对应一项评估结论与一项今日任务 */}
          <div className="risk">
            <div className="risk-t"><IconAlert size={15} /> 今日须注意</div>
            {careAlerts.length > 0
              ? <ul>{careAlerts.map((a) => <li key={a}>{a}</li>)}</ul>
              : <div className="card-note" style={{ marginTop: 8 }}>暂无个性化注意事项</div>}
          </div>
        </aside>}

        {/* 内容列：二级页顶部给一个固定的「返回首页」，门户化后这是唯一的全局回跳入口 */}
        <div className={`content-col${inExoskeletonTraining ? ' exo-focus-col' : ''}`}>
          {!atHome && (
            <Link to="/patient" className="btn btn-lg back-home">
              <IconHome size={18} /> 返回首页
            </Link>
          )}
          <Routes>
            <Route index element={<TodayView />} />
            <Route path="videos" element={<VideoLibraryView />} />
            <Route path="videos/:id" element={<VideoDetailView />} />
            <Route path="exoskeleton" element={<ExoskeletonView />} />
            <Route path="chat" element={<ChatView />} />
            <Route path="calendar" element={<CheckinCalendar />} />
            <Route path="vitals" element={<VitalsView />} />
            <Route path="guidance" element={<GuidanceView />} />
            <Route path="guidance/:id" element={<GuidanceDetailView />} />
            <Route path="resources" element={<ResourcesView />} />
            <Route path="resources/:kind/:id" element={<ResourceDetailView />} />
            <Route path="forum" element={<ForumView />} />
            <Route path="forum/:id" element={<ForumPostView />} />
          </Routes>
        </div>
      </main>

      {/* 推送浮层挂在外壳上：它浮在所有页面之上，不属于任何一页的内容流 */}
      <ReminderBanner />

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} audience="family" />
    </div>
  )
}

/**
 * 按今日任务的相关度排序：下肢训练→肌力、吞咽操→洼田、
 * 任务与评估卡按当前档案展示。
 */
function ProfileIssue({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-issue">
      <span className="profile-issue-label">{label}</span>
      <span className="profile-issue-value">{value}</span>
    </div>
  )
}
