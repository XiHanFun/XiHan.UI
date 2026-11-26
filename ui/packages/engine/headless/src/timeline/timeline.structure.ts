/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间线的标准结构：按 collection 一条一个条目铺出事件流。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { timelineAnatomy } from './timeline.anatomy'
import type { TimelineApi, TimelineNodeMeta } from './timeline.types'

type TimelinePart = (typeof timelineAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TIMELINE_STRUCTURE_PARTS = [
  'item',
  'label',
  'indicator',
  'connector',
  'content',
  'time',
  'title',
  'description',
] as const satisfies readonly TimelinePart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const TIMELINE_STRUCTURE_OMITS = [] as const satisfies readonly TimelinePart[]

type TimelineNode = StructureNode<(typeof TIMELINE_STRUCTURE_PARTS)[number]>

/** 内容里的三块，次序是时刻、标题、说明，给了哪一项才铺哪一块；机读时间写在 time 上。 */
function contentStructure(meta: TimelineNodeMeta): TimelineNode[] {
  const out: TimelineNode[] = []
  if (meta.time != null) {
    out.push(meta.datetime != null
      ? { key: 'time', tag: 'time', part: 'time', attrs: { datetime: meta.datetime }, text: meta.time }
      : { key: 'time', tag: 'time', part: 'time', text: meta.time })
  }
  if (meta.title != null)
    out.push({ key: 'title', tag: 'div', part: 'title', text: meta.title })
  if (meta.description != null)
    out.push({ key: 'description', tag: 'div', part: 'description', text: meta.description })
  return out
}

/** 一条事件：坐标列（给了 label 才铺）、圆点、连线、内容；语气写在条目上，圆点从条目取。 */
function itemStructure(meta: TimelineNodeMeta): TimelineNode {
  const children: TimelineNode[] = []
  if (meta.label != null)
    children.push({ key: 'label', tag: 'div', part: 'label', text: meta.label })
  children.push(
    { key: 'indicator', tag: 'span', part: 'indicator' },
    { key: 'connector', tag: 'span', part: 'connector' },
    { key: 'content', tag: 'div', part: 'content', children: contentStructure(meta) },
  )
  const base = { key: `item:${meta.value}`, tag: 'li', part: 'item', children } as const
  return meta.tone == null ? base : { ...base, attrs: { tone: meta.tone } }
}

/**
 * 时间线在 root（有序列表）里的标准结构：collection 的每一条一个 li，按数据顺序排。
 * 末一条的连线照铺，由皮肤收起。
 */
export function timelineStructure(model: Pick<TimelineApi, 'collection'>): TimelineNode[] {
  return model.collection.map(itemStructure)
}
