/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 外框的面板布局：哪块面板停在哪一栏、先后、显隐、收成标题条、浮出的小窗位置，以及三栏的大小。
// 纯数据与纯函数，不碰 DOM。外框按它排版，改了就派发改完的整份；设计器把它存进设置的 layout.panels。

import type { DesignerSettingsPolicy } from '../settings/model'
import type { DesignerFrameRegion } from './types'

/** 能停靠的三栏：中间一行的左、右，中间一列的下方。 */
export type DesignerLayoutDock = 'start' | 'end' | 'bottom'

/** 三栏，按这个顺序列。 */
export const DESIGNER_LAYOUT_DOCKS: readonly DesignerLayoutDock[] = ['start', 'end', 'bottom']

/** 布局的版本：形状变了就升，读到不认识的版本按缺省布局处理。 */
export const DESIGNER_LAYOUT_VERSION = 1

/** 浮出的小窗：左上角相对外框左上角的像素位置与像素大小。 */
export interface DesignerLayoutRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** 三栏的大小（百分比），以及同一栏里各面板分到的份额（百分比，键为面板 id）。 */
export interface DesignerLayoutSizes {
  readonly start?: number
  readonly end?: number
  readonly bottom?: number
  readonly panels?: Readonly<Record<string, number>>
}

/** 设计器的面板布局；version 以外的字段都可以不写，没写的取缺省布局。 */
export interface DesignerLayout {
  readonly version: typeof DESIGNER_LAYOUT_VERSION
  /** 三栏里各面板的先后；浮出的面板也留在原来的栏里，记着吸回去的位置。没列到的面板按缺省位置排在那一栏的后面。 */
  readonly docks?: Readonly<Partial<Record<DesignerLayoutDock, readonly string[]>>>
  /** 隐藏的面板，含画布上的浮动件。 */
  readonly hidden?: readonly string[]
  /** 收成标题条的面板。 */
  readonly minimized?: readonly string[]
  /** 浮出的面板与小窗的位置、大小。 */
  readonly floating?: Readonly<Record<string, DesignerLayoutRect>>
  readonly sizes?: DesignerLayoutSizes
  /** 在分隔条上收起的栏。 */
  readonly collapsed?: readonly DesignerLayoutDock[]
}

/** 合成以后的整份布局：每个字段都在，只含登记着、宿主没藏掉的面板。可以直接当 DesignerLayout 存。 */
export interface ResolvedDesignerLayout {
  readonly version: typeof DESIGNER_LAYOUT_VERSION
  readonly docks: Readonly<Record<DesignerLayoutDock, readonly string[]>>
  readonly hidden: readonly string[]
  readonly minimized: readonly string[]
  readonly floating: Readonly<Record<string, DesignerLayoutRect>>
  readonly sizes: DesignerLayoutSizes
  readonly collapsed: readonly DesignerLayoutDock[]
}

/** 宿主对布局的管控：locked 整份布局只读；panels 逐块面板，hidden 这块面板不存在，locked 这块面板固定。 */
export interface DesignerLayoutPolicy {
  readonly locked?: boolean
  readonly panels?: Readonly<Record<string, 'hidden' | 'locked'>>
}

/** 设置里存布局的键。 */
export const DESIGNER_LAYOUT_SETTING_KEY = 'layout.panels'

/** 这个区是不是能停靠的面板：位置是左、右或下。 */
export function isDesignerDockRegion(region: Pick<DesignerFrameRegion, 'position'>): region is DesignerFrameRegion & { readonly position: DesignerLayoutDock } {
  return region.position === 'start' || region.position === 'end' || region.position === 'bottom'
}

/** 这个区是不是画布浮动件。 */
export function isDesignerOverlayRegion(region: Pick<DesignerFrameRegion, 'position'>): boolean {
  return region.position === 'overlay'
}

/** 面板此刻能做的事：没有面板头的区（没给 title）不能挪、浮出、收起。 */
export interface DesignerPanelAbilities {
  readonly closable: boolean
  readonly movable: boolean
  readonly floatable: boolean
  readonly minimizable: boolean
}

