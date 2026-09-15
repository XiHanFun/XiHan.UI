// TimeRangePicker 的输入行是起止两组段位夹一个分隔符；浮层里是起止两组时列并排、各带标题。
// 两组的排布、分隔线与选中格只落在自己那一组，这些几何只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='time-range-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到部件 ${name}`)
  return element
}

function parts(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='time-range-picker'][data-part='${name}']`)]
}

function item(index: 0 | 1, unit: string, value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='time-range-picker'][data-part='column-group'][data-index='${index}'] [data-part='column'][data-value='${unit}'] [data-part='item'][data-value='${value}']`,
  )
  if (!element)
    throw new Error(`找不到第 ${index} 组 ${unit} 列的 ${value}`)
  return element
}

const values: string[][] = []

function segmentGroup(index: 0 | 1) {
  return h(XhTimeRangePickerSegmentGroup, { index }, () => [
    h(XhTimeRangePickerSegment, { segment: 'hour' }),
    h('span', ':'),
    h(XhTimeRangePickerSegment, { segment: 'minute' }),
    h(XhTimeRangePickerSegment, { segment: 'dayPeriod' }),
  ])
}

function columnGroup(index: 0 | 1, label: string) {
  return h(XhTimeRangePickerColumnGroup, { index }, () => [
    h(XhTimeRangePickerColumnGroupLabel, null, () => label),
    h(XhTimeRangePickerColumn, { unit: 'hour' }, {
      default: ({ options }: { options: string[] }) => options.map(value => h(XhTimeRangePickerItem, { key: value, value })),
    }),
    h(XhTimeRangePickerColumn, { unit: 'minute' }, {
      default: ({ options }: { options: string[] }) => options.map(value => h(XhTimeRangePickerItem, { key: value, value })),
    }),
    h(XhTimeRangePickerColumn, { unit: 'dayPeriod' }, {
      default: ({ options }: { options: string[] }) => options.map(value => h(XhTimeRangePickerItem, { key: value, value })),
    }),
  ])
}

async function mountPicker(props: Record<string, unknown> = {}): Promise<void> {
  values.length = 0
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTimeRangePickerRoot, {
      min: '08:00',
      max: '11:00',
      step: 30,
      onValueChange: ({ value }: { value: string[] }) => values.push(value),
      ...props,
    }, () => [
      h(XhTimeRangePickerControl, null, () => [
        segmentGroup(0),
        h(XhTimeRangePickerRangeSeparator),
        segmentGroup(1),
        h(XhTimeRangePickerTrigger),
      ]),
      h(XhTimeRangePickerPositioner, null, () => h(XhTimeRangePickerContent, null, () => [
        columnGroup(0, '开始'),
        columnGroup(1, '结束'),
      ])),
    ]),
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

describe('时间范围选择器的输入行', () => {
  it('分隔部件默认字符不进入可访问树；起点那组只占自己的宽度，分隔符紧跟在它后面', async () => {
    await mountPicker()
    const separator = part('range-separator')
    const style = getComputedStyle(separator)
    expect(separator.textContent).toBe('-')
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    expect(style.display).toBe('flex')
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)

    const [start, end] = parts('segment-group')
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
    await mountPicker({ defaultValue: ['10:30', '09:00'] })
    const [start, end] = parts('segment-group')
    expect(start!.getAttribute('aria-label')).toBe('Start time')
    expect(end!.getAttribute('aria-label')).toBe('End time')
    expect(part('root').hasAttribute('data-invalid')).toBe(true)
    expect(part('control').hasAttribute('data-invalid')).toBe(true)
  })
})

