import { describe, expect, it } from 'vitest'
import { PRESET_QA } from '../src/data/qa.ts'
import { matchPresetQuestion } from '../src/data/qaMatch.ts'

describe('鼻饲三条预设问答匹配', () => {
  const match = (text: string) => matchPresetQuestion(text, PRESET_QA)?.id

  it.each([
    ['鼻饲老人出现腹胀可能是什么原因？', 'tube-bloating'],
    ['胃管喂食后肚子胀怎么办', 'tube-bloating'],
    ['腹胀', 'tube-bloating'],
    ['老人胃潴留怎么办', 'tube-bloating'],
    ['鼻饲老人发生误吸的表现和急救措施有哪些？', 'tube-aspiration'],
    ['管饲时呛咳呼吸困难怎么急救', 'tube-aspiration'],
    ['误吸怎么办', 'tube-aspiration'],
    ['嘴唇发紫而且缺氧', 'tube-aspiration'],
    ['小米南瓜粥的做法是什么？', 'millet-pumpkin-porridge'],
    ['南瓜小米粥怎么做', 'millet-pumpkin-porridge'],
    ['小米南瓜粥', 'millet-pumpkin-porridge'],
    ['南瓜粥怎么做', 'millet-pumpkin-porridge'],
    ['小米粥', 'millet-pumpkin-porridge'],
  ])('“%s”命中 %s', (input, id) => {
    expect(match(input)).toBe(id)
  })

  it('旧内置问答不再命中', () => {
    expect(match('今天血压高，要不要多吃一片药')).toBeUndefined()
    expect(match('鼻饲胃管多久更换一次？')).toBeUndefined()
  })

  it('只有共用的鼻饲词时不猜答案', () => {
    expect(match('鼻饲老人怎么办')).toBeUndefined()
  })

  it('同时出现腹胀和误吸表现时优先返回急救答案', () => {
    expect(match('鼻饲后腹胀并且呛咳')).toBe('tube-aspiration')
  })
})
