// 时间列里的格子是「候选与菜单」语境的集合行：行高由 --xh-list-option-py-* 内距加一行文字撑开、随尺寸档变，
// 字号随档。TimePicker 与 DatePicker 的时间列同一种行，与 Select 的候选行同高。
// 判据是几何与计算样式，jsdom 不排版。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Size = 'sm' | 'md' | 'lg'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function first(scope: string, part: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']:not([hidden])`)
  if (!el)
    throw new Error(`找不到 ${scope}/${part}`)
  return el
}

const time = (size: Size): VNode => h(XhTimePickerRoot, { open: true, size, value: '09:30' }, () => [
  h(XhTimePickerControl, null, () => h(XhTimePickerSegmentGroup, null, () => [h(XhTimePickerSegment, { segment: 'hour' })])),
  h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () =>
    h(XhTimePickerColumn, { unit: 'hour' }, () => ['08', '09', '10'].map(value =>
      h(XhTimePickerItem, { key: value, value }, () => value))))),
])

const date = (size: Size): VNode => h(XhDatePickerRoot, { open: true, size, showTime: true, value: ['2026-09-11T09:30'] }, () => [
  h(XhDatePickerControl, null, () => h(XhDatePickerTrigger)),
  h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => h(XhDatePickerTimePanel))),
])

const select = (size: Size): VNode => h(XhSelectRoot, { collection: [{ value: 'a', label: '09' }], defaultOpen: true, size }, () => [
  h(XhSelectControl, null, () => h(XhSelectTrigger)),
  h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () =>
    h(XhSelectItem, { value: 'a' }, () => h(XhSelectItemText, null, () => '09'))))),
])

async function measure(render: () => VNode, scope: string, part: string): Promise<{ height: number, font: string }> {
  await mount(render)
  const el = first(scope, part)
  const out = { height: el.getBoundingClientRect().height, font: getComputedStyle(el).fontSize }
  app!.unmount()
  host!.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  return out
}

describe.each(['sm', 'md', 'lg'] as const)('%s 档的时间行', (size) => {
  it('TimePicker 与 DatePicker 的时间格与 Select 的候选行同高、同字号', async () => {
    const option = await measure(() => select(size), 'select', 'item')
    const timeItem = await measure(() => time(size), 'time-picker', 'item')
    const dateItem = await measure(() => date(size), 'date-picker', 'time-item')
    expect(timeItem.height).toBeCloseTo(option.height, 0)
    expect(dateItem.height).toBeCloseTo(option.height, 0)
    expect(timeItem.font).toBe(option.font)
    expect(dateItem.font).toBe(option.font)
  })
})
