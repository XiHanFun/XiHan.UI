/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 一次块渲染要带着走的东西：链接定义、扩展开关、脚注编号与本块收集到的行内挂点。

import type { LinkDefs } from './refs'
import type { RenderedInline } from './types'

export interface RenderContext {
  readonly defs: LinkDefs
  /** 正文里裸写的 http(s):// 与 www. 地址是否成为链接（GFM 扩展自动链接）。 */
  readonly bareLinks: boolean
  /** 脚注锚点 id 的前缀，同一页上的几段正文各用各的。 */
  readonly idPrefix: string
  /** 脚注标签到序号，按首次引用的先后分配；渲染途中往里添。 */
  readonly footnotes: Map<string, number>
  /** 已经出过角标的脚注标签：只有首次引用带回链要找的 id，同一页上 id 不重复。 */
  readonly referenced: Set<string>
  /** 本块产出的行内挂点，按在 html 里出现的先后排；下标写在占位节点的 data-md-inline 上。 */
  readonly inlines: RenderedInline[]
}

/** 脚注标签落进 id 时只留字母、数字、下划线与短横，其余换成短横。 */
export function footnoteSlug(label: string): string {
  return label.replace(/[^\p{L}\p{N}_-]/gu, '-')
}

/** 取某个脚注标签的序号，没有就按先后分配下一个。 */
export function footnoteNumber(ctx: RenderContext, label: string): number {
  const known = ctx.footnotes.get(label)
  if (known !== undefined)
    return known
  const next = ctx.footnotes.size + 1
  ctx.footnotes.set(label, next)
  return next
}
