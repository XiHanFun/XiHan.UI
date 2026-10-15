/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多级表头：把表头树展开成单元格与合并区，上层标签横跨下级，没有下级的标签向内占满余下的层。

import type { XlsxCell, XlsxMerge, XlsxRow } from './workbook'
import { XlsxError } from './errors'

/** 表头树上的一个节点。 */
export interface XlsxHeaderNode {
  /** 标签；null 或不写时这一格留空、不合并。 */
  readonly cell?: XlsxCell | null
  readonly children?: readonly XlsxHeaderNode[]
  /** 标签占几层，缺省 1；没有下级的节点一律占满到最内层。 */
  readonly span?: number
}

/** 展开方向。 */
export interface XlsxHeaderOptions {
  /** column（缺省）：列表头，层自上而下排成行、叶子从左到右排成列；row：行表头，层从左到右、叶子自上而下。 */
  readonly axis?: 'column' | 'row'
}

/** 展开的结果，行列都从 0 起，放到工作表里时由调用方加上偏移。 */
export interface XlsxHeaderLayout {
  readonly rows: XlsxRow[]
  readonly merges: XlsxMerge[]
  /** 层数。 */
  readonly depth: number
  /** 叶子数。 */
  readonly breadth: number
}

function spanOf(node: XlsxHeaderNode, path: readonly number[]): number {
  const span = node.span ?? 1
  if (!Number.isInteger(span) || span < 1)
    throw new XlsxError('invalid-header', { path, span })
  return span
}

function depthOf(nodes: readonly XlsxHeaderNode[], path: readonly number[]): number {
  let depth = 0
  nodes.forEach((node, index) => {
    const at = [...path, index]
    depth = Math.max(depth, spanOf(node, at) + depthOf(node.children ?? [], at))
  })
  return depth
}

/**
 * 把表头树展开成单元格与合并区：叶子按深度优先的次序各占一列（行表头时各占一行），
 * 有下级的节点横跨全部下级叶子、纵向占 span 层，没有下级的节点纵向占满到最内层。
 * 横跨或纵占超过一格的非空标签产出一个合并区。span 不是正整数时抛 `XlsxError('invalid-header')`。
 */
export function headerRows(tree: readonly XlsxHeaderNode[], options: XlsxHeaderOptions = {}): XlsxHeaderLayout {
  const depth = depthOf(tree, [])
  const placed: { level: number, offset: number, levels: number, width: number, cell: XlsxCell | null }[] = []

  function walk(nodes: readonly XlsxHeaderNode[], level: number, offset: number): number {
    let width = 0
    for (const node of nodes) {
      const children = node.children ?? []
      const span = node.span ?? 1
      const own = children.length === 0 ? 1 : walk(children, level + span, offset + width)
      placed.push({ level, offset: offset + width, levels: children.length === 0 ? depth - level : span, width: own, cell: node.cell ?? null })
      width += own
    }
    return width
  }
  const breadth = walk(tree, 0, 0)

  const byRow = options.axis !== 'row'
  const rows: (XlsxCell | null)[][] = Array.from({ length: byRow ? depth : breadth }, () => Array.from<XlsxCell | null>({ length: byRow ? breadth : depth }).fill(null))
  const merges: XlsxMerge[] = []
  for (const entry of placed) {
    if (entry.cell === null)
      continue
    const row = byRow ? entry.level : entry.offset
    const column = byRow ? entry.offset : entry.level
    rows[row]![column] = entry.cell
    if (entry.levels > 1 || entry.width > 1) {
      merges.push(byRow
        ? { row, column, rowSpan: entry.levels, columnSpan: entry.width }
        : { row, column, rowSpan: entry.width, columnSpan: entry.levels })
    }
  }
  merges.sort((a, b) => a.row - b.row || a.column - b.column)
  return { rows, merges, depth, breadth }
}
