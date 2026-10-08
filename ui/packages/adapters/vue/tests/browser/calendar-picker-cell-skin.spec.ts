// 日历格与翻页钮的皮肤：标题栏 8 / 16 内衬加下沿分隔线、网格 12 / 16 内衬；星期行 32 高、正文字号常规字重；
// 日期格是 24 见方的圆、行距 36，今天是数字下方一颗 4px 品牌圆点（数字保持正文色）；
// 格子坐在白底上，悬停 100 档、按下 200 档只换面；选中格实心品牌，按下压到 active 档；
// 不可用的日子铺整格淡底横条；周期视图的格铺满格宽、24 高、控件圆角；快速选年的网格是页内结构容器，滚动链保持 auto。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerHeadingMonthTrigger,
  XhCalendarPickerHeadingYearTrigger,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerPrevTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
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

/** 今天所在月里的某一天（不是今天）。 */
function dayOfThisMonth(day: number): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** 选中日与不可用日：都避开今天。 */
function selectedDay(): string {
  return dayOfThisMonth(new Date().getDate() === 15 ? 16 : 15)
}

function unavailableDays(): string[] {
  const today = new Date().getDate()
  const start = today >= 20 && today <= 22 ? 24 : 20
  return [start, start + 1, start + 2].map(dayOfThisMonth)
}

