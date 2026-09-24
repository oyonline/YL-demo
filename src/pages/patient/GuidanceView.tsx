import { Link } from 'react-router-dom'
import { useContent } from '../../data/context'
import { CURRENT_GUIDANCE_ID } from '../../data/guidance'
import { IconActivity, IconAlert, IconApple, IconChevron, IconDroplet, IconLeaf, IconUtensils } from '../../components/Icons'

const GUIDANCE_ICONS: Record<string, React.ReactNode> = {
  'week-1': <IconUtensils size={19} />,
  'week-2': <IconActivity size={19} />,
  'week-3': <IconApple size={19} />,
  'week-4': <IconLeaf size={19} />,
  'month-rules': <IconDroplet size={19} />,
}

const GUIDANCE_SCHEDULE: Record<string, { title: string; summary?: string }> = {
  'week-1': { title: '第一周–第二周 · 养胃基础阶段' },
  'week-2': { title: '第三周–第四周 · 蛋白强化阶段' },
  'week-3': { title: '第五周–第六周 · 维生素均衡阶段' },
  'week-4': { title: '第七周–第八周 · 综合调理阶段' },
  'month-rules': { title: '两个月执行原则', summary: '水分、调理日、卫生与观察贯穿八周' },
}

/**
 * 取图标 —— 带兜底。
 * 原先是直接查表，2026-08-29 换成甲方饮食内容后新增了四张卡，
 * 表里没有对应 id，页面上就是四个空框。以后再加卡也不会再空。
 */
export function guidanceIcon(id: string): React.ReactNode {
  return GUIDANCE_ICONS[id] ?? <IconLeaf size={19} />
}

export function guidanceScheduleDisplay(guidance: { id: string; title: string; summary: string }) {
  const schedule = GUIDANCE_SCHEDULE[guidance.id]
  return {
    title: schedule?.title ?? guidance.title,
    summary: schedule?.summary ?? guidance.summary,
  }
}

export function GuidanceView() {
  const { guidance: GUIDANCE } = useContent()
  return (
    <div className="stack">
      <section className="card card-pad">
        <div className="eyebrow">饮食指导</div>
        <h2 className="card-title">八周饮食调理计划</h2>
        <p className="card-note" style={{ marginTop: 6 }}>
          当前阶段：养胃基础阶段（第一周–第二周） · 八周计划全部展示，食材、配方与用量由护理员或营养专业人员确认
        </p>
      </section>

      <div className="glist">
        {GUIDANCE.map((g) => {
          const isCurrent = g.id === CURRENT_GUIDANCE_ID
          const display = guidanceScheduleDisplay(g)
          return (
          <Link className={`grow${isCurrent ? ' grow-current' : ''}`} to={`/patient/guidance/${g.id}`} key={g.id}>
            <span className="grow-ico">{guidanceIcon(g.id)}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="grow-t">{display.title}</span>
              <span className="grow-s">{display.summary}</span>
              <span className="grow-m">
                {isCurrent && <span className="chip chip-brand">当前阶段</span>}
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
