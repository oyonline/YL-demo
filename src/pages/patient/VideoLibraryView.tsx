import { Link } from 'react-router-dom'
import { usePatientData, useContent } from '../../data/context'
import { IconPlay } from '../../components/Icons'
import { FEATURED_VIDEO_IDS } from '../../data/seed'
import type { VideoAsset } from '../../data/types'

/**
 * 训练视频库。
 *
 * 21 个视频全部是真实拍摄素材，因此不做「制作中」占位卡 ——
 * 列表里出现的每一个都点得开、播得了。
 *
 * 缩略图：每个视频的首帧已预抽成 `public/posters/<id>.jpg`（2026-09-03
 * 用户裁决方案 B）。用 <img> 而非 <video preload="metadata"> 是为了演示
 * 确定性 —— 打开列表即显示，无逐卡加载的灰黑闪烁，投屏零翻车。
 * 注意：**视频换版后须重新抽帧**（命令见 public/posters/README）。
 * 图片缺失或加载失败时退回原深色占位块，不黑屏。
 *
 * 用户补充的 4 个视频固定排在首屏，且不在下方分类中重复；其余视频按
 * 原分类和原顺序展示。某一类没有视频时整块不渲染，不留空标题。
 */
export function VideoLibraryView() {
  const { taskDefs } = usePatientData()
  const { videoCategories: VIDEO_CATEGORIES, videos, videoSteps: VIDEO_STEPS } = useContent()
  const featuredVideos = FEATURED_VIDEO_IDS.flatMap((id) => {
    const video = videos.find((candidate) => candidate.id === id)
    return video ? [video] : []
  })
  const featuredIds = new Set(featuredVideos.map((video) => video.id))

  const renderVideoCard = (video: VideoAsset) => {
    const task = taskDefs.find((candidate) => candidate.videoId === video.id)
    const steps = VIDEO_STEPS[video.id]?.length ?? 0
    return (
      <Link className="vcard" to={`/patient/videos/${video.id}`} key={video.id}>
        <div className="vcard-thumb">
          <img
            className="vcard-poster"
            src={`/posters/${video.id}.jpg`}
            alt=""
            loading="lazy"
            onError={(event) => { event.currentTarget.remove() }}
          />
          <span className="stage-play" style={{ width: 44, height: 44 }}><IconPlay size={16} /></span>
        </div>
        <div className="vcard-body">
          <div className="vcard-t">{video.title}</div>
          {/* 素材未附说明时整行不渲染，不自行编写康复指导。 */}
          {video.goal && <div className="vcard-d">{video.goal}</div>}
          <div className="vcard-m">
            {task && <span className="chip chip-brand">{task.scheduledTime} 安排</span>}
            {steps > 0 && <span className="chip">{steps} 个步骤</span>}
            {video.durationSec && (
              <span className="chip num">
                {video.durationSec < 60 ? `约 ${video.durationSec} 秒` : `约 ${Math.round(video.durationSec / 60)} 分钟`}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="stack">
      {featuredVideos.length > 0 && (
        <section aria-label="置顶训练视频">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {featuredVideos.map(renderVideoCard)}
          </div>
        </section>
      )}
      {VIDEO_CATEGORIES.map((cat) => {
        const group = videos.filter((video) => video.category === cat && !featuredIds.has(video.id))
        if (!group.length) return null
        return (
          <section className="stack" key={cat}>
            <div className="video-category-title">{cat}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {group.map(renderVideoCard)}
            </div>
          </section>
        )
      })}
    </div>
  )
}
