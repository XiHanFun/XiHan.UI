import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerPositioner,
  XhDateRangePickerPresetGroup,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到部件 ${name}`)
  return element
}

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

const values: string[][] = []

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

/** 紧跟在某个层后面的条子，按轴取。 */
function barsAfter(el: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = []
  let next = el.nextElementSibling
  while (next instanceof HTMLElement && next.dataset.scope === 'scrollbar' && next.dataset.part === 'root') {
    out.push(next)
    next = next.nextElementSibling
  }
  return out
}

function segmentGroup(index: 0 | 1) {
  return h(XhDateRangePickerSegmentGroup, { index }, () => [
    h(XhDateRangePickerSegment, { index: 0 }),
    h('span', '/'),
    h(XhDateRangePickerSegment, { index: 1 }),
    h('span', '/'),
    h(XhDateRangePickerSegment, { index: 2 }),
  ])
}

async function mountPicker(props: Record<string, unknown> = {}): Promise<void> {
  values.length = 0
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDateRangePickerRoot, {
      defaultFocusedValue: '2026-09-09',
      locale: 'zh-CN',
      timeZone: 'UTC',
      onValueChange: ({ value }: { value: string[] }) => values.push(value),
      ...props,
    }, {
      default: ({ weeks, weekDays }: any) => [
        h(XhDateRangePickerControl, null, () => [
          segmentGroup(0),
          h(XhDateRangePickerRangeSeparator),
          segmentGroup(1),
          h(XhDateRangePickerClearTrigger),
          h(XhDateRangePickerTrigger),
        ]),
        h(XhDateRangePickerPositioner, null, () => h(XhDateRangePickerContent, null, () => [
          ...(props.presets ? [h(XhDateRangePickerPresetGroup)] : []),
          h(XhDateRangePickerCalendar, null, () => h(XhDateRangePickerGrid, null, () => [
            h(XhDateRangePickerGridHead, null, () => h(XhDateRangePickerWeekRow, null, () =>
              weekDays.map((day: any) => h(XhDateRangePickerWeekDay, { key: day.value, value: day.value })))),
            h(XhDateRangePickerGridBody, null, () => weeks.map((week: any[]) =>
              h(XhDateRangePickerWeekRow, { key: week[0].start }, () => week.map(day =>
                h(XhDateRangePickerCell, { key: day.start, value: day.start }, () =>
                  h(XhDateRangePickerCellTrigger, null, () => String(day.day))))))),
          ])),
        ])),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

const PRESETS = [
  { value: '2026-09-01/2026-09-30', label: '本月' },
  { value: '2026-10-01/2026-10-31', label: '下月' },
]

describe('日期范围选择器的家族观感', () => {
  it('输入行是描边式字段外壳：canvas 底 + 描边 + 无影，聚焦时描边换焦点色并带环', async () => {
    await mountPicker()
    const control = part('control')
    control.style.transition = 'none'
    const rest = getComputedStyle(control)
    expect(control.getAttribute('data-xh-field-chrome')).toBe('')
    expect(alpha(rest.backgroundColor)).toBe(255)
    expect(rest.borderTopStyle).toBe('solid')
    expect(alpha(rest.borderTopColor)).toBe(255)
    expect(rest.boxShadow).toBe('none')
    expect(rest.borderRadius).toBe('4px')
    expect(rest.height).toBe('36px')
    const restBorder = rest.borderTopColor
    document.querySelector<HTMLElement>(`[data-scope='date-field'][data-part='segment']`)!.focus()
    await nextTick()
    const focused = getComputedStyle(control)
    expect(focused.borderTopColor).not.toBe(restBorder)
    expect(focused.outlineStyle).toBe('solid')
    expect(Number.parseFloat(focused.outlineWidth)).toBeGreaterThan(0)
  })

  it('日历钮与清空钮是盒内 field-inset 正方钮：inset 圆角、悬停 100 / 按下 200 与 0.97 缩放', async () => {
    await mountPicker({ defaultValue: ['2026-09-07', '2026-09-11'] })
    const clear = part('clear-trigger')
    clear.style.transition = 'none'
    expect(clear.getAttribute('data-xh-action-profile')).toBe('field-inset')
    expect(clear.getAttribute('data-xh-action-has-value')).toBe('')
    expect(part('trigger').getAttribute('data-xh-action-profile')).toBe('field-inset')
    // 有值时清空钮顶上来，日历钮让位
    expect(getComputedStyle(part('trigger')).display).toBe('none')
    const rest = getComputedStyle(clear)
    expect(rest.borderRadius).toBe('4px')
    expect(rest.width).toBe(rest.height)
    expect(alpha(rest.backgroundColor)).toBe(0)
    const probe = document.createElement('span')
    probe.style.background = 'var(--xh-bg-subtle)'
    part('control').append(probe)
    const hover100 = getComputedStyle(probe).backgroundColor
    probe.style.background = 'var(--xh-bg-subtle-hover)'
    const pressed200 = getComputedStyle(probe).backgroundColor
    probe.remove()
    await userEvent.hover(clear)
    expect(getComputedStyle(clear).backgroundColor).toBe(hover100)
    clear.dataset.pressed = ''
    expect(getComputedStyle(clear).backgroundColor).toBe(pressed200)
    expect(getComputedStyle(clear).scale).toBe('0.97')
  })

  it('浮层是 floating 实体面：实体底 + 可见描边 + 落影，不透景、不画顶光', async () => {
    await mountPicker({ defaultOpen: true })
    await nextTick()
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(content.borderTopStyle).toBe('solid')
    expect(alpha(content.borderTopColor)).toBe(255)
    expect(content.boxShadow).not.toBe('none')
    expect(content.borderRadius).toBe('12px')
    expect(content.overscrollBehaviorY).toBe('contain')
    expect(getComputedStyle(part('content'), '::before').content).toBe('none')
  })

  it('快捷选项走浮层集合行：选中只留对号且透明底，悬停 100、按下 200；列后紧跟贴层的竖横两条条子', async () => {
    await mountPicker({ defaultOpen: true, defaultValue: ['2026-09-01', '2026-09-30'], presets: PRESETS })
    await nextTick()
    const [selected, plain] = document.querySelectorAll<HTMLElement>(`[data-scope='date-range-picker'][data-part='preset']`)
    selected!.style.transition = 'none'
    plain!.style.transition = 'none'
    expect(selected!.getAttribute('data-state')).toBe('checked')
    expect(selected!.getAttribute('data-xh-collection-context')).toBe('overlay')
    expect(alpha(getComputedStyle(selected!).backgroundColor)).toBe(0)
    expect(getComputedStyle(selected!).color).toBe(getComputedStyle(plain!).color)
    expect(getComputedStyle(selected!).fontWeight).toBe(getComputedStyle(plain!).fontWeight)
    expect(getComputedStyle(selected!, '::after').opacity).toBe('1')
    expect(getComputedStyle(plain!, '::after').opacity).toBe('0')
    await userEvent.hover(plain!)
    const hover = getComputedStyle(plain!).backgroundColor
    expect(alpha(hover)).toBe(255)
    plain!.dataset.pressed = ''
    const pressed = getComputedStyle(plain!).backgroundColor
    expect(pressed).not.toBe(hover)
    expect(getComputedStyle(plain!).scale).toBe('none')

    const group = part('preset-group')
    const bars = barsAfter(group)
    expect(bars.map(bar => bar.dataset.orientation)).toEqual(['vertical', 'horizontal'])
    expect(group.hasAttribute('data-xh-scrollbar')).toBe(true)
    expect(getComputedStyle(group).overscrollBehaviorY).toBe('contain')
    for (const bar of bars) {
      expect(bar.getAttribute('data-anchor')).toBe('layer')
      expect(bar.getAttribute('data-size')).toBe('sm')
      expect(getComputedStyle(bar.querySelector<HTMLElement>('[data-part="track"]')!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    }
    // 选项列与日历之间的空当由 preset-group ~ calendar 给，条子节点夹在两者之间也接得上
    const calendar = part('calendar')
    expect(calendar.previousElementSibling).not.toBe(group)
    const wide = window.matchMedia('(min-width: 768px)').matches
    expect(Number.parseFloat(getComputedStyle(calendar)[wide ? 'paddingInlineStart' : 'paddingBlockStart'])).toBeGreaterThan(0)
  })
})

describe('日期范围选择器的输入行', () => {
  it('分隔部件默认字符不进入可访问树；起点那组只占自己的宽度，分隔符紧跟在它后面', async () => {
    await mountPicker()
    const separator = part('range-separator')
    const style = getComputedStyle(separator)
    expect(separator.textContent).toBe('-')
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    expect(style.display).toBe('flex')
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)

    const [start, end] = document.querySelectorAll<HTMLElement>(`[data-scope='date-range-picker'][data-part='segment-group']`)
    expect(getComputedStyle(start!).flexGrow).toBe('0')
    expect(getComputedStyle(end!).flexGrow).toBe('1')
    // 分隔符紧跟在起点后面：两侧各只留一个小间距
    const gapBefore = separator.getBoundingClientRect().left - start!.getBoundingClientRect().right
    const gapAfter = end!.getBoundingClientRect().left - separator.getBoundingClientRect().right
    expect(gapBefore).toBeGreaterThan(0)
    expect(gapBefore).toBeLessThanOrEqual(6)
    expect(gapAfter).toBeCloseTo(gapBefore, 0)
  })

  it('两组段位各报各的名字，终点早于起点时整个控件画成不合法', async () => {
    await mountPicker({ defaultValue: ['2026-09-20', '2026-09-10'] })
    const [start, end] = document.querySelectorAll<HTMLElement>(`[data-scope='date-range-picker'][data-part='segment-group']`)
    expect(start!.getAttribute('aria-label')).toBe('Start date')
    expect(end!.getAttribute('aria-label')).toBe('End date')
    expect(part('root').hasAttribute('data-invalid')).toBe(true)
    expect(part('control').hasAttribute('data-invalid')).toBe(true)
  })
})

describe('浮层里的范围日历', () => {
  it('点触发钮展开：先落起点再落终点，两端都落定才写值并收起', async () => {
    await mountPicker()
    await userEvent.click(part('trigger'))
    await nextTick()
    expect(part('content').hasAttribute('hidden')).toBe(false)
    await userEvent.click(trigger('2026-09-07'))
    await nextTick()
    expect(values).toHaveLength(0)
    expect(cell('2026-09-07').getAttribute('aria-selected')).toBe('true')
    await userEvent.click(trigger('2026-09-11'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-09-07', '2026-09-11'])
    expect(part('root').getAttribute('data-state')).toBe('closed')
  })

  it('终点点在邻月格上：落的是被点的那一格，不是翻页后压在指针下的另一格', async () => {
    await mountPicker({ closeOnSelect: false })
    await userEvent.click(part('trigger'))
    await nextTick()
    await userEvent.click(trigger('2026-09-28'))
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(true)
    await userEvent.click(trigger('2026-10-06'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-09-28', '2026-10-06'])
    // 翻到了十月：10 月 6 日成了本月格子
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(false)
    expect(cell('2026-10-06').hasAttribute('data-range-end')).toBe(true)
  })
})
