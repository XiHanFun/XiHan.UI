// 起止两组段位各自一句整条占位：这一端一段都没填、焦点也不在这一端的段上时露出，段位与分隔符让位；
// 焦点进到起点的段上只换回起点那组。文字由皮肤以生成内容画出，段位只是淡出，仍可聚焦、仍在读屏树里。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimeRangePickerControl,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  host.style.width = '360px'
  document.body.append(host)
  const group = (index: number) => h(XhTimeRangePickerSegmentGroup, { index }, () => [
    h(XhTimeRangePickerSegment, { segment: 'hour' }),
    h('span', ':'),
    h(XhTimeRangePickerSegment, { segment: 'minute' }),
  ])
  app = createApp({ render: () => h(XhTimeRangePickerRoot, { locale: 'zh-CN', ...props }, () => h(XhTimeRangePickerControl, null, () => [
    group(0),
    h(XhTimeRangePickerRangeSeparator),
    group(1),
  ])) })
  app.mount(host)
  await settle()
}

function groups(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='time-range-picker'][data-part='segment-group']`)]
}

function expectPlaceholder(group: HTMLElement, text: string): void {
  expect(getComputedStyle(group, '::before').content).toBe(`"${text}"`)
  for (const child of group.children)
    expect(getComputedStyle(child).opacity).toBe('0')
}

function expectSegments(group: HTMLElement): void {
  expect(getComputedStyle(group, '::before').content).toBe('none')
  for (const segment of group.querySelectorAll<HTMLElement>(`[data-part='segment']:not([hidden])`))
    expect(getComputedStyle(segment).opacity).toBe('1')
}

describe('时间区间选择器的整条占位', () => {
  it('两端都空时各显示各的占位；焦点进到起点的段上只换回起点那组，离开又回来', async () => {
    await mount({ startPlaceholder: '开始时间', endPlaceholder: '结束时间' })
    const [start, end] = groups()
    expectPlaceholder(start!, '开始时间')
    expectPlaceholder(end!, '结束时间')
    expect(getComputedStyle(start!, '::before').pointerEvents).toBe('none')

    start!.querySelector<HTMLElement>(`[data-part='segment']`)!.focus()
    await settle()
    expectSegments(start!)
    expectPlaceholder(end!, '结束时间')

    start!.querySelector<HTMLElement>(`[data-part='segment']`)!.blur()
    await settle()
    expectPlaceholder(start!, '开始时间')
  })

  it('起点有值时起点段位照常，终点仍显示自己的占位', async () => {
    await mount({ startPlaceholder: '开始时间', endPlaceholder: '结束时间', defaultValue: ['09:00'] })
    const [start, end] = groups()
    expectSegments(start!)
    expectPlaceholder(end!, '结束时间')
  })
})
