// 时间列里的格子是浮层里的通栏行：24 高的通栏条（--xh-control-action-size），列内间距撑出行距，
// 不随尺寸档变高；字号随档，与 Select 的候选行同字号。TimePicker 与 DatePicker 的时间列同一种行。
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

function time(size: Size): VNode {
  return h(XhTimePickerRoot, { open: true, size, value: '09:30' }, () => [
    h(XhTimePickerControl, null, () => h(XhTimePickerSegmentGroup, null, () => [h(XhTimePickerSegment, { segment: 'hour' })])),
    h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () =>
      h(XhTimePickerColumn, { unit: 'hour' }, () => ['08', '09', '10'].map(value =>
        h(XhTimePickerItem, { key: value, value }, () => value))))),
  ])
}

function date(size: Size): VNode {
  return h(XhDatePickerRoot, { open: true, size, showTime: true, value: ['2026-09-11T09:30'] }, () => [
    h(XhDatePickerControl, null, () => h(XhDatePickerTrigger)),
    h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => h(XhDatePickerTimePanel))),
  ])
}

function select(size: Size): VNode {
  return h(XhSelectRoot, { collection: [{ value: 'a', label: '09' }], defaultOpen: true, size }, () => [
    h(XhSelectControl, null, () => h(XhSelectTrigger)),
    h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () =>
      h(XhSelectItem, { value: 'a' }, () => h(XhSelectItemText, null, () => '09'))))),
  ])
}

/** 令牌在该元素所在处解到的长度（px）：尺寸档与密度都写在祖先上，要在格子旁边解才对得上。 */
function resolveLength(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.inlineSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return value
}

async function measure(render: () => VNode, scope: string, part: string): Promise<{ height: number, font: string, action: number }> {
  await mount(render)
  const el = first(scope, part)
  const out = {
    height: el.getBoundingClientRect().height,
    font: getComputedStyle(el).fontSize,
    action: resolveLength('--xh-control-action-size', el.parentElement!),
  }
  app!.unmount()
  host!.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  return out
}

describe.each(['sm', 'md', 'lg'] as const)('%s 档的时间行', (size) => {
  it('timePicker 与 DatePicker 的时间格 24 高，字号与 Select 的候选行同档', async () => {
    const option = await measure(() => select(size), 'select', 'item')
    const timeItem = await measure(() => time(size), 'time-picker', 'item')
    const dateItem = await measure(() => date(size), 'date-picker', 'time-item')
    expect(timeItem.height).toBe(timeItem.action)
    expect(dateItem.height).toBe(dateItem.action)
    expect(timeItem.font).toBe(option.font)
    expect(dateItem.font).toBe(option.font)
  })
})
