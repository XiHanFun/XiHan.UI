// 分栏的折叠 / 展开：面板尺寸沿过渡让出空间，与 Layout 侧栏折叠同一种节奏；方向键步进与拖拽跟手，不带过渡。
// jsdom 不跑过渡，要在真实浏览器里看面板身上有没有 flex-basis 过渡在播。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSplitterPanel, XhSplitterResizeTrigger, XhSplitterRoot } from '../../src'
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
  return host!.querySelector<HTMLElement>(`[data-scope='splitter'][data-part='${name}']`)!
}

/** 面板身上正在播的过渡属性。 */
function transitions(el: HTMLElement): string[] {
  return el.getAnimations()
    .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
    .map(animation => animation.transitionProperty)
}

describe('splitter 折叠过渡', () => {
  it('Enter 折叠：面板尺寸沿过渡让出，播完撤下 data-animating；方向键步进照旧跟手', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhSplitterRoot, {
        panels: [{ id: 'nav', collapsible: true, min: 10 }, { id: 'main' }],
        style: 'inline-size: 400px; block-size: 120px',
      }, () => [
        h(XhSplitterPanel, { index: 0 }, () => '导航'),
        h(XhSplitterResizeTrigger, { index: 0 }),
        h(XhSplitterPanel, { index: 1 }, () => '正文'),
      ]),
    })
    app.mount(host)
    await nextTick()
    const root = part('root')
    const panel = part('panel')
    const trigger = part('resize-trigger')
    trigger.focus()

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(panel.hasAttribute('data-collapsed')).toBe(true)
    expect(root.hasAttribute('data-animating')).toBe(true)
    expect(transitions(panel)).toContain('flex-basis')
    await expect.poll(() => root.hasAttribute('data-animating')).toBe(false)
    expect(panel.getBoundingClientRect().width).toBeLessThan(2)

    // 展开回来之后再用方向键步进：跟手，不走过渡
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await expect.poll(() => root.hasAttribute('data-animating')).toBe(false)
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(root.hasAttribute('data-animating')).toBe(false)
    expect(transitions(panel)).toEqual([])
  })
})
