// 形状与分隔按身份取令牌：候选与菜单的集合行是嵌在面里的小块，圆角取 inset（与 control 同为 4px，但身份不同，
// 主题改 inset 时行跟着变、按钮与字段不动）；floating 面板（日期、时间）里的面内分隔取实体面的分隔令牌，
// 不取 frosted 的。判据是计算样式：把令牌换成一眼能认出的值，看部件是否跟着变。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
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

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  document.documentElement.style.removeProperty('--xh-shape-inset')
  document.documentElement.style.removeProperty('--xh-material-solid-separator')
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

function part(scope: string, name: string, index = 0): HTMLElement {
  const el = document.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)[index]
  if (!el)
    throw new Error(`找不到 ${scope}/${name}`)
  return el
}

describe('候选行的形状身份是 inset', () => {
  it('select 的选项圆角跟着 --xh-shape-inset 走，字段盒不动', async () => {
    document.documentElement.style.setProperty('--xh-shape-inset', '3px')
    await mount(() => h(XhSelectRoot, { collection: [{ value: 'a', label: '甲' }], defaultOpen: true }, () => [
      h(XhSelectControl, null, () => h(XhSelectTrigger)),
      h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () =>
        h(XhSelectItem, { value: 'a' }, () => h(XhSelectItemText, null, () => '甲'))))),
    ]))
    expect(getComputedStyle(part('select', 'item')).borderTopLeftRadius).toBe('3px')
    expect(getComputedStyle(part('select', 'control')).borderTopLeftRadius).toBe('4px')
  })
})

describe('floating 面板的面内分隔取实体面的分隔令牌', () => {
  it('time-picker 的列间分隔跟着 --xh-material-solid-separator 走', async () => {
    document.documentElement.style.setProperty('--xh-material-solid-separator', 'rgb(255, 0, 0)')
    await mount(() => h(XhTimePickerRoot, { open: true, value: '09:30' }, () => [
      h(XhTimePickerControl, null, () => h(XhTimePickerSegmentGroup, null, () => [h(XhTimePickerSegment, { segment: 'hour' })])),
      h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => [
        h(XhTimePickerColumn, { unit: 'hour' }, () => ['08', '09'].map(value => h(XhTimePickerItem, { key: value, value }, () => value))),
        h(XhTimePickerColumn, { unit: 'minute' }, () => ['15', '30'].map(value => h(XhTimePickerItem, { key: value, value }, () => value))),
      ])),
    ]))
    expect(getComputedStyle(part('time-picker', 'column', 1)).borderInlineStartColor).toBe('rgb(255, 0, 0)')
  })
})
