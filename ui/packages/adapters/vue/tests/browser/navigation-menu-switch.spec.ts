// 导航菜单在入口之间换张：首开有进场、末收有退场；换张时旧的一张当场撤下、新的一张原地淡入，
// 新旧两张不在外壳里上下叠放；共享外壳留在原处，尺寸从旧的一张补到新的一张，不一下子跳过去。
// 叠放、在播的动画与补间途中的尺寸只有真实浏览器量得出来。
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
  it('新旧两张不叠放：换张那一帧起只剩新的一张，旧的一张不播退场、新的一张原地淡入', async () => {
    const value = mount({ viewport: withViewport, initial: 'products' })
    await frames(2)
    value.value = 'docs'
    await frames(1)
    expect(shown().map(entryOf)).toEqual(['docs'])
    for (const el of contents())
      expect(running(el), entryOf(el)).toEqual(entryOf(el) === 'docs' ? ['xh-fade-in'] : [])
  })
})

describe('navigation-menu 共享外壳的进退场', () => {
  it('首开：外壳弹出、面板随外壳淡入；外壳高度就是这一张的高度', async () => {
    const value = mount({ viewport: true, initial: null })
    await frames(2)
    value.value = 'docs'
    await frames(1)
    expect(running(viewport())).toEqual(['xh-overlay-pop-in'])
    const docs = contents().find(el => entryOf(el) === 'docs')!
    expect(running(docs)).toEqual(['xh-fade-in'])
  })

  it('换张后外壳从旧的一张的高度补到新的一张，一路单调、不先变高再塌回', async () => {
    const value = mount({ viewport: true, initial: 'docs' })
    await frames(2)
    const before = viewport().getBoundingClientRect().height
    value.value = 'products'
    await frames(1)
    const tween = viewport().getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))!
    expect(tween).toBeDefined()
    tween.pause()
    const duration = Number(tween.effect!.getComputedTiming().duration)
    tween.currentTime = 0
    expect(viewport().getBoundingClientRect().height).toBeCloseTo(before, 0)
    tween.currentTime = duration / 2
    const mid = viewport().getBoundingClientRect().height
    expect(mid).toBeLessThan(before)
    tween.finish()
    const products = contents().find(el => entryOf(el) === 'products')!
    const style = getComputedStyle(viewport())
    const chrome = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
      + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
    expect(mid).toBeGreaterThan(viewport().offsetHeight)
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
