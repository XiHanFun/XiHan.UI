/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 无障碍模型：摘要、数据表与键盘遍历序。文案模板由调用方按语言提供，这里只算事实。

import type { DatumRef, Scene } from '../scene/types'
import { isPresent } from '../array/statistics'
import { invalidArgument } from '../errors'
import { sceneMarks } from '../scene/scene'

export interface SeriesPointInput {
  /** 自变量键：类目、数值或日期。 */
  readonly key: unknown
  readonly value: number | null | undefined
}

export interface SeriesInput {
  readonly id: string
  readonly name: string
  readonly points: readonly SeriesPointInput[]
}

export interface KeyedValue {
  readonly key: unknown
  readonly value: number
  /** 在该系列点序里的位置。 */
  readonly index: number
}

export interface SeriesSummary {
  readonly id: string
  readonly name: string
  /** 存在的值个数（缺失不计）。 */
  readonly count: number
  readonly min: KeyedValue | null
  readonly max: KeyedValue | null
  readonly first: KeyedValue | null
  readonly last: KeyedValue | null
  /** 首末变化率 last / first − 1；首值为 0 或少于两个值时为 null。 */
  readonly change: number | null
}

export interface ChartSummaryModel {
  readonly seriesCount: number
  /** 自变量范围：全部系列里第一个与最后一个键；没有点时为 null。 */
  readonly keys: { readonly first: unknown, readonly last: unknown, readonly count: number } | null
  readonly series: readonly SeriesSummary[]
}

/** 键的相等：日期按时间值，其余按值。 */
function keyId(key: unknown): unknown {
  return key instanceof Date ? key.valueOf() : key
}

/** 所有系列的键，按首次出现的次序去重。 */
function unionKeys(series: readonly SeriesInput[]): unknown[] {
  const seen = new Set<unknown>()
  const keys: unknown[] = []
  for (const s of series) {
    for (const point of s.points) {
      const id = keyId(point.key)
      if (!seen.has(id)) {
        seen.add(id)
        keys.push(point.key)
      }
    }
  }
  return keys
}

/** 摘要模型：系列数、自变量范围、各系列的最小值与最大值及其位置、首末值与变化率。最值相同时取先出现的。 */
export function buildSummaryModel(series: readonly SeriesInput[]): ChartSummaryModel {
  const keys = unionKeys(series)
  return {
    seriesCount: series.length,
    keys: keys.length > 0 ? { first: keys[0], last: keys[keys.length - 1], count: keys.length } : null,
    series: series.map((s) => {
      const present: KeyedValue[] = []
      s.points.forEach((point, index) => {
        if (isPresent(point.value))
          present.push({ key: point.key, value: point.value, index })
      })
      let min: KeyedValue | null = null
      let max: KeyedValue | null = null
      for (const p of present) {
        if (!min || p.value < min.value)
          min = p
        if (!max || p.value > max.value)
          max = p
      }
      const first = present[0] ?? null
      const last = present[present.length - 1] ?? null
      const change = first && last && present.length > 1 && first.value !== 0 ? last.value / first.value - 1 : null
      return { id: s.id, name: s.name, count: present.length, min, max, first, last, change }
    }),
  }
}

/** 按模板生成摘要文字；模板来自调用方的语言包。 */
export function summarize(series: readonly SeriesInput[], template: (model: ChartSummaryModel) => string): string {
  return template(buildSummaryModel(series))
}

export interface TableColumn {
  readonly id: string
  readonly label: string
}

export interface TableCell {
  /** 缺失时为 null。 */
  readonly value: unknown
  readonly text: string
}

export interface TableRow {
  readonly key: unknown
  readonly cells: readonly TableCell[]
}

export interface TableModel {
  readonly columns: readonly TableColumn[]
  readonly rows: readonly TableRow[]
}

export interface SeriesTableInput {
  /** 自变量列的列名。 */
  readonly keyLabel: string
  readonly series: readonly SeriesInput[]
  readonly formatKey?: (key: unknown) => string
  readonly formatValue?: (value: number, seriesId: string) => string
  /** 缺失值显示的文字。 */
  readonly missingText: string
}

/**
 * 系列数据表：第一列是自变量，其后每个系列一列；行是全部系列的键按首次出现的次序去重。
 * 数据表部件与作者自建的表格视图都用它。
 */
export function buildTableModel(input: SeriesTableInput): TableModel {
  const { series, formatKey = String, formatValue = (v: number) => String(v), missingText } = input
  const ids = new Set<string>()
  for (const s of series) {
    if (ids.has(s.id))
      throw invalidArgument('系列 id 重复', { id: s.id })
    ids.add(s.id)
  }
  const lookup = series.map((s) => {
    const map = new Map<unknown, number | null | undefined>()
    for (const point of s.points)
      map.set(keyId(point.key), point.value)
    return map
  })
  return {
    columns: [{ id: 'key', label: input.keyLabel }, ...series.map(s => ({ id: s.id, label: s.name }))],
    rows: unionKeys(series).map(key => ({
      key,
      cells: [
        { value: key, text: formatKey(key) },
        ...series.map((s, i) => {
          const value = (lookup[i] as Map<unknown, number | null | undefined>).get(keyId(key))
          return isPresent(value) ? { value, text: formatValue(value, s.id) } : { value: null, text: missingText }
        }),
      ],
    })),
  }
}

