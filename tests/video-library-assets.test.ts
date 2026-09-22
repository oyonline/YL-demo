import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FEATURED_VIDEO_IDS, videos } from '../src/data/seed.ts'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('康复训练视频库新增素材', () => {
  it('四条新增视频按确认顺序置顶，且总数为 21 条', () => {
    expect(videos).toHaveLength(21)
    expect(FEATURED_VIDEO_IDS).toEqual([
      'v-swallow-training',
      'v-limb-rehab-exercise',
      'v-fruit-meal',
      'v-tube-feeding',
    ])
    expect(FEATURED_VIDEO_IDS.map((id) => videos.find((video) => video.id === id)?.title)).toEqual([
      '吞咽训练',
      '肢体康复训练操',
      '水果餐制作',
      '鼻饲管进食',
    ])
  })

  it('视频和缩略图均已进仓，MP4 使用 H.264 浏览器兼容编码', () => {
    for (const id of FEATURED_VIDEO_IDS) {
      const video = videos.find((candidate) => candidate.id === id)
      expect(video?.src).toBe(`/videos/${id}.mp4`)
      expect(video?.poster).toBe(`/posters/${id}.jpg`)
      expect(video?.goal).toBeUndefined()
      expect(video?.cautions).toBeUndefined()

      const videoPath = join(projectRoot, 'public', video!.src!)
      const posterPath = join(projectRoot, 'public', video!.poster!)
      expect(statSync(videoPath).size).toBeGreaterThan(100_000)
      expect(statSync(posterPath).size).toBeGreaterThan(1_000)

      const mp4Header = readFileSync(videoPath).subarray(0, 200_000)
      expect(mp4Header.subarray(4, 8).toString('ascii')).toBe('ftyp')
      expect(mp4Header.includes(Buffer.from('avc1'))).toBe(true)
      expect(mp4Header.includes(Buffer.from('hvc1'))).toBe(false)
      expect([...readFileSync(posterPath).subarray(0, 3)]).toEqual([255, 216, 255])
    }
  })
})
