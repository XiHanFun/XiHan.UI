// 时间列的滚动定位：打开时每一列都把选中的那一格停在列顶（首帧内容，直接到位），
// 之后选中值变了，变了的那一列平滑滚过去；减弱动效下直接到位。只有真实浏览器量得出滚动位置。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
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

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mountTimePicker(motion?: 'reduce'): Promise<void> {
  host = document.createElement('div')
  if (motion)
    host.dataset.motion = motion
  document.body.append(host)
  app = createApp({
    render: () => h(XhTimePickerRoot, { defaultOpen: true, defaultValue: '14:35' }, () => [
      h(XhTimePickerControl, null, () => h(XhTimePickerSegmentGroup, null, () => [
        h(XhTimePickerSegment, { segment: 'hour' }),
        h(XhTimePickerSegment, { segment: 'minute' }),
      ])),
      h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => [
        h(XhTimePickerColumn, { unit: 'hour' }, () => HOURS.map(value => h(XhTimePickerItem, { key: value, value }, () => value))),
        h(XhTimePickerColumn, { unit: 'minute' }, () => MINUTES.map(value => h(XhTimePickerItem, { key: value, value }, () => value))),
      ])),
    ]),
  })
  app.mount(host)
  await settle()
}

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function settle(): Promise<void> {
  await nextTick()
  await frames(3)
}

function column(scope: string, part: string, unit: string): HTMLElement {
  const columns = [...host!.ownerDocument.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)]
  const found = columns.find(el => el.getAttribute('data-value') === unit || el.getAttribute('data-unit') === unit)
  if (!found)
    throw new Error(`找不到 ${unit} 列`)
  return found
}

function option(list: HTMLElement, value: string): HTMLElement {
  const found = [...list.querySelectorAll<HTMLElement>('[role="option"]')].find(el => el.getAttribute('data-value') === value)
  if (!found)
    throw new Error(`找不到 ${value} 格`)
  return found
}

/** 这一格停到列顶时列该滚到的位置：它与第一格之间的距离，夹进可滚范围。 */
function alignedTop(list: HTMLElement, value: string): number {
  const first = list.querySelector<HTMLElement>('[role="option"]')!
  const distance = option(list, value).getBoundingClientRect().top - first.getBoundingClientRect().top
  return Math.min(distance, list.scrollHeight - list.clientHeight)
}

describe('时间列滚动定位', () => {
  it('打开时每一列都把选中的那一格停在列顶，首帧直接到位', async () => {
    await mountTimePicker()
    const hour = column('time-picker', 'column', 'hour')
    const minute = column('time-picker', 'column', 'minute')
    expect(alignedTop(hour, '14')).toBeGreaterThan(0)
    expect(Math.abs(hour.scrollTop - alignedTop(hour, '14'))).toBeLessThanOrEqual(1)
    expect(Math.abs(minute.scrollTop - alignedTop(minute, '35'))).toBeLessThanOrEqual(1)
  })

  it('选中值变了：那一列平滑滚到新的一格，别的列不动', async () => {
    await mountTimePicker()
    const hour = column('time-picker', 'column', 'hour')
    const minute = column('time-picker', 'column', 'minute')
    const hourBefore = hour.scrollTop
    const from = minute.scrollTop
    const to = alignedTop(minute, '50')
    option(minute, '50').click()
    await nextTick()
    await frames(4)
    // 滚动途中：离开了原处，还没到
    expect(minute.scrollTop).toBeGreaterThan(from)
    expect(minute.scrollTop).toBeLessThan(to)
    await new Promise<void>(resolve => minute.addEventListener('scrollend', () => resolve(), { once: true }))
    expect(Math.abs(minute.scrollTop - to)).toBeLessThanOrEqual(1)
    expect(hour.scrollTop).toBe(hourBefore)
  })

  it('减弱动效下换值直接到位', async () => {
    await mountTimePicker('reduce')
    const minute = column('time-picker', 'column', 'minute')
    option(minute, '05').click()
    await nextTick()
    await frames(2)
    expect(Math.abs(minute.scrollTop - alignedTop(minute, '05'))).toBeLessThanOrEqual(1)
  })
})
