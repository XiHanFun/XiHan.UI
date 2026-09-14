/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 calendar range picker visual 相关行为。

import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function cell(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='calendar-range-picker'][data-part='cell'][data-value='${value}']`,
  )
  if (!element)
    throw new Error(`找不到日期格 ${value}`)
  return element
}

function trigger(value: string): HTMLElement {
  const element = cell(value).querySelector<HTMLElement>(`[data-part='cell-trigger']`)
  if (!element)
    throw new Error(`找不到日期按钮 ${value}`)
  return element
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function mountCalendar(defaultValue?: string[], keepMotion = false): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCalendarRangePickerRoot, {
      defaultFocusedValue: '2026-09-09',
      defaultValue,
      fixedWeeks: true,
      locale: 'zh-CN',
      timeZone: 'UTC',
    }, {
      default: ({ weeks, weekDays }: any) => h(XhCalendarRangePickerGrid, null, () => [
        h(XhCalendarRangePickerGridHead, null, () => h(XhCalendarRangePickerWeekRow, null, () =>
          weekDays.map((day: any) => h(XhCalendarRangePickerWeekDay, { key: day.value, value: day.value })))),
        h(XhCalendarRangePickerGridBody, null, () => weeks.map((week: any[]) =>
          h(XhCalendarRangePickerWeekRow, { key: week[0].start }, () => week.map(day =>
            h(XhCalendarRangePickerCell, { key: day.start, value: day.start }, () =>
              h(XhCalendarRangePickerCellTrigger, null, () => String(day.day))))))),
      ]),
    }),
  })
  app.mount(host)
  await nextTick()
  if (!keepMotion) {
    document.querySelectorAll<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='cell-trigger']`)
      .forEach(element => element.style.transition = 'none')
  }
}