describe('浮层里的两组时列', () => {
  it('两组并排、标题各自独占顶上一行，第二组左侧画出分隔线', async () => {
    await mountPicker({ defaultOpen: true })
    await nextTick()
    const [first, second] = parts('column-group')
    const [firstLabel, secondLabel] = parts('column-group-label')
    expect(first!.getAttribute('data-index')).toBe('0')
    expect(second!.getAttribute('data-index')).toBe('1')
    expect(firstLabel!.textContent).toBe('开始')
    expect(secondLabel!.textContent).toBe('结束')

    // 并排：第二组整个在第一组右侧，顶边对齐
    expect(second!.getBoundingClientRect().left).toBeGreaterThanOrEqual(first!.getBoundingClientRect().right)
    expect(second!.getBoundingClientRect().top).toBeCloseTo(first!.getBoundingClientRect().top, 0)
    // 标题独占一行：宽度撑满组、列全落在它下面
    const hourColumn = first!.querySelector<HTMLElement>(`[data-part='column']`)!
    expect(firstLabel!.getBoundingClientRect().width).toBeCloseTo(first!.getBoundingClientRect().width, 0)
    expect(hourColumn.getBoundingClientRect().top).toBeGreaterThanOrEqual(firstLabel!.getBoundingClientRect().bottom)
    // 分隔线长在第二组的起始边上
    expect(Number.parseFloat(getComputedStyle(second!).borderInlineStartWidth)).toBeGreaterThan(0)
    expect(getComputedStyle(first!).borderInlineStartWidth).toBe('0px')

    // 分隔线两侧与浮层四周使用同一档留白，不在右侧和底部突然收窄
    const contentStyle = getComputedStyle(part('content'))
    const secondStyle = getComputedStyle(second!)
    const spacing = Number.parseFloat(secondStyle.marginInlineStart)
    expect(Number.parseFloat(secondStyle.paddingInlineStart)).toBe(spacing)
    expect(Number.parseFloat(contentStyle.paddingInlineStart)).toBe(spacing)
    expect(Number.parseFloat(contentStyle.paddingInlineEnd)).toBe(spacing)
    expect(Number.parseFloat(contentStyle.paddingBlockStart)).toBe(spacing)
    expect(Number.parseFloat(contentStyle.paddingBlockEnd)).toBe(spacing)

    // 每组的末端必须由最后一列收口，不能在分钟列后再残留一段隐形列宽。
    for (const group of [first!, second!]) {
      const columns = [...group.querySelectorAll<HTMLElement>("[data-part='column']:not([hidden])")]
      const lastColumn = columns.at(-1)!
      expect(group.getBoundingClientRect().right).toBeCloseTo(lastColumn.getBoundingClientRect().right, 0)
    }
  })

  it('选中格只亮在自己那一组；终点组的界外时仍在原位但不可选', async () => {
    await mountPicker({ defaultOpen: true, defaultValue: ['09:30', ''] })
    await nextTick()
    expect(item(0, 'hour', '09').getAttribute('data-state')).toBe('checked')
    expect(item(1, 'hour', '09').getAttribute('data-state')).toBe('unchecked')
    // 区间约束不删选项；起点 09:30 之前和作者 max 之后的小时留在原位并禁用。
    const endHours = [...parts('column-group')[1]!.querySelectorAll<HTMLElement>(`[data-part='column'][data-value='hour'] [data-part='item']`)]
      .map(el => el.getAttribute('data-value'))
    expect(endHours).toEqual(Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')))
    expect(item(1, 'hour', '08').getAttribute('aria-disabled')).toBe('true')
    expect(item(1, 'hour', '09').getAttribute('aria-disabled')).toBe('false')
    expect(item(1, 'hour', '12').getAttribute('aria-disabled')).toBe('true')

    await userEvent.click(item(1, 'hour', '10'))
    await userEvent.click(item(1, 'minute', '00'))
    await nextTick()
    expect(values.at(-1)).toEqual(['09:30', '10:00'])
    expect(item(1, 'hour', '10').getAttribute('data-state')).toBe('checked')
    expect(item(0, 'hour', '10').getAttribute('data-state')).toBe('unchecked')
  })

  it('十二小时制在区间未填齐与填齐之间保持列数和面板几何稳定', async () => {
    await mountPicker({
      defaultOpen: true,
      hourCycle: 12,
      locale: 'zh-CN',
      min: undefined,
      max: undefined,
      defaultValue: ['', '03:00'],
    })
    await nextTick()
    const content = part('content')
    const before = content.getBoundingClientRect()
    const startHour = parts('column-group')[0]!.querySelector<HTMLElement>("[data-part='column'][data-value='hour']")!

    expect(startHour.querySelectorAll("[data-part='item']")).toHaveLength(12)
    expect(item(0, 'hour', '04').getAttribute('aria-disabled')).toBe('true')

    await userEvent.click(item(0, 'hour', '03'))
    await nextTick()
    expect(startHour.querySelectorAll("[data-part='item']")).toHaveLength(12)
    expect(part('content').getBoundingClientRect().height).toBeCloseTo(before.height, 0)

    await userEvent.click(item(0, 'minute', '00'))
    await nextTick()
    expect(parts('column-group')[1]!.querySelectorAll("[data-part='column'][data-value='hour'] [data-part='item']")).toHaveLength(12)
    expect(item(1, 'hour', '02').getAttribute('aria-disabled')).toBe('true')
    const after = content.getBoundingClientRect()
    expect(after.width).toBeCloseTo(before.width, 0)
    expect(after.height).toBeCloseTo(before.height, 0)
  })
})