/** 按区的登记与宿主管控算出一块面板能做的事。 */
export function designerPanelAbilities(region: DesignerFrameRegion, policy?: DesignerLayoutPolicy): DesignerPanelAbilities {
  const fixed = policy?.locked === true || policy?.panels?.[region.name] === 'locked'
  const card = isDesignerDockRegion(region) && region.title !== undefined
  return {
    closable: !fixed && region.closable !== false,
    movable: !fixed && card && region.movable !== false,
    floatable: !fixed && card && region.floatable !== false,
    minimizable: !fixed && card && region.minimizable !== false,
  }
}

/** 从设置的管控换算布局的管控：layout.panels 或整个 layout 分区被藏或锁时整份只读，layout.panels.<id> 管一块面板。 */
export function designerLayoutPolicy(policy: DesignerSettingsPolicy | undefined): DesignerLayoutPolicy {
  if (policy === undefined)
    return {}
  const prefix = `${DESIGNER_LAYOUT_SETTING_KEY}.`
  const panels: Record<string, 'hidden' | 'locked'> = {}
  for (const [key, value] of Object.entries(policy)) {
    if (key.startsWith(prefix) && key.length > prefix.length)
      panels[key.slice(prefix.length)] = value
  }
  const locked = policy[DESIGNER_LAYOUT_SETTING_KEY] !== undefined || policy.layout !== undefined
  return {
    ...(locked ? { locked: true } : {}),
    ...(Object.keys(panels).length > 0 ? { panels } : {}),
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPositive(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function isRect(value: unknown): value is DesignerLayoutRect {
  if (typeof value !== 'object' || value === null)
    return false
  const rect = value as Record<string, unknown>
  return isFiniteNumber(rect.x) && isFiniteNumber(rect.y) && isPositive(rect.width) && isPositive(rect.height)
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

/** 登记着、宿主没藏掉的面板：能停靠的与画布浮动件，按登记顺序。 */
interface PanelSet {
  readonly docked: ReadonlyMap<string, DesignerFrameRegion & { readonly position: DesignerLayoutDock }>
  readonly overlays: ReadonlyMap<string, DesignerFrameRegion>
  readonly all: ReadonlyMap<string, DesignerFrameRegion>
}

function panelSet(regions: readonly DesignerFrameRegion[], policy: DesignerLayoutPolicy | undefined): PanelSet {
  const docked = new Map<string, DesignerFrameRegion & { readonly position: DesignerLayoutDock }>()
  const overlays = new Map<string, DesignerFrameRegion>()
  const all = new Map<string, DesignerFrameRegion>()
  for (const region of regions) {
    if (policy?.panels?.[region.name] === 'hidden' || all.has(region.name))
      continue
    if (isDesignerDockRegion(region))
      docked.set(region.name, region)
    else if (isDesignerOverlayRegion(region))
      overlays.set(region.name, region)
    else
      continue
    all.set(region.name, region)
  }
  return { docked, overlays, all }
}

/** 把一份可能残缺、过期或不合法的布局收成整份：认不得的 id 去掉，没列到的面板补到 fallback 的位置上。 */
function settle(panels: PanelSet, raw: Partial<DesignerLayout> | undefined, fallback: ResolvedDesignerLayout | undefined): ResolvedDesignerLayout {
  const docks: Record<DesignerLayoutDock, string[]> = { start: [], end: [], bottom: [] }
  const placed = new Set<string>()
  const homeOf = (id: string): DesignerLayoutDock => {
    if (fallback) {
      for (const dock of DESIGNER_LAYOUT_DOCKS) {
        if (fallback.docks[dock].includes(id))
          return dock
      }
    }
    return panels.docked.get(id)!.position
  }
  const rawDocks = raw?.docks
  if (rawDocks !== undefined && typeof rawDocks === 'object') {
    for (const dock of DESIGNER_LAYOUT_DOCKS) {
      for (const id of stringList(rawDocks[dock])) {
        const region = panels.docked.get(id)
        if (region === undefined || placed.has(id))
          continue
        // 不能挪的面板只认它缺省的那一栏
        const target = region.title === undefined || region.movable === false ? homeOf(id) : dock
        docks[target].push(id)
        placed.add(id)
      }
    }
  }
  const order = fallback ? DESIGNER_LAYOUT_DOCKS.flatMap(dock => fallback.docks[dock]) : [...panels.docked.keys()]
  for (const id of order) {
    if (!placed.has(id) && panels.docked.has(id)) {
      docks[homeOf(id)].push(id)
      placed.add(id)
    }
  }
  for (const id of panels.docked.keys()) {
    if (!placed.has(id))
      docks[homeOf(id)].push(id)
  }
  const pick = <T>(key: keyof DesignerLayout, read: () => T, inherited: T | undefined, empty: T): T =>
    raw !== undefined && raw[key] !== undefined ? read() : (inherited ?? empty)
  const hidden = pick('hidden', () => [...new Set(stringList(raw!.hidden))].filter(id => panels.all.has(id) && panels.all.get(id)!.closable !== false), fallback?.hidden, [] as string[])
  const minimized = pick('minimized', () => [...new Set(stringList(raw!.minimized))].filter((id) => {
    const region = panels.docked.get(id)
    return region !== undefined && region.title !== undefined && region.minimizable !== false
  }), fallback?.minimized, [] as string[])
  const floating = pick('floating', () => {
    const entries: [string, DesignerLayoutRect][] = []
    const source = raw!.floating
    if (typeof source === 'object' && source !== null) {
      for (const [id, rect] of Object.entries(source)) {
        const region = panels.docked.get(id)
        if (region !== undefined && region.title !== undefined && region.floatable !== false && isRect(rect))
          entries.push([id, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }])
      }
    }
    return Object.fromEntries(entries)
  }, fallback?.floating, {} as Record<string, DesignerLayoutRect>)
  const sizes = pick('sizes', () => {
    const source = (typeof raw!.sizes === 'object' && raw!.sizes !== null ? raw!.sizes : {}) as DesignerLayoutSizes
    const next: { start?: number, end?: number, bottom?: number, panels?: Record<string, number> } = {}
    for (const dock of DESIGNER_LAYOUT_DOCKS) {
      if (isPositive(source[dock]))
        next[dock] = source[dock]
    }
    const shares = typeof source.panels === 'object' && source.panels !== null
      ? Object.entries(source.panels).filter(([id, value]) => panels.docked.has(id) && isPositive(value))
      : []
    if (shares.length > 0)
      next.panels = Object.fromEntries(shares)
    return next
  }, fallback?.sizes, {} as DesignerLayoutSizes)
  const collapsed = pick('collapsed', () => [...new Set(stringList(raw!.collapsed))].filter((dock): dock is DesignerLayoutDock => (DESIGNER_LAYOUT_DOCKS as readonly string[]).includes(dock)), fallback?.collapsed, [] as DesignerLayoutDock[])
  return { version: DESIGNER_LAYOUT_VERSION, docks, hidden, minimized, floating, sizes, collapsed }
}

/** 读到的布局能不能用：不是对象、版本不对的一律当没写。 */
function usable(layout: DesignerLayout | undefined): DesignerLayout | undefined {
  return typeof layout === 'object' && layout !== null && layout.version === DESIGNER_LAYOUT_VERSION ? layout : undefined
}

/**
 * 缺省布局：各面板按登记顺序停在登记的位置上，defaultHidden 的隐藏；宿主给了 defaults 时，它写了的字段整项覆盖内置缺省。
 */
export function defaultDesignerLayout(regions: readonly DesignerFrameRegion[], defaults?: DesignerLayout, policy?: DesignerLayoutPolicy): ResolvedDesignerLayout {
  const panels = panelSet(regions, policy)
  const builtin = settle(panels, {
    hidden: [...panels.all.values()].filter(region => region.defaultHidden === true).map(region => region.name),
  }, undefined)
  const host = usable(defaults)
  return host === undefined ? builtin : settle(panels, host, builtin)
}

/** 这一刻的整份布局：layout 写了的字段整项覆盖缺省布局，认不得的 id 去掉，没列到的面板按缺省位置补上。 */
export function resolveDesignerLayout(regions: readonly DesignerFrameRegion[], layout?: DesignerLayout, defaults?: DesignerLayout, policy?: DesignerLayoutPolicy): ResolvedDesignerLayout {
  const base = defaultDesignerLayout(regions, defaults, policy)
  const own = usable(layout)
  return own === undefined ? base : settle(panelSet(regions, policy), own, base)
}

/** 两份布局是不是同一份。 */
export function designerLayoutEquals(a: DesignerLayout | undefined, b: DesignerLayout | undefined): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** 这块面板此刻停在哪一栏；不是能停靠的面板时为 undefined。 */
export function designerPanelDock(layout: ResolvedDesignerLayout, id: string): DesignerLayoutDock | undefined {
  return DESIGNER_LAYOUT_DOCKS.find(dock => layout.docks[dock].includes(id))
}

function without(list: readonly string[], id: string): string[] {
  return list.filter(item => item !== id)
}

/** 显示或隐藏一块面板。 */
export function withDesignerPanelVisible(layout: ResolvedDesignerLayout, id: string, visible: boolean): ResolvedDesignerLayout {
  const hidden = without(layout.hidden, id)
  return { ...layout, hidden: visible ? hidden : [...hidden, id] }
}

/** 把一块面板停到某一栏的第 index 位（缺省末尾），浮着的一并吸回；它在这一栏的份额去掉，按其余面板重分。 */
export function withDesignerPanelMoved(layout: ResolvedDesignerLayout, id: string, dock: DesignerLayoutDock, index?: number): ResolvedDesignerLayout {
  const docks = { start: without(layout.docks.start, id), end: without(layout.docks.end, id), bottom: without(layout.docks.bottom, id) }
  const target = docks[dock]
  const at = index === undefined ? target.length : Math.max(0, Math.min(Math.trunc(index), target.length))
  target.splice(at, 0, id)
  const { [id]: _floating, ...floating } = layout.floating
  const { [id]: _share, ...shares } = layout.sizes.panels ?? {}
  const sizes: DesignerLayoutSizes = { ...layout.sizes, panels: shares }
  if (Object.keys(shares).length === 0) {
    const { panels: _panels, ...rest } = sizes
    return { ...layout, docks, floating, sizes: rest }
  }
  return { ...layout, docks, floating, sizes }
}

/** 收成标题条或展开。 */
export function withDesignerPanelMinimized(layout: ResolvedDesignerLayout, id: string, minimized: boolean): ResolvedDesignerLayout {
  const rest = without(layout.minimized, id)
  return { ...layout, minimized: minimized ? [...rest, id] : rest }
}

/** 浮出成小窗（顺带显示出来）；rect 不给即吸回原来的栏。 */
export function withDesignerPanelFloating(layout: ResolvedDesignerLayout, id: string, rect: DesignerLayoutRect | undefined): ResolvedDesignerLayout {
  const { [id]: _previous, ...floating } = layout.floating
  if (rect === undefined)
    return { ...layout, floating }
  return { ...layout, hidden: without(layout.hidden, id), floating: { ...floating, [id]: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } } }
}

/** 记下一栏的大小与它在分隔条上收没收起；size 不给时只改收起状态。 */
export function withDesignerDockSize(layout: ResolvedDesignerLayout, dock: DesignerLayoutDock, size: number | undefined, collapsed: boolean): ResolvedDesignerLayout {
  const sizes = isPositive(size) ? { ...layout.sizes, [dock]: size } : layout.sizes
  const rest = layout.collapsed.filter(item => item !== dock)
  return { ...layout, sizes, collapsed: collapsed ? [...rest, dock] : rest }
}

/** 记下同一栏里各面板分到的份额。 */
export function withDesignerPanelShares(layout: ResolvedDesignerLayout, shares: Readonly<Record<string, number>>): ResolvedDesignerLayout {
  return { ...layout, sizes: { ...layout.sizes, panels: { ...layout.sizes.panels, ...shares } } }
}
