// 根字号很小的宿主（≤ 11px）：时间列与底栏都按 px 定高，面板的天然高度就是它们的和。
// 面板上限若再按 rem 结算会随根字号缩小——时间选择器的底栏画到描边外，时间范围选择器出竖滚。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimePickerColumn,
  XhTimePickerConfirmTrigger,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerFooter,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerTagList,
  XhTimePickerTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRoot,
  XhTimeRangePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function part(scope: string, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`缺少 ${scope}/${name}`)
  return el
}

async function mount(rootFontSize: string, render: () => ReturnType<typeof h>): Promise<void> {
  // 视口高度不构成限制：只看面板自己的上限
  await page.viewport(1200, 900)
  document.documentElement.style.fontSize = rootFontSize
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await settle()
}

const options = (count: number): string[] => Array.from({ length: count }, (_, index) => String(index).padStart(2, '0'))

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  document.documentElement.style.fontSize = ''
  app = null
  host = null
})

describe('时间选择浮层在很小的根字号下', () => {
  for (const rootFontSize of ['10px', '16px']) {
    it(`根字号 ${rootFontSize}：时间选择器的底栏落在面板描边之内，面板不出竖向滚动`, async () => {
      await mount(rootFontSize, () => h(XhTimePickerRoot, { open: true, selectionMode: 'multiple' }, () => [
        h(XhTimePickerControl, null, () => [h(XhTimePickerTagList), h(XhTimePickerTrigger)]),
        h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => [
          ...(['hour', 'minute'] as const).map(unit => h(XhTimePickerColumn, { unit }, () =>
            options(unit === 'hour' ? 24 : 60).map(value => h(XhTimePickerItem, { key: value, value }, () => value)))),
          h(XhTimePickerFooter, null, () => h(XhTimePickerConfirmTrigger, null, () => '添加')),
        ])),
      ]))
      const content = part('time-picker', 'content')
      const edge = Number.parseFloat(getComputedStyle(content).borderBottomWidth)
      const footer = part('time-picker', 'footer').getBoundingClientRect()
      const observed = `content ${JSON.stringify(content.getBoundingClientRect())} footer ${JSON.stringify(footer)}`
      expect(footer.bottom, observed).toBeLessThanOrEqual(content.getBoundingClientRect().bottom - edge + 0.5)
      expect(content.scrollHeight, observed).toBeLessThanOrEqual(content.clientHeight)
    })

    it(`根字号 ${rootFontSize}：时间范围选择器两组时列放得下，面板不出竖向滚动`, async () => {
      await mount(rootFontSize, () => h(XhTimeRangePickerRoot, { open: true }, () => [
        h(XhTimeRangePickerControl, null, () => h(XhTimeRangePickerTrigger)),
        h(XhTimeRangePickerPositioner, null, () => h(XhTimeRangePickerContent, null, () =>
          ([0, 1] as const).map(index => h(XhTimeRangePickerColumnGroup, { index }, () => [
            h(XhTimeRangePickerColumnGroupLabel, null, () => (index === 0 ? '开始' : '结束')),
            ...(['hour', 'minute'] as const).map(unit => h(XhTimeRangePickerColumn, { unit }, {
              default: ({ options: values }: { options: string[] }) => values.map(value => h(XhTimeRangePickerItem, { key: value, value })),
            })),
          ])))),
      ]))
      const content = part('time-range-picker', 'content')
      const observed = `scrollHeight ${content.scrollHeight} clientHeight ${content.clientHeight}`
      expect(content.scrollHeight, observed).toBeLessThanOrEqual(content.clientHeight)
    })
  }
})