export interface LinkTableInput {
  readonly labels: { readonly source: string, readonly target: string, readonly value: string }
  readonly links: ReadonlyArray<{ readonly source: string, readonly target: string, readonly value: number }>
  readonly formatValue?: (value: number) => string
}

/** 流向与关系数据表：source / target / value 三列。 */
export function buildLinkTableModel(input: LinkTableInput): TableModel {
  const format = input.formatValue ?? String
  return {
    columns: [
      { id: 'source', label: input.labels.source },
      { id: 'target', label: input.labels.target },
      { id: 'value', label: input.labels.value },
    ],
    rows: input.links.map(link => ({
      key: `${link.source}→${link.target}`,
      cells: [
        { value: link.source, text: link.source },
        { value: link.target, text: link.target },
        { value: link.value, text: format(link.value) },
      ],
    })),
  }
}

export interface TraversalItem {
  /** 遍历里的唯一标识：标记键，折线与面积的点为「标记键:点键」（焦点代理元素以它为 id）。 */
  readonly id: string
  readonly markKey: string
  readonly pointKey?: string
  readonly datum?: DatumRef
}

export interface Traversal {
  /** 按系列分行，每行按数据位置排好。 */
  readonly rows: readonly (readonly TraversalItem[])[]
}

/**
 * 键盘遍历序：数据层里可聚焦、未在退场的标记按系列分行，行内按数据位置排序；
 * 折线与面积不为每个点建元素，按点展开成遍历项，由焦点代理承担焦点。
 */
export function buildTraversal(scene: Scene): Traversal {
  const rows = new Map<string, TraversalItem[]>()
  const order = (item: TraversalItem): number => item.datum?.index ?? 0
  for (const { layer, mark } of sceneMarks(scene)) {
    if (layer !== 'data' || mark.exiting || !mark.a11y?.focusable)
      continue
    const row = mark.datum?.seriesId ?? mark.key
    const list = rows.get(row) ?? []
    rows.set(row, list)
    if (mark.kind === 'line' || mark.kind === 'area') {
      mark.points.forEach((point, index) => {
        if (point.defined === false)
          return
        list.push({
          id: `${mark.key}:${point.key}`,
          markKey: mark.key,
          pointKey: point.key,
          datum: mark.datum ? { seriesId: mark.datum.seriesId, index } : undefined,
        })
      })
    }
    else {
      list.push({ id: mark.key, markKey: mark.key, datum: mark.datum })
    }
  }
  return {
    rows: [...rows.values()]
      .filter(list => list.length > 0)
      .map(list => list.map((item, i) => ({ item, i })).sort((a, b) => order(a.item) - order(b.item) || a.i - b.i).map(x => x.item)),
  }
}

export type NavTarget = 'next' | 'prev' | 'up' | 'down' | 'first' | 'last' | 'page-next' | 'page-prev'

/**
 * 从当前项按方向移动，返回目标项的 id；到行首行尾不回绕。
 * next / prev 在系列内移动，up / down 换到相邻系列的同一位置（位置越界时取该系列的最后一项），
 * first / last 到系列的首尾，page-next / page-prev 在系列内跳 pageSize 项。没有当前项时落到第一项。
 */
export function navigate(traversal: Traversal, current: string | null, to: NavTarget, pageSize = 10): string | null {
  const rows = traversal.rows
  if (rows.length === 0)
    return null
  let r = -1
  let c = -1
  rows.forEach((row, ri) => {
    const ci = row.findIndex(item => item.id === current)
    if (ci >= 0) {
      r = ri
      c = ci
    }
  })
  if (r < 0)
    return (rows[0] as readonly TraversalItem[])[0]?.id ?? null
  const row = rows[r] as readonly TraversalItem[]
  const at = (ri: number, ci: number): string => {
    const target = rows[ri] as readonly TraversalItem[]
    return (target[Math.min(ci, target.length - 1)] as TraversalItem).id
  }
  switch (to) {
    case 'next':
      return at(r, Math.min(row.length - 1, c + 1))
    case 'prev':
      return at(r, Math.max(0, c - 1))
    case 'first':
      return at(r, 0)
    case 'last':
      return at(r, row.length - 1)
    case 'page-next':
      return at(r, Math.min(row.length - 1, c + pageSize))
    case 'page-prev':
      return at(r, Math.max(0, c - pageSize))
    case 'up':
      return at(Math.max(0, r - 1), c)
    case 'down':
      return at(Math.min(rows.length - 1, r + 1), c)
    default:
      throw invalidArgument('未知的移动方向', { to })
  }
}
