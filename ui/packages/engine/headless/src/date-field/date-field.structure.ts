/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期输入框的标准结构：标题，盒里按段序铺的段与段间分隔符、清空按钮，表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { dateFieldAnatomy } from './date-field.anatomy'
import type { DateFieldApi, DateSegmentType } from './date-field.types'

type DateFieldPart = (typeof dateFieldAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const DATE_FIELD_STRUCTURE_PARTS = [
  'label',
  'control',
  'segment-group',
  'segment',
  'clear-trigger',
  'hidden-input',
] as const satisfies readonly DateFieldPart[]

/** anatomy 里不进标准结构的部件。 */
export const DATE_FIELD_STRUCTURE_OMITS = [] as const satisfies readonly DateFieldPart[]

type DateFieldStructurePart = (typeof DATE_FIELD_STRUCTURE_PARTS)[number]

type DateFieldNode = StructureNode<DateFieldStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface DateFieldStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

const DATE_PART_TYPES: ReadonlySet<DateSegmentType> = new Set(['year', 'quarter', 'month', 'week', 'day'])
const TIME_PART_TYPES: ReadonlySet<DateSegmentType> = new Set(['hour', 'minute', 'second'])

/** 一个 locale 里相邻两段之间的分隔符：键是「前一段>后一段」，另带日期段、时刻段各自通用的那个。 */
interface LocaleLiterals {
  readonly pairs: ReadonlyMap<string, string>
  readonly date: string
  readonly time: string
}

const LITERAL_PROBE = Date.UTC(2026, 10, 27, 13, 45, 30)
const LITERAL_CACHE = new Map<string, LocaleLiterals>()

/** 分隔符从 Intl 现问：把年月日时分秒整串格式化一遍，取相邻两段之间的那段文字。 */
function localeLiterals(locale: string): LocaleLiterals {
  const cached = LITERAL_CACHE.get(locale)
  if (cached)
    return cached
  const pairs = new Map<string, string>()
  let date = '/'
  let time = ':'
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZone: 'UTC',
    }).formatToParts(LITERAL_PROBE)
    for (let i = 1; i + 1 < parts.length; i++) {
      const [before, literal, after] = [parts[i - 1]!, parts[i]!, parts[i + 1]!]
      if (literal.type !== 'literal')
        continue
      pairs.set(`${before.type}>${after.type}`, literal.value)
      if (DATE_PART_TYPES.has(before.type as DateSegmentType) && DATE_PART_TYPES.has(after.type as DateSegmentType))
        date = literal.value
      else if (TIME_PART_TYPES.has(before.type as DateSegmentType) && TIME_PART_TYPES.has(after.type as DateSegmentType))
        time = literal.value
    }
  }
  catch {
    // 语言标记写坏了时 Intl 会抛，退回通用的斜杠与冒号
  }
  const literals = { pairs, date, time }
  LITERAL_CACHE.set(locale, literals)
  return literals
}

/** 前后两段之间的分隔符：locale 里两段相邻就用它们之间那段文字，否则日期段之间用日期的、时刻段之间用时刻的，其余是空格。 */
function literalBetween(literals: LocaleLiterals, before: DateSegmentType, after: DateSegmentType): string {
  const direct = literals.pairs.get(`${before}>${after}`)
  if (direct !== undefined)
    return direct
  if (DATE_PART_TYPES.has(before) && DATE_PART_TYPES.has(after))
    return literals.date
  if (TIME_PART_TYPES.has(before) && TIME_PART_TYPES.has(after))
    return literals.time
  return ' '
}

/**
 * 日期输入框在 root 里的标准结构，次序是标题、盒、表单影子。
 * 盒里是段组与清空按钮（清不了时由组件收起）；段组里按当前段序铺段，段与段之间是按 locale 取的分隔符文字。
 */
export function dateFieldStructure(model: Pick<DateFieldApi, 'segments' | 'locale'>, options: DateFieldStructureOptions = {}): DateFieldNode[] {
  const literals = localeLiterals(model.locale)
  const group: StructureChild<DateFieldStructurePart>[] = []
  model.segments.forEach((segment, i) => {
    const previous = model.segments[i - 1]
    if (previous)
      group.push({ key: `literal:${previous.type}`, literal: literalBetween(literals, previous.type, segment.type) })
    group.push({ key: `segment:${segment.type}`, tag: 'div', part: 'segment', attrs: { index: String(segment.index) } })
  })
  const nodes: DateFieldNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: [
        { key: 'segment-group', tag: 'div', part: 'segment-group', children: group },
        { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' },
      ],
    },
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
  )
  return nodes
}