async function mountCalendar(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  const blocked = unavailableDays()
  // 插槽里的 periods 跟着当前视图走（日视图也有一份按天的）：按视图分两种铺法
  const view = ref('day')
  app = createApp({
    setup: () => () => h(XhCalendarPickerRoot, {
      locale: 'zh-CN',
      defaultValue: [selectedDay()],
      isDateUnavailable: (date: string) => blocked.includes(date),
      'onUpdate:activeView': (next: string) => { view.value = next },
    }, {
      default: ({ weeks, weekDays, periods }: {
        weeks: { start: string, day: number }[][]
        weekDays: { value: number }[]
        periods: { start: string, label: string }[]
      }) => [
        h(XhCalendarPickerHeader, null, () => [
          h(XhCalendarPickerPrevTrigger, { 'aria-label': '上个月' }),
          h(XhCalendarPickerHeading, null, () => [
            h(XhCalendarPickerHeadingYearTrigger),
            h(XhCalendarPickerHeadingMonthTrigger),
          ]),
          h(XhCalendarPickerNextTrigger, { 'aria-label': '下个月' }),
        ]),
        // 钻上一层后网格里直接铺周期格；日视图铺星期行与周行
        h(XhCalendarPickerGrid, null, () => view.value !== 'day'
          ? periods.map(period => h(XhCalendarPickerCell, { key: period.start, value: period.start }, () =>
              h(XhCalendarPickerCellTrigger, null, () => period.label)))
          : [
              h(XhCalendarPickerGridHead, null, () => h(XhCalendarPickerWeekRow, null, () =>
                weekDays.map(day => h(XhCalendarPickerWeekDay, { key: day.value, value: day.value })))),
              h(XhCalendarPickerGridBody, null, () => weeks.map(week => h(XhCalendarPickerWeekRow, { key: week[0]!.start }, () => week.map(day =>
                h(XhCalendarPickerCell, { key: day.start, value: day.start }, () => h(XhCalendarPickerCellTrigger, null, () => String(day.day))),
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
  const el = host?.querySelector<HTMLElement>(`[data-scope='calendar-picker'][data-part='${name}']${extra}`)
  if (!el)
    throw new Error(`挂载树里没有 calendar-picker.${name}${extra}`)
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

describe('calendarPicker 格子与翻页钮的皮肤', () => {
  it('标题栏 8 / 16 内衬加下沿分隔线，网格 12 / 16 内衬；星期行 32 高、正文字号常规字重；行距 36', async () => {
    await mountCalendar()
    const root = part('root')
    const header = getComputedStyle(part('header'))
    expect(header.paddingTop).toBe('8px')
    expect(header.paddingInlineStart).toBe('16px')
    expect(header.borderBottomWidth).toBe('1px')
    expect(header.borderBottomStyle).toBe('solid')
    expect(header.borderBottomColor).toBe(resolveColor('--xh-border-default', root))
    // 标题栏与网格之间不再留空当
    expect(getComputedStyle(root).rowGap).toBe('0px')
    expect(getComputedStyle(part('heading')).fontWeight).toBe('500')

    const grid = getComputedStyle(part('grid'))
    expect(grid.paddingTop).toBe('12px')
    expect(grid.paddingInlineStart).toBe('16px')

    const weekDay = part('week-day')
    expect(weekDay.getBoundingClientRect().height).toBe(resolveLength('--xh-control-h-md', root))
    expect(Number.parseFloat(getComputedStyle(weekDay).fontSize)).toBe(resolveLength('--xh-text-body-size', root))
    expect(getComputedStyle(weekDay).fontWeight).toBe('400')

    const cell = part('cell', ':not([data-outside-month])')
    const action = resolveLength('--xh-control-action-size', root)
    expect(cell.getBoundingClientRect().height).toBe(action + 12)
  })

  it('日期格是 24 见方的圆；今天在数字下方画一颗 4px 品牌圆点，数字保持正文色；选中格实心品牌', async () => {
    await mountCalendar()
    const root = part('root')
    const action = resolveLength('--xh-control-action-size', root)

    const today = part('cell-trigger', '[data-today]:not([data-selected])')
    const todayStyle = getComputedStyle(today)
    expect(today.getBoundingClientRect().width).toBe(action)
    expect(today.getBoundingClientRect().height).toBe(action)
    expect(todayStyle.borderTopLeftRadius).toBe('50%')
    expect(todayStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(todayStyle.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(todayStyle.color).toBe(resolveColor('--xh-fg-default', root))

    const mark = getComputedStyle(part('cell', '[data-today]'), '::after')
    expect(mark.width).toBe('4px')
    expect(mark.height).toBe('4px')
    expect(mark.borderTopLeftRadius).toBe('50%')
    expect(mark.backgroundColor).toBe(resolveColor('--xh-fg-brand', root))
    // 圆点落在数字下方 2px、水平居中
    const box = today.getBoundingClientRect()
    const cellBox = part('cell', '[data-today]').getBoundingClientRect()
    const markTop = cellBox.top + Number.parseFloat(mark.top)
    expect(markTop - box.bottom).toBe(2)
    expect(cellBox.left + Number.parseFloat(mark.left) - Number.parseFloat(mark.width) / 2).toBeCloseTo(box.left + box.width / 2 - 2, 0)

    const selected = part('cell-trigger', '[data-selected]')
    expect(getComputedStyle(selected).backgroundColor).toBe(resolveColor('--xh-bg-brand', root))
    expect(getComputedStyle(selected).color).toBe(resolveColor('--xh-fg-on-brand', root))
    expect(getComputedStyle(selected).borderTopLeftRadius).toBe('50%')
  })

  it('格子悬停 100 档、按下 200 档只换面；今天走同一条阶梯；选中格按下压到 active 档', async () => {
    await mountCalendar()
    const root = part('root')
    const cell = part('cell-trigger', ':not([data-today]):not([data-selected]):not([data-outside-month]):not([data-disabled])')
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

    const selected = part('cell-trigger', '[data-selected]')
    await pressPointer(selected)
    expect(getComputedStyle(selected).backgroundColor).toBe(resolveColor('--xh-bg-brand-active', root))
    expect(unscaled(selected)).toBe(true)
  })

  it('命中区铺满整格：点在格子上下内衬里也选中这一天', async () => {
    await mountCalendar()
    const value = dayOfThisMonth(new Date().getDate() === 10 ? 11 : 10)
    const cell = part('cell', `[data-value='${value}']`)
    const box = cell.getBoundingClientRect()
    // 落点在格子顶边往下 2px：钮的圆外、格子的内衬里
    await userEvent.click(cell, { position: { x: box.width / 2, y: 2 } })
    await expect.poll(() => part('cell-trigger', `[data-value='${value}']`).hasAttribute('data-selected')).toBe(true)
  })

  it('不可用的日子铺整格淡底横条（上下各收 2），相邻几天连成一条；邻月日字重回到常规', async () => {
    await mountCalendar()
    const root = part('root')
    const blocked = unavailableDays()
    const first = part('cell', `[data-value='${blocked[0]}']`)
    const second = part('cell', `[data-value='${blocked[1]}']`)
    const band = getComputedStyle(first, '::before')
    expect(band.backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(band.top).toBe('2px')
    expect(band.bottom).toBe('2px')
    expect(band.left).toBe('0px')
    expect(band.right).toBe('0px')
    // 同一行的相邻两格首尾相接：横条连成带
    if (first.getBoundingClientRect().top === second.getBoundingClientRect().top)
      expect(second.getBoundingClientRect().left).toBe(first.getBoundingClientRect().right)
    // 横条压在钮下面：钮的字仍是置灰色
    expect(getComputedStyle(part('cell-trigger', `[data-value='${blocked[0]}']`)).color).toBe(resolveColor('--xh-fg-disabled', root))

    expect(getComputedStyle(part('cell-trigger', '[data-outside-month]')).fontWeight).toBe('400')
    expect(getComputedStyle(part('cell-trigger', ':not([data-outside-month])')).fontWeight).toBe('500')
  })

  it('翻页钮是 24 见方的圆，悬停 100、按下 200；标题钮 24 高，悬停换 100 底而字色不变', async () => {
    await mountCalendar()
    const root = part('root')
    const action = resolveLength('--xh-control-action-size', root)
    const next = part('next-trigger')
    expect(next.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(next.getAttribute('data-xh-action-variant')).toBe('ghost')
    expect(next.getAttribute('data-xh-action-size')).toBe('xs')
    expect(next.getBoundingClientRect().width).toBe(action)
    expect(next.getBoundingClientRect().height).toBe(action)
    expect(getComputedStyle(next).borderTopLeftRadius).toBe('50%')
    await userEvent.hover(next)
    expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(next)
    expect(getComputedStyle(next).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(unscaled(next)).toBe(true)
    await releasePointerAway()

    const month = part('heading-month-trigger')
    expect(month.getAttribute('data-xh-action-profile')).toBe('text')
    expect(month.getBoundingClientRect().height).toBe(action)
    await userEvent.hover(month)
    expect(getComputedStyle(month).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(month).color).toBe(resolveColor('--xh-fg-default', root))
    await pressPointer(month)
    expect(getComputedStyle(month).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
  })

  it('周期视图：月格铺满格宽（左右各让 4）、24 高、控件圆角，面板与日视图同宽', async () => {
    await mountCalendar()
    const root = part('root')
    const dayWidth = part('grid').getBoundingClientRect().width
    part('heading-month-trigger').click()
    await nextTick()
    await nextTick()
    const grid = part('grid', `[data-view='month']`)
    expect(grid.getBoundingClientRect().width).toBe(dayWidth)
    expect(getComputedStyle(grid).rowGap).toBe('0px')
    const cell = part('cell', `[data-view='month']`)
    const trigger = cell.querySelector<HTMLElement>(`[data-part='cell-trigger']`)!
    expect(trigger.getBoundingClientRect().height).toBe(resolveLength('--xh-control-action-size', root))
    expect(trigger.getBoundingClientRect().width).toBe(cell.getBoundingClientRect().width - 8)
    const shape = document.createElement('span')
    shape.style.borderRadius = 'var(--xh-shape-control)'
    root.append(shape)
    expect(getComputedStyle(trigger).borderTopLeftRadius).toBe(getComputedStyle(shape).borderTopLeftRadius)
    shape.remove()
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

  it('强制色下今天的圆点取系统前景，选中格换 Highlight 描边', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    await mountCalendar()
    const root = part('root')
    const mark = getComputedStyle(part('cell', '[data-today]'), '::after')
    expect(mark.forcedColorAdjust).toBe('none')
    const probe = document.createElement('span')
    probe.style.cssText = 'forced-color-adjust: none; background-color: CanvasText'
    root.append(probe)
    expect(mark.backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
    probe.style.backgroundColor = 'Highlight'
    expect(getComputedStyle(part('cell-trigger', '[data-selected]')).borderTopColor).toBe(getComputedStyle(probe).backgroundColor)
    probe.remove()
  })

  it('打印时今天的圆点改由描边画满', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print' })
    await mountCalendar()
    const mark = getComputedStyle(part('cell', '[data-today]'), '::after')
    expect(mark.borderTopWidth).toBe('2px')
    expect(mark.borderTopStyle).toBe('solid')
  })
})
