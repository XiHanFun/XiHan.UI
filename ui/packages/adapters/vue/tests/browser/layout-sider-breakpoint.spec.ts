// 侧栏断点：视口窄于断点时覆盖档侧栏收起。挂载时就窄的页面上，侧栏从没打开过，不该先闪出一块展开的面板、
// 再播一段收起的退场；视口跨过断点这种环境引起的切换同样直接落位。用户按把手的开合照常播。
// jsdom 不跑过渡，要在真实浏览器里看侧栏与遮罩身上有没有过渡在播。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhLayoutContent, XhLayoutRoot, XhLayoutSider, XhLayoutSiderBackdrop, XhLayoutSiderTrigger } from '../../src'
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

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='layout'][data-part='${name}']`)!
}

/** 部件身上正在播的过渡属性。 */
function transitions(el: HTMLElement): string[] {
  return el.getAnimations()
    .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
    .map(animation => animation.transitionProperty)
}

describe('layout 侧栏断点', () => {
  it('挂载时就窄于断点：覆盖档侧栏直接收起，不闪出展开的面板、不播收起的退场；按把手展开照常播', async () => {
    // 断点取一个远宽于测试视口的档：挂载那一刻就是窄屏
    const breakpoint = window.innerWidth < 1280 ? 'xl' : '2xl'
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhLayoutRoot, { siderPresentation: 'sheet', siderBreakpoint: breakpoint }, () => [
        h(XhLayoutSiderBackdrop),
        h(XhLayoutSider, null, () => '导航'),
        h(XhLayoutContent, null, () => [h(XhLayoutSiderTrigger, null, () => '菜单'), '内容']),
      ]),
    })
    app.mount(host)
    await nextTick()
    await frames(2)

    const sider = part('sider')
    const backdrop = part('sider-backdrop')
    expect(sider.hasAttribute('data-collapsed')).toBe(true)
    expect(transitions(sider)).toEqual([])
    expect(transitions(backdrop)).toEqual([])
    expect(getComputedStyle(sider).visibility).toBe('hidden')

    part('sider-trigger').click()
    await nextTick()
    await frames(1)
    expect(sider.hasAttribute('data-collapsed')).toBe(false)
    expect(transitions(sider)).toContain('translate')
  })
})
