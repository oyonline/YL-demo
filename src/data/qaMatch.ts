import type { PresetQA } from './qa'

/** 用可解释的主题词路由医疗问答；只要与某条预设主题明显相关就命中。 */
export function matchPresetQuestion(input: string, presets: PresetQA[]): PresetQA | null {
  const normalize = (text: string) => text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s，。！？、；：,.!?;:'"“”‘’（）()《》【】]+/g, '')

  const text = normalize(input)
  const exact = presets.find((q) => normalize(q.question) === text)
  if (exact) return exact

  const hasAny = (words: string[]) => words.some((word) => text.includes(word))
  const presetById = (id: string) => presets.find((q) => q.id === id) ?? null

  // 误吸相关表现具有更高紧急性；一句话同时出现多类症状时优先给急救答案。
  if (hasAny(['误吸', '呛咳', '呛到', '呼吸困难', '口唇发绀', '嘴唇发紫', '气道', '缺氧', '吸氧', '口鼻流出营养液'])) {
    return presetById('tube-aspiration')
  }
  if (hasAny(['腹胀', '肚子胀', '肚胀', '胃胀', '胀气', '胃潴留', '胃动力不足', '肠道蠕动慢'])) {
    return presetById('tube-bloating')
  }
  if (hasAny(['小米南瓜粥', '南瓜小米粥', '南瓜小米', '南瓜粥', '小米粥'])) {
    return presetById('millet-pumpkin-porridge')
  }

  return null
}
