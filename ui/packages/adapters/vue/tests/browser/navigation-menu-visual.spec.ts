import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  // 指针挪回页面角落：下一个用例挂载时若指针仍停在某个入口的位置上，Chromium 会补发一次 mousemove，
  // 入口划过即切换展开项，用例还没开始面板就换了
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
})

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

async function mountNav(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhNavigationMenuRoot, { defaultValue: 'products' }, () => h(XhNavigationMenuList, null, () => [
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'products' }, () => '产品'),
        h(XhNavigationMenuContent, { value: 'products' }, () => [
          h(XhNavigationMenuLink, { href: '#overview' }, () => '总览'),
          h(XhNavigationMenuLink, { href: '#pricing', current: true }, () => '价格'),
        ]),
      ]),
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'docs' }, () => '文档'),
        h(XhNavigationMenuContent, { value: 'docs' }, () => h(XhNavigationMenuLink, { href: '#guide' }, () => '指南')),
      ]),
    ])),
  })
  app.mount(host)
  await nextTick()
  for (const el of host.querySelectorAll<HTMLElement>('[data-scope="navigation-menu"]:is([data-part="trigger"], [data-part="link"])'))
    el.style.transition = 'none'
}

function trigger(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="navigation-menu"][data-part="trigger"][data-value="${value}"]`)!
}

function link(href: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="navigation-menu"][data-part="link"][href="${href}"]`)!
}

describe('navigation-menu 入口与面板链接（真源 §7.2 / §7.3 / §9.2）', () => {
  it('展开着的入口是与悬停同档的中性面，不用品牌色；按下只换面到 200、不缩放', async () => {
    await mountNav()
    const open = trigger('products')
    expect(open.dataset.state).toBe('open')
    // 入口接 Collection Item 的 nav 语境：展开着的那一张投影 data-in-path，面由家族给；打开中不加粗、不用品牌字色
    expect(open.getAttribute('data-xh-collection-context')).toBe('nav')
    expect(open.hasAttribute('data-in-path')).toBe(true)
    expect(getComputedStyle(open).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(open).fontWeight).toBe('400')

    const closed = trigger('docs')
    expect(closed.hasAttribute('data-in-path')).toBe(false)
    expect(getComputedStyle(closed).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    // 静息 muted / regular
    expect(getComputedStyle(closed).color).toBe(resolve('--xh-fg-muted', 'color'))
    expect(getComputedStyle(closed).fontWeight).toBe('400')
    // 指针划到另一个入口：悬停面与展开面同为 100（划过即切换展开项，两种状态叠在同一条上仍是同一档），字色提到 default
    await userEvent.hover(closed)
    expect(getComputedStyle(closed).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(closed).color).toBe(resolve('--xh-fg-default', 'color'))

    const before = closed.getBoundingClientRect()
    // :active 只能由真实指针进入：按住不放
    await pressPointer(closed)
    expect(closed.matches(':active')).toBe(true)
    expect(getComputedStyle(closed).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(closed).scale).toBe('none')
    const during = closed.getBoundingClientRect()
    expect(during.width).toBe(before.width)
    expect(during.height).toBe(before.height)
    await releasePointer(closed)
  })

  it('面板链接接 Collection Item：悬停 100、按下 200；当前页取 strong 档品牌字色 + medium，不换底', async () => {
    await mountNav()
    const plain = link('#overview')
    const current = link('#pricing')
    expect(plain.getAttribute('data-xh-collection-context')).toBe('nav')
    expect(getComputedStyle(plain).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(plain).color).toBe(resolve('--xh-fg-default', 'color'))

    expect(current.hasAttribute('data-current')).toBe(true)
    expect(getComputedStyle(current).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(current).color).toBe(resolve('--xh-fg-brand-strong', 'color'))
    expect(getComputedStyle(current).fontWeight).toBe('500')
    // 当前页悬停仍是中性 100，字色不变
    await userEvent.hover(current)
    expect(getComputedStyle(current).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(current).color).toBe(resolve('--xh-fg-brand-strong', 'color'))

    await userEvent.hover(plain)
    expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    // 按住不放：松手即点击链接、面板收起，所以按下面在松手前采
    await pressPointer(plain)
    expect(plain.matches(':active')).toBe(true)
    expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    await releasePointer(plain)
  })
})
