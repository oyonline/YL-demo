import { Link } from 'react-router-dom'
import { useContent, usePatientData } from '../../data/context'
import { CURRENT_GUIDANCE_ID } from '../../data/guidance'
import { IconActivity, IconAlert, IconApple, IconChevron, IconDroplet, IconLeaf, IconUtensils } from '../../components/Icons'

const GUIDANCE_ICONS: Record<string, React.ReactNode> = {
  'week-1': <IconUtensils size={19} />,
  'week-2': <IconActivity size={19} />,
  'week-3': <IconApple size={19} />,
  'week-4': <IconLeaf size={19} />,
  'month-rules': <IconDroplet size={19} />,
}

/**
 * 取图标 —— 带兜底。
 * 原先是直接查表，2026-08-29 换成甲方饮食内容后新增了四张卡，
 * 表里没有对应 id，页面上就是四个空框。以后再加卡也不会再空。
 */
export function guidanceIcon(id: string): React.ReactNode {
  return GUIDANCE_ICONS[id] ?? <IconLeaf size={19} />
}

export function GuidanceView() {
  const { guidance: GUIDANCE } = useContent()
  const { patient } = usePatientData()
  return (
    <div className="stack">
      <section className="card card-pad">
        <div className="eyebrow">饮食指导</div>
        <h2 className="card-title">四周饮食调理计划</h2>
        <p className="card-note" style={{ marginTop: 6 }}>
          当前阶段：{patient.diagnosis.stage} · 四周计划全部展示，食材、配方与用量由护理员或营养专业人员确认
        </p>
      </section>

      <div className="glist">
        {GUIDANCE.map((g) => {
          const isCurrent = g.id === CURRENT_GUIDANCE_ID
          return (
          <Link className={`grow${isCurrent ? ' grow-current' : ''}`} to={`/patient/guidance/${g.id}`} key={g.id}>
            <span className="grow-ico">{guidanceIcon(g.id)}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="grow-t">{g.title}</span>
              <span className="grow-s">{g.summary}</span>
              <span className="grow-m">
                {isCurrent && <span className="chip chip-brand">当前周</span>}
                <span className="chip num">{g.items.length} 条建议</span>
                {g.alert && <span className="chip chip-miss"><IconAlert size={11} /> 含就医提示</span>}
              </span>
            </span>
            <span className="grow-go"><IconChevron /></span>
          </Link>
          )
        })}
      </div>
    </div>
  )
}
