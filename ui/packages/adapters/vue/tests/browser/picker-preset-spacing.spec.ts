// 日期、日期范围、时间、时间范围四种面板的快捷项共用一套排法：24 高的淡底小钮一颗挨一颗，
// 相邻两颗只隔 --xh-space-1。隔得再开，一列六七个选项会比旁边的日历网格还松，读起来不像一组。
// 间距要按真实布局量，只有 Chromium 量得出来。
import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerContent,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerRoot,
  XhDateRangePickerContent,
  XhDateRangePickerPositioner,
  XhDateRangePickerPresetGroup,
  XhDateRangePickerRoot,
  XhTimePickerContent,
  XhTimePickerPositioner,
  XhTimePickerPresetGroup,
  XhTimePickerRoot,
  XhTimeRangePickerContent,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerPresetGroup,
  XhTimeRangePickerRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface PickerCase {
  scope: string
  root: Component
  positioner: Component
  content: Component
  group: Component
  presets: Array<{ value: string, label: string }>
}

const CASES: PickerCase[] = [
  {
    scope: 'date-picker',
    root: XhDatePickerRoot,
    positioner: XhDatePickerPositioner,
    content: XhDatePickerContent,
    group: XhDatePickerPresetGroup,
    presets: [
      { value: '2026-09-10', label: '今天' },
      { value: '2026-09-09', label: '昨天' },
      { value: '2026-09-03', label: '一周前' },
    ],
  },
  {
    scope: 'date-range-picker',
    root: XhDateRangePickerRoot,
    positioner: XhDateRangePickerPositioner,
    content: XhDateRangePickerContent,
    group: XhDateRangePickerPresetGroup,
    presets: [
      { value: '2026-09-10/2026-09-10', label: '今天' },
      { value: '2026-09-04/2026-09-10', label: '近 7 天' },
      { value: '2026-09-01/2026-09-30', label: '本月' },
    ],
  },
  {
    scope: 'time-picker',
    root: XhTimePickerRoot,
    positioner: XhTimePickerPositioner,
    content: XhTimePickerContent,
    group: XhTimePickerPresetGroup,
    presets: [
      { value: '09:00', label: '上班' },
      { value: '12:00', label: '午休' },
      { value: '18:00', label: '下班' },
    ],
  },
  {
    scope: 'time-range-picker',
    root: XhTimeRangePickerRoot,
    positioner: XhTimeRangePickerPositioner,
    content: XhTimeRangePickerContent,
    group: XhTimeRangePickerPresetGroup,
    presets: [
      { value: '09:00/12:00', label: '上午' },
      { value: '13:00/18:00', label: '下午' },
      { value: '09:00/18:00', label: '全天' },
    ],
  },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(picker: PickerCase): Promise<HTMLElement[]> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(picker.root, { defaultOpen: true, locale: 'zh-CN', presets: picker.presets }, () =>
      h(picker.positioner, null, () => h(picker.content, null, () => h(picker.group)))),
  })
  app.mount(host)
  await nextTick()
  await expect.poll(() => document.querySelectorAll(`[data-scope='${picker.scope}'][data-part='preset']`).length).toBe(3)
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='${picker.scope}'][data-part='preset']`)]
}

/** 语义令牌在该元素里解到的长度。 */
function resolveLength(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.cssText = `display: block; position: absolute; inline-size: var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return value
}

describe.each(CASES)('$scope 的快捷项', (picker) => {
  it('相邻两颗只隔 --xh-space-1：竖排量上下、窄档横排量左右', async () => {
    const [first, second, third] = await mount(picker)
    const group = first!.parentElement!
    const step = resolveLength('--xh-space-1', group)
    const column = getComputedStyle(group).flexDirection === 'column'
    for (const [a, b] of [[first!, second!], [second!, third!]] as const) {
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      const gap = column ? rb.top - ra.bottom : rb.left - ra.right
      expect(gap).toBeCloseTo(step, 1)
    }
  })
})
