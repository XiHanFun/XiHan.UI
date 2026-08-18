// 浮层搬出 root 之后皮肤还接不接得上，只能在真实浏览器里验：判据是级联算出来的字号与内缩。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤给出的私有槽取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 挂一条展开着的菜单栏，尺寸档由入参决定。 */
function mountMenubar(size?: 'sm' | 'lg'): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhMenubarRoot, { defaultValue: 'file', size }, () => [
      h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
      h(XhMenubarPositioner, { value: 'file' }, () => [
        h(XhMenubarContent, null, () => [
          h(XhMenubarItem, { value: 'new' }, () => [h(XhMenubarItemText, null, () => '新建')]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
}

function item(): HTMLElement {
  const el = document.querySelector<HTMLElement>('[data-scope="menubar"][data-part="item"]')
  if (!el)
    throw new Error('menubar 的 item 不在文档里')
  return el
}

describe('menubar 浮层的皮肤', () => {
  it('私有槽在 positioner 上重新起头，条目拿得到缺省档', () => {
    mountMenubar()
    const style = getComputedStyle(item())
    expect(style.fontSize).not.toBe('')
    expect(Number.parseFloat(style.paddingLeft)).toBeGreaterThan(0)
  })

  it('尺寸档换到 sm / lg，浮层里的条目跟着换', () => {
    mountMenubar('sm')
    const small = getComputedStyle(item())
    const smallText = Number.parseFloat(small.fontSize)
    const smallPad = Number.parseFloat(small.paddingLeft)
    app?.unmount()
    host?.remove()

    mountMenubar('lg')
    const large = getComputedStyle(item())
    expect(Number.parseFloat(large.fontSize)).toBeGreaterThan(smallText)
    expect(Number.parseFloat(large.paddingLeft)).toBeGreaterThan(smallPad)
  })
})
