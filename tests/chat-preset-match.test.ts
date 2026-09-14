import { describe, expect, it } from 'vitest'
import { PRESET_QA } from '../src/data/qa.ts'
import { matchPresetQuestion } from '../src/data/qaMatch.ts'

describe('王萍奶奶新增预设问答匹配', () => {
  const match = (text: string) => matchPresetQuestion(text, PRESET_QA)?.id

  it.each([
    ['奶奶突发高血压，该如何处理？', 'hypertensive-crisis'],
    ['血压突然特别高怎么办', 'hypertensive-crisis'],
    ['血压190/110怎么办', 'hypertensive-crisis'],
    ['血压170/125如何处理', 'hypertensive-crisis'],
    ['降压药怎么通过鼻饲给药？', 'tube-medication'],
    ['胃管里如何给药', 'tube-medication'],
    ['奶奶日常可以做哪些肢体康复训练？', 'limb-rehab'],
    ['脑卒中后上肢怎么做康复训练', 'limb-rehab'],
    ['鼻饲胃管多久更换一次？', 'ng-tube-change'],
    ['鼻胃管多长时间换一次', 'ng-tube-change'],
  ])('“%s”命中 %s', (input, id) => {
    expect(match(input)).toBe(id)
  })

  it('高血压加药仍命中原有用药问题', () => {
    expect(match('今天血压高，要不要多吃一片药')).toBe('bp-high')
  })

  it('没有危急语义的普通血压问法不误判为急症', () => {
    expect(match('今天血压高了怎么办')).toBe('bp-high')
  })
})
