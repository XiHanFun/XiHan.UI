// Alert 的横幅：贴着容器的边铺满整行，不取圆角，只在朝向页面内容的块尾画一道描边；
// 面、语气与关闭照旧。圆角、各边描边宽度与铺满与否只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhAlertCloseTrigger, XhAlertContent, XhAlertDescription, XhAlertRoot, XhAlertTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='alert'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 alert/${name}`)
  return element
}

async function mount(banner: boolean): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhAlertRoot, { tone: 'info', banner }, () => [
      h(XhAlertContent, null, () => [
        h(XhAlertTitle, null, () => '系统将于今晚 23:00 维护'),
        h(XhAlertDescription, null, () => '维护期间无法提交表单'),
      ]),
      h(XhAlertCloseTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

describe('alert 横幅', () => {
  it('贴边铺满、不取圆角，只在块尾画一道默认描边', async () => {
    await mount(true)
    const root = part('root')
    const style = getComputedStyle(root)
    expect(root.getBoundingClientRect().width).toBeCloseTo(host!.getBoundingClientRect().width, 0)
    expect(style.borderTopLeftRadius).toBe('0px')
    expect(style.borderBottomRightRadius).toBe('0px')
    expect(style.borderTopWidth).toBe('0px')
    expect(style.borderLeftWidth).toBe('0px')
    expect(style.borderRightWidth).toBe('0px')
    expect(style.borderBottomWidth).toBe('1px')
    expect(style.boxShadow).toBe('none')
  })

  it('页内提示照旧是一块四边描边、带面圆角的面', async () => {
    await mount(false)
    const style = getComputedStyle(part('root'))
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderLeftWidth).toBe('1px')
    expect(style.borderTopLeftRadius).not.toBe('0px')
  })

  it('横幅的面、描边色与关闭钮与页内提示一致', async () => {
    await mount(false)
    const inline = getComputedStyle(part('root'))
    const inlineBackground = inline.backgroundColor
    const inlineBorder = inline.borderBottomColor
    app!.unmount()
    host!.remove()
    await mount(true)
    const banner = getComputedStyle(part('root'))
    expect(banner.backgroundColor).toBe(inlineBackground)
    expect(banner.borderBottomColor).toBe(inlineBorder)
    expect(getComputedStyle(part('close-trigger')).display).not.toBe('none')
  })
})
