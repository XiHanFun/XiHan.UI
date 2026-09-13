/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 date picker datetime input 相关行为。

import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerClearTrigger,
  XhDatePickerControl,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 date-picker/${name}`)
  return element
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDatePickerRoot, {
      defaultValue: '2026-09-08T14:30',
      locale: 'zh-CN',
      showTime: true,
    }, {
      default: ({ segments }: DatePickerRootSlotProps) => [
        h(XhDatePickerControl, null, () => [
          h(XhDatePickerSegmentGroup, null, () => segments.map((segment, index) =>
            h(XhDatePickerSegment, { key: segment.type, index }))),
          h(XhDatePickerClearTrigger),
          h(XhDatePickerTrigger),
        ]),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('日期时间选择器输入行', () => {
  it('显示完整日期时间，并由清空按钮原位接替日历图标', async () => {
    await mount()
    const segments = [...host!.querySelectorAll<HTMLElement>(`[data-scope='date-field'][data-part='segment']:not([hidden])`)]
    expect(segments.map(segment => segment.dataset.segment)).toEqual(['year', 'month', 'day', 'hour', 'minute'])
    expect(segments.map(segment => segment.textContent)).toEqual(['2026', '09', '08', '14', '30'])

    const clear = part('clear-trigger')
    const trigger = part('trigger')
    expect(clear.hidden).toBe(false)
    expect(getComputedStyle(clear).display).toBe('flex')
    expect(getComputedStyle(trigger).display).toBe('none')

    await userEvent.click(clear)
    await nextTick()
    expect(clear.hidden).toBe(true)
    expect(getComputedStyle(trigger).display).toBe('flex')
  })
})
