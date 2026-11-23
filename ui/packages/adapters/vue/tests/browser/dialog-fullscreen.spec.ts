// 对话框的全屏形态：面板铺满视口，贴住视口的边不取圆角、不画描边与投影；
// 头尾定在原处、正文吃掉剩下的高度。几何与这几样计算样式只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDialogBody, XhDialogCloseTrigger, XhDialogContent, XhDialogFooter, XhDialogHeader, XhDialogRoot, XhDialogTitle } from '../../src'
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
  const el = document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 dialog/${name}`)
  return el
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDialogRoot, { open: true, ...props }, () =>
      h(XhDialogContent, null, () => [
        h(XhDialogHeader, null, () => [h(XhDialogTitle, null, () => '编辑报表')]),
        h(XhDialogBody, null, () => h('p', null, '正文')),
        h(XhDialogFooter, null, () => h('button', null, '保存')),
        h(XhDialogCloseTrigger),
      ])),
  })
  app.mount(host)
  await nextTick()
  // 等入场播完再量：进场关键帧会让矩形与不透明度失真
  await expect.poll(() => part('content').getAnimations().length, { timeout: 2000 }).toBe(0)
}

describe('dialog 全屏', () => {
  it('面板铺满视口：四边贴住视口，正文吃掉头尾之外的高度', async () => {
    await mount({ fullscreen: true })
    const rect = part('content').getBoundingClientRect()
    expect(rect.left).toBeCloseTo(0, 0)
    expect(rect.top).toBeCloseTo(0, 0)
    expect(rect.width).toBeCloseTo(document.documentElement.clientWidth, 0)
    expect(rect.height).toBeCloseTo(window.innerHeight, 0)

    const header = part('header').getBoundingClientRect()
    const body = part('body').getBoundingClientRect()
    const footer = part('footer').getBoundingClientRect()
    expect(header.top).toBeCloseTo(rect.top, 0)
    expect(footer.bottom).toBeCloseTo(rect.bottom, 0)
    expect(body.height).toBeCloseTo(rect.height - header.height - footer.height, 0)
  })

  it('贴住视口的边不取圆角，不画描边与投影', async () => {
    await mount({ fullscreen: true })
    const style = getComputedStyle(part('content'))
    expect(style.borderTopLeftRadius).toBe('0px')
    expect(style.borderBottomRightRadius).toBe('0px')
    expect(style.borderTopWidth).toBe('0px')
    expect(style.borderInlineStartWidth).toBe('0px')
    expect(style.boxShadow).toBe('none')
  })

  it('全屏时宽度档与拖动不生效', async () => {
    await mount({ fullscreen: true, size: 'sm', draggable: true })
    const content = part('content')
    expect(content.getBoundingClientRect().width).toBeCloseTo(document.documentElement.clientWidth, 0)
    expect(content.hasAttribute('data-draggable')).toBe(false)
  })

  it('不开全屏的对话框不受影响：仍受宽度档封顶、居中、带圆角', async () => {
    await mount({ size: 'sm' })
    const rect = part('content').getBoundingClientRect()
    expect(rect.width).toBeLessThan(document.documentElement.clientWidth)
    expect(rect.left).toBeGreaterThan(0)
    expect(getComputedStyle(part('content')).borderTopLeftRadius).not.toBe('0px')
  })
})
