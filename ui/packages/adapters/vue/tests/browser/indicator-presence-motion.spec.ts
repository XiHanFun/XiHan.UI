// 指示条的出没与引导换步：锚点与导航菜单的指示条没有可指的项时先在原处淡出、播完才藏起，之前落过位、又有了可指的项时原地淡入；
// 漫游引导展开着换步时，气泡里的标题原地淡入。在播的动画只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourTitle,
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
  document.body.innerHTML = ''
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  return host
}

/** 节点上的脚本动画（不是 CSS 关键帧与过渡）。 */
function scripted(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('锚点指示条的出没', () => {
  it('没有可指的项时原地淡出、播完才藏起；再有了可指的项时原地淡入', async () => {
    mountHost()
    const value = ref<string | null>('a')
    app = createApp({
      render: () => h(XhAnchorRoot, { 'value': value.value, 'smooth': false, 'onUpdate:value': () => {} }, () => h(XhAnchorList, null, () => [
        h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'a' }, () => '概览')),
        h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'b' }, () => '安装')),
        h(XhAnchorIndicator),
      ])),
    })
    app.mount(host!)
    await frames(3)
    const indicator = host!.querySelector<HTMLElement>(`[data-scope='anchor'][data-part='indicator']`)!
    expect(indicator.hidden).toBe(false)
    expect(scripted(indicator), '首次落位直接呈现').toBeUndefined()
    const y = indicator.style.getPropertyValue('--xh-_anchor-indicator-y')
    value.value = null
    await frames(1)
    const leaving = scripted(indicator)!
    expect(leaving).toBeDefined()
    expect(indicator.hidden).toBe(false)
    expect(indicator.style.getPropertyValue('--xh-_anchor-indicator-y'), '淡出途中留在原处').toBe(y)
    leaving.finish()
    await expect.poll(() => indicator.hidden).toBe(true)
    value.value = 'b'
    await frames(2)
    expect(indicator.hidden).toBe(false)
    const appearing = scripted(indicator)!
    expect(appearing).toBeDefined()
    appearing.pause()
    appearing.currentTime = 0
    expect(Number(getComputedStyle(indicator).opacity)).toBeLessThan(0.05)
  })
})

describe('导航菜单指示条的出没', () => {
  it('收起面板时指示条原地淡出、播完才藏起', async () => {
    mountHost()
    const open = ref<string | null>('docs')
    app = createApp({
      render: () => h(XhNavigationMenuRoot, { value: open.value }, () => h(XhNavigationMenuList, null, () => [
        h(XhNavigationMenuItem, null, () => [
          h(XhNavigationMenuTrigger, { value: 'docs' }, () => '文档'),
          h(XhNavigationMenuContent, { value: 'docs' }, () => h(XhNavigationMenuLink, { href: '#a' }, () => '快速上手')),
        ]),
        h(XhNavigationMenuIndicator),
      ])),
    })
    app.mount(host!)
    await frames(3)
    const indicator = document.querySelector<HTMLElement>(`[data-scope='navigation-menu'][data-part='indicator']`)!
    expect(indicator.hidden).toBe(false)
    open.value = null
    await frames(1)
    const leaving = scripted(indicator)!
    expect(leaving).toBeDefined()
    expect(indicator.hidden).toBe(false)
    leaving.finish()
    await expect.poll(() => indicator.hidden).toBe(true)
  })
})

describe('漫游引导换步', () => {
  it('展开着换到下一步：气泡里的标题原地淡入', async () => {
    const targets = document.createElement('div')
    targets.innerHTML = `
      <button id="tour-fade-a" style="position: fixed; left: 40px; top: 60px; inline-size: 120px; block-size: 32px">一</button>
      <button id="tour-fade-b" style="position: fixed; left: 360px; top: 240px; inline-size: 80px; block-size: 48px">二</button>`
    document.body.append(targets)
    mountHost()
    const step = ref(0)
    app = createApp({
      render: () => h(XhTourRoot, {
        'open': true,
        'value': step.value,
        'onUpdate:value': (next: number) => (step.value = next),
        'steps': [
          { id: 'a', target: '#tour-fade-a', title: '第一站' },
          { id: 'b', target: '#tour-fade-b', title: '第二站' },
        ],
      }, () => h(XhTourPositioner, null, () => h(XhTourContent, null, () => h(XhTourTitle)))),
    })
    app.mount(host!)
    await frames(3)
    const title = document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='title']`)!
    for (const animation of document.getAnimations())
      animation.finish()
    expect(scripted(title)).toBeUndefined()
    step.value = 1
    await frames(1)
    expect(title.textContent).toContain('第二站')
    expect(scripted(title)).toBeDefined()
  })
})
