import type { PresetQA } from './qa'

/** 用可解释的关键词组合路由医疗问答；无法唯一判断时安全回退。 */
export function matchPresetQuestion(input: string, presets: PresetQA[]): PresetQA | null {
  const normalize = (text: string) => text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s，。！？、；：,.!?;:'"“”‘’（）()《》【】]+/g, '')

  const text = normalize(input)
  const exact = presets.find((q) => normalize(q.question) === text)
  if (exact) return exact

  const hasAny = (words: string[]) => words.some((word) => text.includes(word))
  const mentionsTube = hasAny(['鼻饲', '胃管', '鼻胃管', '管饲'])

  if (mentionsTube && hasAny(['腹胀', '肚子胀', '胀气'])) {
    return presets.find((q) => q.id === 'tube-bloating') ?? null
  }
  if (mentionsTube && hasAny(['误吸', '呛咳', '呼吸困难', '口唇发绀', '急救'])) {
    return presets.find((q) => q.id === 'tube-aspiration') ?? null
  }
  if (hasAny(['小米南瓜粥', '南瓜小米粥']) && hasAny(['做法', '怎么做', '如何做', '制作'])) {
    return presets.find((q) => q.id === 'millet-pumpkin-porridge') ?? null
  }

  return null
}
