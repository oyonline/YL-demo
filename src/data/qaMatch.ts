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

  const byId = (id: string) => presets.find((q) => q.id === id) ?? null
  const hasAny = (words: string[]) => words.some((word) => text.includes(word))
  const mentionsBloodPressure = hasAny(['血压', '高压', '低压'])
  const mentionsMedicine = hasAny(['药', '药片', '剂量', '加量', '减量', '多吃一片'])
  const mentionsTube = hasAny(['鼻饲', '胃管', '鼻胃管', '管饲'])
  const reading = input.match(/(\d{2,3})\s*[/／]\s*(\d{2,3})/)
  const isCrisisReading = reading ? Number(reading[1]) > 180 || Number(reading[2]) > 120 : false

  if (mentionsTube && mentionsMedicine && hasAny(['怎么给', '如何给', '给药', '服药', '吃药', '降压药'])) return byId('tube-medication')
  if (mentionsTube && hasAny(['多久换', '多久更换', '多长时间换', '更换一次', '换一次', '更换周期', '到期'])) return byId('ng-tube-change')
  if (mentionsBloodPressure && (isCrisisReading || hasAny(['突发', '突然', '骤升', '很高', '特别高', '紧急']))) return byId('hypertensive-crisis')
  if (mentionsBloodPressure && mentionsMedicine) return byId('bp-high')

  if (hasAny(['呛咳', '呛到', '呛着', '噎住', '噎到'])) return byId('choking')
  const asksAboutMeals = hasAny(['三餐', '早餐', '午餐', '晚餐', '饮食', '食谱', '菜单', '吃什么', '怎么吃', '吃点什么', '食物', '软食', '低盐'])
  if (asksAboutMeals && !mentionsMedicine) return byId('meals')
  if (hasAny(['吞咽不好', '吞咽困难', '喝水呛', '饮水呛', '总是咳'])) return byId('choking')

  const currentBloodPressureConcern = mentionsBloodPressure && hasAny(['今天', '现在', '刚才', '刚刚', '量血压', '测血压', '比平时高', '升高', '高了'])
  if (currentBloodPressureConcern) return byId('bp-high')

  const trainingConcern = hasAny(['训练', '锻炼', '康复'])
  if (trainingConcern && hasAny(['太累', '累了', '疲劳', '做不动', '没力气', '不想做'])) return byId('too-tired')
  const legConcern = hasAny(['腿', '下肢', '大腿', '小腿']) && hasAny(['酸', '酸痛', '疼', '疼痛'])
  if (trainingConcern && legConcern) return byId('sore-legs')
  if (trainingConcern && hasAny(['哪些', '什么训练', '怎么练', '如何练', '日常', '肢体', '上肢', '下肢'])) return byId('limb-rehab')

  return null
}
