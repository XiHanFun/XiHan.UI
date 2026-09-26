/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 系列的身份、色槽与纹理：id 缺省取数值字段名，色槽按声明顺序分配、与显隐无关，校验不合法的组合。

import type { Tone } from '@xihan-ui/core'
import { DIAGNOSTIC_CODES } from '@xihan-ui/core'

/** 分类色槽的数量；没有第 9 色。 */
export const CHART_SLOT_COUNT = 8

/** 分配色槽要看的那几项。 */
export interface ChartSeriesIdentityInput {
  readonly id?: string
  /** id 缺省时取它（一般是数值字段名）。 */
  readonly field: string
  readonly name?: string
  /** 固定色槽 1–8。 */
  readonly slot?: number
  readonly tone?: Tone
}

export interface ChartSeriesIdentity {
  readonly id: string
  readonly name: string
  /** 分类色槽；语义系列为 null。 */
  readonly slot: number | null
  readonly tone: Tone | null
  /** 纹理序号 1–8：分类系列等于色槽，语义系列按声明次序；没有色槽的分类系列为 null。 */
  readonly pattern: number | null
}

/** 规格不合法的原因：code 是诊断码，detail 给出涉及的值。 */
export interface ChartSpecIssue {
  readonly code: string
  readonly message: string
  readonly detail: Readonly<Record<string, unknown>>
}

export interface ChartSeriesAssignment {
  readonly series: readonly ChartSeriesIdentity[]
  readonly issues: readonly ChartSpecIssue[]
}

/**
 * 系列身份与色槽。
 * 色槽按声明顺序分配，写了 slot 的系列占住那一槽，其余系列按顺序取还空着的槽；
 * 隐藏、筛选、排序都不重新分配，同一业务实体在不同图表里用 slot 保持同色。
 * 分类系列超过 8 个、id 重复、同一张图混用分类色与语气色、slot 越界都报出来，由调用方按诊断处理。
 */
export function assignChartSeries(inputs: readonly ChartSeriesIdentityInput[]): ChartSeriesAssignment {
  const issues: ChartSpecIssue[] = []
  const ids = new Set<string>()
  for (const input of inputs) {
    const id = input.id ?? input.field
    if (ids.has(id))
      issues.push({ code: DIAGNOSTIC_CODES.chartDuplicateSeries, message: `系列 id「${id}」重复；写 id 区分用同一字段的两个系列`, detail: { id } })
    ids.add(id)
    if (input.slot !== undefined && !(Number.isInteger(input.slot) && input.slot >= 1 && input.slot <= CHART_SLOT_COUNT))
      issues.push({ code: DIAGNOSTIC_CODES.chartInvalidSlot, message: `系列「${id}」的 slot 必须是 1–${CHART_SLOT_COUNT} 的整数`, detail: { id, slot: input.slot } })
  }
  const toned = inputs.filter(s => s.tone !== undefined)
  const categorical = inputs.filter(s => s.tone === undefined)
  if (toned.length > 0 && categorical.length > 0) {
    issues.push({
      code: DIAGNOSTIC_CODES.chartMixedColorRoles,
      message: '同一张图不混用分类色与语气色：要么全部系列写 tone，要么都不写',
      detail: { toned: toned.map(s => s.id ?? s.field), categorical: categorical.map(s => s.id ?? s.field) },
    })
  }
  if (categorical.length > CHART_SLOT_COUNT) {
    issues.push({
      code: DIAGNOSTIC_CODES.chartTooManySeries,
      message: `分类系列至多 ${CHART_SLOT_COUNT} 个：把其余的合并为「其他」，或拆成多张小图`,
      detail: { count: categorical.length },
    })
  }

  const taken = new Set<number>()
  for (const input of categorical) {
    if (input.slot === undefined || !(input.slot >= 1 && input.slot <= CHART_SLOT_COUNT))
      continue
    // 两个系列固定到同一槽就成了同色，读者分不出来
    if (taken.has(input.slot))
      issues.push({ code: DIAGNOSTIC_CODES.chartInvalidSlot, message: `色槽 ${input.slot} 被两个系列同时占用`, detail: { id: input.id ?? input.field, slot: input.slot } })
    taken.add(input.slot)
  }
  let next = 1
  let toneOrder = 0
  const series = inputs.map((input): ChartSeriesIdentity => {
    const id = input.id ?? input.field
    const name = input.name ?? id
    if (input.tone !== undefined)
      return { id, name, slot: null, tone: input.tone, pattern: (toneOrder++ % CHART_SLOT_COUNT) + 1 }
    if (input.slot !== undefined && taken.has(input.slot))
      return { id, name, slot: input.slot, tone: null, pattern: input.slot }
    while (taken.has(next))
      next += 1
    const slot = next <= CHART_SLOT_COUNT ? next : null
    if (slot !== null)
      taken.add(slot)
    return { id, name, slot, tone: null, pattern: slot }
  })
  return { series, issues }
}