async function mountPeriodCalendar(granularity: 'week' | 'month' | 'quarter' | 'year'): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCalendarRangePickerRoot, {
      defaultFocusedValue: '2026-09-09',
      granularity,
      locale: 'zh-CN',
      timeZone: 'UTC',
    }, {
      default: ({ panels }: any) => h(XhCalendarRangePickerGrid, null, () =>
        panels[0].cells.map((period: any) =>
          h(XhCalendarRangePickerCell, { key: period.key, value: period.start }, () =>
            h(XhCalendarRangePickerCellTrigger, null, () => period.label)))),
    }),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('范围日历轨道', () => {
  it('已选区间连续铺底，起止圆帽完整，中间日期不叠加普通 hover 圆底', async () => {
    await mountCalendar(['2026-09-07', '2026-09-11'])
    const start = getComputedStyle(cell('2026-09-07'), '::before')
    const middle = getComputedStyle(cell('2026-09-09'), '::before')
    const end = getComputedStyle(cell('2026-09-11'), '::before')

    expect(alpha(middle.backgroundColor)).toBe(255)
    expect(Number.parseFloat(start.borderStartStartRadius)).toBeGreaterThan(0)
    expect(Number.parseFloat(middle.borderStartStartRadius)).toBe(0)
    expect(Number.parseFloat(end.borderStartEndRadius)).toBeGreaterThan(0)

    await userEvent.hover(trigger('2026-09-09'))
    expect(alpha(getComputedStyle(trigger('2026-09-09')).backgroundColor)).toBeLessThan(8)
  })

  it('挑到一半的预览与已落定的区间同一副长相：轨道同色，起点与悬停端都是实心圆帽', async () => {
    await mountCalendar()
    await userEvent.click(trigger('2026-09-07'))
    await userEvent.hover(trigger('2026-09-11'))
    await nextTick()

    for (const day of ['07', '08', '09', '10', '11']) {
      expect(cell(`2026-09-${day}`).hasAttribute('data-range-preview')).toBe(true)
      expect(cell(`2026-09-${day}`).getAttribute('aria-selected')).toBe('true')
    }

    const preview = getComputedStyle(cell('2026-09-09'), '::before')
    expect(alpha(preview.backgroundColor)).toBe(255)
    expect(alpha(getComputedStyle(trigger('2026-09-09')).backgroundColor)).toBeLessThan(8)
    const startBg = getComputedStyle(trigger('2026-09-07')).backgroundColor
    const endBg = getComputedStyle(trigger('2026-09-11')).backgroundColor
    expect(alpha(startBg)).toBe(255)
    expect(endBg).toBe(startBg)

    // 落下终点后，两端与轨道逐值不变
    await userEvent.click(trigger('2026-09-11'))
    await nextTick()
    expect(getComputedStyle(trigger('2026-09-07')).backgroundColor).toBe(startBg)
    expect(getComputedStyle(trigger('2026-09-11')).backgroundColor).toBe(endBg)
    expect(getComputedStyle(cell('2026-09-09'), '::before').backgroundColor).toBe(preview.backgroundColor)
    expect(cell('2026-09-09').hasAttribute('data-range-preview')).toBe(false)
  })

  it('按住拖过去也能挑出区间，拖动中整张网格保持手型', async () => {
    await mountCalendar()
    const grid = document.querySelector<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='grid']`)!
    // 按下与松开拆开发：拖动中间那一段要停下来量
    const pointer = (el: HTMLElement, type: string): void => {
      el.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        width: 8,
        height: 8,
        pressure: type === 'pointerdown' ? 0.5 : 0,
      }))
    }
    pointer(trigger('2026-09-07'), 'pointerdown')
    trigger('2026-09-09').dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType: 'mouse' }))
    await nextTick()
    expect(grid.hasAttribute('data-dragging')).toBe(true)
    expect(getComputedStyle(grid).cursor).toBe('pointer')
    expect(cell('2026-09-08').hasAttribute('data-in-range')).toBe(true)
    pointer(trigger('2026-09-09'), 'pointerup')
    await nextTick()
    expect(grid.hasAttribute('data-dragging')).toBe(false)
    expect(cell('2026-09-07').hasAttribute('data-range-start')).toBe(true)
    expect(cell('2026-09-09').hasAttribute('data-range-end')).toBe(true)
    expect(cell('2026-09-09').hasAttribute('data-range-preview')).toBe(false)
  })

  it('区间端点具备按压缩放的过渡通道', async () => {
    await mountCalendar(['2026-09-07', '2026-09-11'], true)
    const element = trigger('2026-09-07')
    const style = getComputedStyle(element)
    expect(style.transitionProperty).toContain('scale')
    expect(Number.parseFloat(style.transitionDuration)).toBeGreaterThan(0)
  })

  it('周粒度是一列整周周期格，区间预览不下沉到七个日格', async () => {
    await mountPeriodCalendar('week')
    const grid = document.querySelector<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='grid']`)!
    const periods = [...document.querySelectorAll<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='cell']`)]
    expect(periods).toHaveLength(5)
    expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(1)
    expect(getComputedStyle(trigger('2026-09-07')).aspectRatio).toBe('auto')

    await userEvent.click(trigger('2026-09-07'))
    await userEvent.hover(trigger('2026-09-21'))
    await nextTick()
    expect(['2026-09-07', '2026-09-14', '2026-09-21'].every(value => cell(value).hasAttribute('data-in-range'))).toBe(true)
  })

  it.each(['month', 'quarter', 'year'] as const)('%s 周期格选中前后保持相同尺寸', async (granularity) => {
    await mountPeriodCalendar(granularity)
    const elements = [...document.querySelectorAll<HTMLElement>(
      `[data-scope='calendar-range-picker'][data-part='cell-trigger']`,
    )]
    const idle = elements[0]
    if (!idle)
      throw new Error(`找不到 ${granularity} 周期格`)

    const before = idle.getBoundingClientRect()
    await userEvent.click(idle)
    await nextTick()
    const after = idle.getBoundingClientRect()

    expect(getComputedStyle(idle).aspectRatio).toBe('auto')
    expect(after.width).toBeCloseTo(before.width, 1)
    expect(after.height).toBeCloseTo(before.height, 1)
    expect(after.width).toBeLessThanOrEqual(56)
    expect(after.height).toBeLessThanOrEqual(40)
  })
})

describe('邻月格子的点选', () => {
  const values: string[][] = []

  async function mountTracked(): Promise<void> {
    values.length = 0
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhCalendarRangePickerRoot, {
        defaultFocusedValue: '2026-09-09',
        fixedWeeks: true,
        locale: 'zh-CN',
        timeZone: 'UTC',
        onValueChange: ({ value }: { value: string[] }) => values.push(value),
      }, {
        default: ({ weeks, weekDays }: any) => h(XhCalendarRangePickerGrid, null, () => [
          h(XhCalendarRangePickerGridHead, null, () => h(XhCalendarRangePickerWeekRow, null, () =>
            weekDays.map((day: any) => h(XhCalendarRangePickerWeekDay, { key: day.value, value: day.value })))),
          h(XhCalendarRangePickerGridBody, null, () => weeks.map((week: any[]) =>
            h(XhCalendarRangePickerWeekRow, { key: week[0].start }, () => week.map(day =>
              h(XhCalendarRangePickerCell, { key: day.start, value: day.start }, () =>
                h(XhCalendarRangePickerCellTrigger, null, () => String(day.day))))))),
        ]),
      }),
    })
    app.mount(host)
    await nextTick()
  }

  it('终点点在下个月的邻月格上：落的就是那一格，随后才翻到那个月', async () => {
    // 真实指针：按下时浏览器把焦点落到格子上。此前落焦即翻页，网格重画后压在指针下的是
    // 另一格（十月面板同一位置是 11 月 3 日），松开就收在了错的日子上
    await mountTracked()
    await userEvent.click(trigger('2026-09-28'))
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(true)
    await userEvent.click(trigger('2026-10-06'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-09-28', '2026-10-06'])
    // 翻到了十月：10 月 6 日成了本月格子，9 月 28 日退成邻月格
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(false)
    expect(cell('2026-10-06').hasAttribute('data-range-end')).toBe(true)
    expect(cell('2026-09-28').hasAttribute('data-range-start')).toBe(true)
    expect(document.activeElement).toBe(trigger('2026-10-06'))
  })

  it('反着挑：终点点在上个月的邻月格上，两端照样排好并翻到那个月', async () => {
    await mountTracked()
    await userEvent.click(trigger('2026-09-07'))
    expect(cell('2026-08-31').hasAttribute('data-outside-month')).toBe(true)
    await userEvent.click(trigger('2026-08-31'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-08-31', '2026-09-07'])
    expect(cell('2026-08-31').hasAttribute('data-outside-month')).toBe(false)
    expect(cell('2026-08-31').hasAttribute('data-range-start')).toBe(true)
  })

  it('起点点在邻月格上：按下不翻页，松开才落起点并翻页', async () => {
    await mountTracked()
    await userEvent.click(trigger('2026-10-06'))
    await nextTick()
    expect(values).toHaveLength(0)
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(false)
    expect(cell('2026-10-06').getAttribute('aria-selected')).toBe('true')
    await userEvent.click(trigger('2026-10-09'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-10-06', '2026-10-09'])
  })
})
