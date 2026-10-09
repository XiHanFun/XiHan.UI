// 范围日历格与翻页钮的皮肤（与 calendar-picker 同构，另加区间轨道与中段的品牌淡底阶梯）：
// 日期格是 24 见方的圆，今天是数字下方一颗 4px 品牌圆点；格子坐在白底上，悬停 100 档、按下 200 档只换面；
// 区间端点实心品牌，按下压到 active 档；区间轨道 32 高（行距 36 上下各收 2），两端收成半圆帽、跨周折行处是直边；
// 格子随容器铺宽时帽仍与端点的实心圆同心；
// 强制色下落定的区间中段在轨道上下沿画实线；快速选年的网格是页内结构容器，滚动链保持 auto。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerHeadingMonthTrigger,
  XhCalendarRangePickerHeadingYearTrigger,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekRow,
} from '../../src'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await releasePointerAway()
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 今天所在月里的一段：今天落在 10–14 号就取 16–20 号，否则取 10–14 号；今天不会是端点也不会在段里。 */
function otherRange(): [string, string] {
  const now = new Date()
  const inside = now.getDate() >= 10 && now.getDate() <= 14
  const iso = (day: number): string => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return inside ? [iso(16), iso(20)] : [iso(10), iso(14)]
}

async function mountCalendar(width = 320): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  app = createApp({
    setup: () => () => h(XhCalendarRangePickerRoot, { locale: 'zh-CN', defaultValue: otherRange() }, {
      default: ({ weeks }: { weeks: { start: string, day: number }[][] }) => [
        h(XhCalendarRangePickerHeader, null, () => [
          h(XhCalendarRangePickerPrevTrigger, { 'aria-label': '上个月' }),
          h(XhCalendarRangePickerHeading, null, () => [
            h(XhCalendarRangePickerHeadingYearTrigger),
            h(XhCalendarRangePickerHeadingMonthTrigger),
          ]),
          h(XhCalendarRangePickerNextTrigger, { 'aria-label': '下个月' }),
        ]),
        h(XhCalendarRangePickerGrid, null, () => [
          h(XhCalendarRangePickerGridBody, null, () => weeks.map(week => h(XhCalendarRangePickerWeekRow, { key: week[0]!.start }, () => week.map(day =>
            h(XhCalendarRangePickerCell, { key: day.start, value: day.start }, () => h(XhCalendarRangePickerCellTrigger, null, () => String(day.day))),
          )))),
        ]),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string, extra = ''): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='${name}']${extra}`)
  if (!el)
    throw new Error(`挂载树里没有 calendar-range-picker.${name}${extra}`)
  return el
}

/** 语义令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 语义令牌在该元素上解到的长度（px）。 */
function resolveLength(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.inlineSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return value
}

/** 按压只换面：缩放档缺省不动（1 或 none）。 */
function unscaled(el: HTMLElement): boolean {
  return ['1', 'none'].includes(getComputedStyle(el).scale)
}

describe('calendarRangePicker 格子与翻页钮的皮肤', () => {
  it('今天在数字下方画一颗 4px 品牌圆点、数字保持正文色；区间端点是实心品牌圆', async () => {
    await mountCalendar()
    const root = part('root')
    const action = resolveLength('--xh-control-action-size', root)
    const today = getComputedStyle(part('cell-trigger', '[data-today]:not([data-selected])'))
    expect(today.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(today.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(today.color).toBe(resolveColor('--xh-fg-default', root))
    const mark = getComputedStyle(part('cell', '[data-today]'), '::after')
    expect(mark.width).toBe('4px')
    expect(mark.backgroundColor).toBe(resolveColor('--xh-fg-brand', root))
    expect(mark.borderTopLeftRadius).toBe('50%')

    const start = part('cell-trigger', '[data-range-start]')
    expect(getComputedStyle(start).backgroundColor).toBe(resolveColor('--xh-bg-brand', root))
    expect(getComputedStyle(start).color).toBe(resolveColor('--xh-fg-on-brand', root))
    expect(start.getBoundingClientRect().width).toBe(action)
    expect(getComputedStyle(start).borderTopLeftRadius).toBe('50%')
  })

  it('区间轨道 32 高、行尾一侧铺满格子；两端收成半圆帽，跨周折行处是直边', async () => {
    await mountCalendar()
    const root = part('root')
    const startCell = part('cell', '[data-range-start]')
    const track = getComputedStyle(startCell, '::before')
    expect(track.backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle', root))
    expect(track.top).toBe('2px')
    expect(track.bottom).toBe('2px')
    // 起点格只在行尾一侧铺到格边，与下一格的轨道接上；行首一侧由帽的位置定（下一条）
    expect(track.right).toBe('0px')
    const cellHeight = startCell.getBoundingClientRect().height
    expect(cellHeight - 4).toBe(resolveLength('--xh-control-action-size', root) + 8)
    // 起点帽在行首一侧取满半圆，行尾一侧是直边
    const pill = document.createElement('span')
    pill.style.borderRadius = 'var(--xh-shape-pill)'
    root.append(pill)
    expect(track.borderStartStartRadius).toBe(getComputedStyle(pill).borderTopLeftRadius)
    pill.remove()
    expect(track.borderStartEndRadius).toBe('0px')

    const endCell = part('cell', '[data-range-end]')
    expect(getComputedStyle(endCell, '::before').borderStartStartRadius).toBe('0px')
    expect(getComputedStyle(endCell, '::before').borderEndEndRadius).not.toBe('0px')

    // 区间中段落在一行行首的格：轨道不收圆
    const middles = [...host!.querySelectorAll<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='cell'][data-in-range]:not([data-range-start]):not([data-range-end])`)]
    for (const cell of middles)
      expect(getComputedStyle(cell, '::before').borderStartStartRadius).toBe('0px')
  })

  it.each([320, 480])('宿主 %ipx：格子随容器铺宽时，两端的帽与端点的实心圆同心', async (width) => {
    await mountCalendar(width)
    for (const edge of ['start', 'end'] as const) {
      const cell = part('cell', `[data-range-${edge}]`)
      const dot = part('cell-trigger', `[data-range-${edge}]`).getBoundingClientRect()
      const rect = cell.getBoundingClientRect()
      const track = getComputedStyle(cell, '::before')
      const top = Number.parseFloat(track.top)
      const radius = (rect.height - top - Number.parseFloat(track.bottom)) / 2
      // 格子比钮宽得多，从格边起算的帽会偏到圆的外侧
      expect(rect.width).toBeGreaterThan(2 * radius)
      // 帽是半高为半径的半圆：圆心在轨道这一端往里一个半径处
      const capX = edge === 'start'
        ? rect.left + Number.parseFloat(track.left) + radius
        : rect.right - Number.parseFloat(track.right) - radius
      const observed = `${edge} cell ${JSON.stringify(rect)} track ${track.left}/${track.right}/${track.top}/${track.bottom} dot ${JSON.stringify(dot)}`
      expect(Math.abs(capX - (dot.left + dot.width / 2)), observed).toBeLessThanOrEqual(0.5)
      expect(Math.abs(rect.top + top + radius - (dot.top + dot.height / 2)), observed).toBeLessThanOrEqual(0.5)
    }
  })

  it('格子悬停 100 档、按下 200 档只换面；今天走同一条阶梯；端点按下压到 active 档；区间中段走品牌淡底阶梯', async () => {
    await mountCalendar()
    const root = part('root')
    const cell = part('cell-trigger', ':not([data-today]):not([data-selected]):not([data-outside-month]):not([data-in-range])')
    await userEvent.hover(cell)
    expect(getComputedStyle(cell).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(cell)
    expect(cell.matches(':active')).toBe(true)
    expect(getComputedStyle(cell).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(unscaled(cell)).toBe(true)
    await releasePointerAway()

    const today = part('cell-trigger', '[data-today]:not([data-selected])')
    await userEvent.hover(today)
    expect(getComputedStyle(today).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await releasePointerAway()

    const start = part('cell-trigger', '[data-range-start]')
    await pressPointer(start)
    expect(getComputedStyle(start).backgroundColor).toBe(resolveColor('--xh-bg-brand-active', root))
    expect(unscaled(start)).toBe(true)
    await releasePointerAway()

    // 区间中段的格坐在品牌淡底的轨道上：悬停 20%、按下 28%
    const middle = part('cell-trigger', '[data-in-range]:not([data-range-start]):not([data-range-end]):not([data-outside-month])')
    await userEvent.hover(middle)
    expect(getComputedStyle(middle).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle-hover', root))
    await pressPointer(middle)
    expect(getComputedStyle(middle).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle-active', root))
  })

  it('翻页钮是 24 见方的圆，悬停 100、按下 200；标题钮悬停换 100 底而字色不变', async () => {
    await mountCalendar()
    const root = part('root')
    const action = resolveLength('--xh-control-action-size', root)
    const next = part('next-trigger')
    expect(next.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(next.getAttribute('data-xh-action-size')).toBe('xs')
    expect(next.getBoundingClientRect().width).toBe(action)
    expect(next.getBoundingClientRect().height).toBe(action)
    expect(getComputedStyle(next).borderTopLeftRadius).toBe('50%')
    await userEvent.hover(next)
    expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(next)
    expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    await releasePointerAway()

    const month = part('heading-month-trigger')
    await userEvent.hover(month)
    expect(getComputedStyle(month).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(month).color).toBe(resolveColor('--xh-fg-default', root))
  })

  it('强制色下落定的区间中段在轨道上下沿画实线，端点换 Highlight 描边', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    await mountCalendar()
    const root = part('root')
    const probe = document.createElement('span')
    probe.style.cssText = 'forced-color-adjust: none; background-color: Highlight'
    root.append(probe)
    const highlight = getComputedStyle(probe).backgroundColor
    probe.remove()
    const middle = getComputedStyle(part('cell', '[data-in-range]:not([data-range-start]):not([data-range-end])'), '::before')
    expect(middle.borderTopStyle).toBe('solid')
    expect(middle.borderBottomStyle).toBe('solid')
    expect(middle.borderTopColor).toBe(highlight)
    expect(getComputedStyle(part('cell-trigger', '[data-range-start]')).borderTopColor).toBe(highlight)
  })

  it('快速选年的网格滚动链保持 auto，翻页钮里的字形取 sm 档', async () => {
    await mountCalendar()
    const root = part('root')
    part('heading-year-trigger').click()
    await nextTick()
    await nextTick()
    const grid = part('grid', `[data-view='year']`)
    expect(getComputedStyle(grid).overflowY).toBe('auto')
    expect(getComputedStyle(grid).overscrollBehaviorY).toBe('auto')
    expect(getComputedStyle(part('next-trigger'), '::before').width).toBe(`${resolveLength('--xh-glyph-size-sm', root)}px`)
  })
})
