// 范围日历格与翻页钮的皮肤（与 calendar-picker 同构，另加区间中段的品牌淡底阶梯）：今天是 1px 品牌环 + 品牌字、底透明（§7.3 brand-subtle 退出 today 语义）；
// 格子坐在白底上，悬停 100 档、按下 200 档并缩放（§7.2 / §9.1）；选中格实心品牌，按下压到 active 档；
// 快速选年的网格是页内结构容器，滚动链保持 auto（§6.6）。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
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

async function mountCalendar(): Promise<void> {
  host = document.createElement('div')
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

/** 语义色令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

describe('calendarRangePicker 格子与翻页钮的皮肤', () => {
  it('今天是 1px 品牌环 + 品牌字，底透明；区间端点实心品牌', async () => {
    await mountCalendar()
    const root = part('root')
    const today = getComputedStyle(part('cell-trigger', '[data-today]:not([data-selected])'))
    expect(today.borderTopColor).toBe(resolveColor('--xh-fg-brand', root))
    expect(today.borderTopWidth).toBe('1px')
    expect(today.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(today.color).toBe(resolveColor('--xh-fg-brand', root))
    const start = getComputedStyle(part('cell-trigger', '[data-range-start]'))
    expect(start.backgroundColor).toBe(resolveColor('--xh-bg-brand', root))
    expect(start.color).toBe(resolveColor('--xh-fg-on-brand', root))
  })

  it('格子悬停 100 档、按下 200 档并缩放；今天走同一条阶梯；端点按下压到 active 档；区间中段走品牌淡底阶梯', async () => {
    await mountCalendar()
    const root = part('root')
    const cell = part('cell-trigger', ':not([data-today]):not([data-selected]):not([data-outside-month])')
    await userEvent.hover(cell)
    expect(getComputedStyle(cell).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(cell)
    expect(cell.matches(':active')).toBe(true)
    expect(getComputedStyle(cell).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(cell).scale).toBe('0.97')
    await releasePointerAway()

    const today = part('cell-trigger', '[data-today]:not([data-selected])')
    await userEvent.hover(today)
    expect(getComputedStyle(today).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(today).borderTopColor).toBe(resolveColor('--xh-fg-brand', root))
    await releasePointerAway()

    const start = part('cell-trigger', '[data-range-start]')
    await pressPointer(start)
    expect(getComputedStyle(start).backgroundColor).toBe(resolveColor('--xh-bg-brand-active', root))
    expect(getComputedStyle(start).scale).toBe('0.97')
    await releasePointerAway()

    // 区间中段的格坐在品牌淡底的轨道上：悬停 20%、按下 28%
    const middle = part('cell-trigger', '[data-in-range]:not([data-range-start]):not([data-range-end]):not([data-outside-month])')
    await userEvent.hover(middle)
    expect(getComputedStyle(middle).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle-hover', root))
    await pressPointer(middle)
    expect(getComputedStyle(middle).backgroundColor).toBe(resolveColor('--xh-bg-brand-subtle-active', root))
    expect(getComputedStyle(middle).scale).toBe('0.97')
  })

  it('翻页钮与标题钮：悬停 100 档、按下 200 档并缩放', async () => {
    await mountCalendar()
    const root = part('root')
    const next = part('next-trigger')
    // 方向钮接 Action Control icon ghost sm 档：32px 正方盒；标题钮 text ghost sm 档，悬停只换字色不换底
    expect(next.getAttribute('data-xh-action-control')).toBe('')
    expect(next.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(next.getAttribute('data-xh-action-variant')).toBe('ghost')
    expect(next.getBoundingClientRect().width).toBe(32)
    expect(next.getBoundingClientRect().height).toBe(32)
    const heading = part('heading-month-trigger')
    expect(heading.getAttribute('data-xh-action-profile')).toBe('text')
    await userEvent.hover(heading)
    await expect.poll(() => getComputedStyle(heading).color).toBe(resolveColor('--xh-fg-brand', root))
    expect(getComputedStyle(heading).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    // 日期格接 text ghost 档：家族的固定高归 auto，格仍是等分轨道给的正方
    const cell = part('cell-trigger', ':not([data-outside-month])')
    expect(cell.getAttribute('data-xh-action-profile')).toBe('text')
    expect(cell.getBoundingClientRect().width).toBe(cell.getBoundingClientRect().height)
    expect(getComputedStyle(cell).paddingInlineStart).toBe('0px')
    await userEvent.hover(next)
    expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(next)
    expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(next).scale).toBe('0.97')
    await releasePointerAway()

    const month = part('heading-month-trigger')
    await pressPointer(month)
    expect(getComputedStyle(month).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(month).scale).toBe('0.97')
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
    const probe = document.createElement('span')
    probe.style.inlineSize = 'var(--xh-glyph-size-sm)'
    root.append(probe)
    const sm = getComputedStyle(probe).inlineSize
    probe.remove()
    expect(getComputedStyle(part('next-trigger'), '::before').width).toBe(sm)
  })
})
