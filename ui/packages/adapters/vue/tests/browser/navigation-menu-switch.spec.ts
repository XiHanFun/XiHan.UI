// 导航菜单在入口之间换张：与菜单栏同一条成规——首开有进场、末收有退场、换张瞬时。
// 用共享外壳时面板回到静态流里，换张若还播进退场，新旧两张会在外壳里上下叠放、外壳先变高再塌回；
// 外壳自己承担进退场。叠放与在播的动画只有真实浏览器量得出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ENTRIES = [
  { value: 'products', label: '产品', links: ['云服务器', '对象存储'] },
  { value: 'docs', label: '文档', links: ['快速上手', '接口参考', '更新日志', '常见问题'] },
]

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function mount(options: { viewport: boolean, initial: string | null }): Ref<string | null> {
  const value = ref<string | null>(options.initial)
  const host = document.createElement('div')
  document.body.append(host)
  const content = (entry: typeof ENTRIES[number]) => h(XhNavigationMenuContent, { value: entry.value }, () =>
    entry.links.map(link => h(XhNavigationMenuLink, { href: `#${link}` }, () => link)))
  app = createApp({
    render: () => h(XhNavigationMenuRoot, { value: value.value }, () => [
      h(XhNavigationMenuList, null, () => ENTRIES.map(entry => h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: entry.value }, () => entry.label),
        options.viewport ? null : content(entry),
      ]))),
      options.viewport ? h(XhNavigationMenuViewport, null, () => ENTRIES.map(content)) : null,
    ]),
  })
  app.mount(host)
  return value
}

function contents(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="navigation-menu"][data-part="content"]')]
}

/** 面板属于哪一项：按它里面的首条链接认。 */
function entryOf(el: HTMLElement): string | undefined {
  return ENTRIES.find(entry => el.textContent?.includes(entry.links[0]!))?.value
}

function shown(): HTMLElement[] {
  return contents().filter(el => getComputedStyle(el).display !== 'none')
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

function viewport(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="viewport"]')!
}

describe.each([true, false])('navigation-menu 换张（共享外壳 %s）', (withViewport) => {
  it('新旧两张不叠放：换张那一帧起只剩新的一张，两侧都不播进退场', async () => {
    const value = mount({ viewport: withViewport, initial: 'products' })
    await frames(2)
    value.value = 'docs'
    await frames(1)
    expect(shown().map(entryOf)).toEqual(['docs'])
    for (const el of contents())
      expect(running(el), entryOf(el)).toEqual([])
  })
})

describe('navigation-menu 共享外壳的进退场', () => {
  it('首开：外壳弹出、面板随外壳淡入；外壳高度就是这一张的高度', async () => {
    const value = mount({ viewport: true, initial: null })
    await frames(2)
    value.value = 'docs'
    await frames(1)
    expect(running(viewport())).toEqual(['xh-pop-in'])
    const docs = contents().find(el => entryOf(el) === 'docs')!
    expect(running(docs)).toEqual(['xh-fade-in'])
  })

  it('换张后外壳高度即刻跟上新的一张，不先变高再塌回', async () => {
    const value = mount({ viewport: true, initial: 'docs' })
    await frames(2)
    const before = viewport().offsetHeight
    value.value = 'products'
    await frames(1)
    const products = contents().find(el => entryOf(el) === 'products')!
    const style = getComputedStyle(viewport())
    const chrome = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
      + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
    expect(viewport().offsetHeight).toBeLessThan(before)
    expect(viewport().offsetHeight).toBeCloseTo(products.offsetHeight + chrome, 0)
  })

  it('末收：外壳播退场，面板在外壳里随之淡出，播完外壳才藏起', async () => {
    const value = mount({ viewport: true, initial: null })
    await frames(2)
    value.value = 'docs'
    await frames(1)
    for (const el of [viewport(), ...contents()]) {
      for (const animation of el.getAnimations())
        animation.finish()
    }
    await frames(1)
    value.value = null
    await frames(1)
    expect(running(viewport())).toEqual(['xh-pop-out'])
    expect(getComputedStyle(viewport()).display).not.toBe('none')
    await Promise.all([viewport(), ...contents()].flatMap(el => el.getAnimations()).map(a => a.finished.catch(() => undefined)))
    await frames(2)
    expect(viewport().hidden).toBe(true)
  })
})
