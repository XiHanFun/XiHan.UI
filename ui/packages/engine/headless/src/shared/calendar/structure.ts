/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日历面板的标准结构：一个面板里的标题栏与网格。内嵌日历的选择器照它铺日历那一块，部件按 component 委派给日历。

import type { StructureNode } from '../structure'
import type { CalendarWeekDay } from './grid'
import type { CalendarPanel } from './types'

/** 面板里会产出的日历部件。 */
export type CalendarStructurePart
  = | 'header'
    | 'prev-year-trigger'
    | 'prev-trigger'
    | 'heading'
    | 'heading-year-trigger'
    | 'heading-month-trigger'
    | 'next-trigger'
    | 'next-year-trigger'
    | 'grid'
    | 'grid-head'
    | 'week-row'
    | 'week-day'
    | 'grid-body'
    | 'cell'
    | 'cell-trigger'

/** 铺一个面板要用到的状态，取自日历的 api。 */
export interface CalendarStructureModel {
  /** 并排的面板；标题栏两端的翻页钮按它判断谁是首个、谁是末个。 */
  readonly panels: readonly CalendarPanel[]
  /** 表头一行的星期。 */
  readonly weekDays: readonly CalendarWeekDay[]
  /** 标题里年与月两颗钻取钮的先后。 */
  readonly headingOrder: readonly ('year' | 'month')[]
}

/**
 * 一个面板的标题栏与网格，次序是标题栏、网格。
 * - 标题栏：首个面板带向前的两颗翻页钮、末个面板带向后的两颗，中间是标题；标题里按 headingOrder 排年与月两颗钻取钮，
 *   文字取面板的 headingYear / headingMonth，不能钻取时由连接层收起或禁用。
 * - 网格：日视图是表头一行星期、日期按周成行（表头与日期各在一个 rowgroup 里）；月、季度与年视图按 rows 成行，
 *   行直接放在网格里。格里放 cell-trigger，文字取格子的 label。
 * component 是这些部件所属的组件：日历自己铺时省略，选择器内嵌日历时写日历的组件名。
 */
export function calendarPanelStructure(
  model: CalendarStructureModel,
  panel: CalendarPanel,
  component?: string,
): StructureNode<CalendarStructurePart>[] {
  const owner = component === undefined ? {} : { component }
  const index = String(panel.index)
  const first = panel.index === 0
  const last = panel.index === model.panels.length - 1
  const node = (key: string, tag: StructureNode['tag'], part: CalendarStructurePart, rest: Partial<StructureNode<CalendarStructurePart>> = {}): StructureNode<CalendarStructurePart> =>
    ({ key, tag, ...owner, part, ...rest })

  const heading = node('heading', 'div', 'heading', {
    attrs: { index },
    children: model.headingOrder.map(unit => unit === 'year'
      ? node('year', 'button', 'heading-year-trigger', { attrs: { index }, text: panel.headingYear })
      : node('month', 'button', 'heading-month-trigger', { attrs: { index }, text: panel.headingMonth })),
  })
  const header = node('header', 'div', 'header', {
    children: [
      ...(first ? [node('prev-year', 'button', 'prev-year-trigger'), node('prev', 'button', 'prev-trigger')] : []),
      heading,
      ...(last ? [node('next', 'button', 'next-trigger'), node('next-year', 'button', 'next-year-trigger')] : []),
    ],
  })

  const cell = (period: { key: string, start: string, label: string }): StructureNode<CalendarStructurePart> =>
    node(`cell:${period.key}`, 'div', 'cell', {
      attrs: { value: period.start },
      children: [node('trigger', 'div', 'cell-trigger', { text: period.label })],
    })

  const rows = panel.weeks.length > 0
    ? [
        node('grid-head', 'div', 'grid-head', {
          children: [node('week-days', 'div', 'week-row', {
            children: model.weekDays.map(day => node(`week-day:${day.value}`, 'span', 'week-day', { attrs: { value: String(day.value) }, text: day.label })),
          })],
        }),
        node('grid-body', 'div', 'grid-body', {
          children: panel.weeks.map(week => node(`week:${week[0]!.key}`, 'div', 'week-row', { children: week.map(cell) })),
        }),
      ]
    : panel.rows.map(row => node(`row:${row[0]!.key}`, 'div', 'week-row', { children: row.map(cell) }))

  return [header, node('grid', 'div', 'grid', { attrs: { index }, children: rows })]
}
