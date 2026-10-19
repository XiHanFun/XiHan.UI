/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 物料来源：扩展往物料面板里加的几组（如专业版的「我的物料」、行业模板）。各款把内置分组与各来源现取的分组合起来交给
// 物料面板；条目被激活或拖到画布上放下时，先看它属不属于某个来源，属于就交给那个来源的 insert，否则照旧插入自己的种类。

import type { DesignerPaletteGroup, DesignerPaletteItem } from './palette-element'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'

/** 物料来源。At 是各款的落点信息（如流程的画布坐标、打印的页与带区），只在 insert 里透传。 */
export interface DesignerPaletteSource<Ctx = unknown, At = unknown> {
  /** 全局唯一，写法同命令 id；不能与别的扩展的物料来源重名。 */
  readonly id: string
  /** 先后：各款内置的分组在前，来源按 order 排在后面，不写按 100；同值按登记顺序。 */
  readonly order?: number
  /** 这一来源此刻的分组；各款每轮刷新现取。组 id 与条目 id（含下级）在整个物料面板里唯一。 */
  readonly groups: (context: Ctx) => readonly DesignerPaletteGroup[]
  /** 这一来源的条目被激活（点按、回车）或拖到画布上放下；at 是放下处，激活时没有。插入怎么做由来源自己定。 */
  readonly insert: (item: DesignerPaletteItem, context: Ctx, at?: At) => void
}

/** 物料面板此刻的分组，以及按条目 id 交给来源插入。 */
export interface DesignerPaletteView<Ctx = unknown, At = unknown> {
  /** 内置的分组在前，各来源的接在后面。 */
  readonly groups: readonly DesignerPaletteGroup[]
  /** 条目（含下级）属于某个来源时交给它的 insert 并返回 true；内置条目返回 false，由各款照旧插入。 */
  readonly insert: (itemId: string, context: Ctx, at?: At) => boolean
}

/** 没写 order 的来源排在这里。 */
const DEFAULT_ORDER = 100

/**
 * 合起各来源（{ id, paletteSources? }，扩展的 paletteSources 字段就是这个形状）的物料来源，按 order 排、同值保持登记顺序。
 * 来源 id 重名时抛 DesignerExtensionError，名字空间 palette-source。
 */
export function collectPaletteSources<Ctx, At>(
  sources: readonly { readonly id: string, readonly paletteSources?: readonly DesignerPaletteSource<Ctx, At>[] }[],
): DesignerPaletteSource<Ctx, At>[] {
  const owners = new Map<string, string>()
  const list: DesignerPaletteSource<Ctx, At>[] = []
  for (const source of sources) {
    for (const palette of source.paletteSources ?? []) {
      const owner = owners.get(palette.id)
      if (owner !== undefined)
        throw new DesignerExtensionError('palette-source', palette.id, [owner, source.id])
      owners.set(palette.id, source.id)
      list.push(palette)
    }
  }
  return list
    .map((palette, index) => ({ palette, index }))
    .sort((a, b) => (a.palette.order ?? DEFAULT_ORDER) - (b.palette.order ?? DEFAULT_ORDER) || a.index - b.index)
    .map(entry => entry.palette)
}

/**
 * 合成物料面板此刻的分组：builtin 是各款内置的，各来源（collectPaletteSources 排好的）按上下文现取的分组接在后面。
 * 组 id 或条目 id（含下级）重名时抛 TypeError：重名的条目分不清该交给谁插入。
 */
export function resolvePaletteSources<Ctx, At>(
  builtin: readonly DesignerPaletteGroup[],
  sources: readonly DesignerPaletteSource<Ctx, At>[],
  context: Ctx,
): DesignerPaletteView<Ctx, At> {
  const groupIds = new Set<string>()
  const itemIds = new Set<string>()
  const owned = new Map<string, { readonly source: DesignerPaletteSource<Ctx, At>, readonly item: DesignerPaletteItem }>()
  const claim = (items: readonly DesignerPaletteItem[], source: DesignerPaletteSource<Ctx, At> | undefined): void => {
    for (const item of items) {
      if (itemIds.has(item.id))
        throw new TypeError(`[xh] 物料面板里的条目 ${item.id} 重名${source ? `（物料来源 ${source.id}）` : ''}`)
      itemIds.add(item.id)
      if (source)
        owned.set(item.id, { source, item })
      claim(item.children ?? [], source)
    }
  }
  const groups: DesignerPaletteGroup[] = []
  const add = (group: DesignerPaletteGroup, source: DesignerPaletteSource<Ctx, At> | undefined): void => {
    if (groupIds.has(group.id))
      throw new TypeError(`[xh] 物料面板里的分组 ${group.id} 重名${source ? `（物料来源 ${source.id}）` : ''}`)
    groupIds.add(group.id)
    claim(group.items, source)
    groups.push(group)
  }
  for (const group of builtin)
    add(group, undefined)
  for (const source of sources) {
    for (const group of source.groups(context))
      add(group, source)
  }
  return {
    groups,
    insert: (itemId, insertContext, at) => {
      const entry = owned.get(itemId)
      if (entry === undefined)
        return false
      entry.source.insert(entry.item, insertContext, at)
      return true
    },
  }
}
