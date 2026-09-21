// 导航菜单里指向当前页面的链接自画一条静态指示线。
//
// 设计真源 §7.3 把 Tabs line / Anchor / NavigationMenu 归为同一类「透明面 + 2px 指示条」。导航菜单的
// indicator 部件表达的是「哪张面板开着」而不是当前页（数据里写 current 的是 link），所以当前链接的
// 静态线不随部件收起：横排里的直达链接贴底边，竖排的直达链接与面板里的链接贴行向起始缘（rtl 镜像），
// 主轴两端各退一格 --xh-space-1 避开链接的圆角；厚度 / 颜色 / 圆角与 indicator 部件读同一组槽与缺省。
// 伪元素的几何与颜色只有真实 Chromium 算得出，jsdom 不算数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Orientation = 'horizontal' | 'vertical'
type Dir = 'ltr' | 'rtl'

let app: App | null = null
let host: HTMLElement | null = null

interface Mounted {
  list: HTMLElement
  current: HTMLElement
  rest: HTMLElement
  panelLink: HTMLElement
  trigger: HTMLElement
  indicator: HTMLElement | null
}

/** 一条直达链接（当前页）、一条普通直达链接、一个带面板的入口（面板里一条当前链接）。 */
async function mount(orientation: Orientation, dir: Dir, withIndicator: boolean): Promise<Mounted> {
  host = document.createElement('div')
  host.setAttribute('dir', dir)
  document.body.append(host)
  app = createApp({
    render: () => h(XhNavigationMenuRoot, { orientation, dir, style: { inlineSize: '360px' } }, () => h(XhNavigationMenuList, null, () => [
      h(XhNavigationMenuItem, null, () => h(XhNavigationMenuLink, { 'href': '#home', 'current': true, 'data-testid': 'home' }, () => '首页')),
      h(XhNavigationMenuItem, null, () => h(XhNavigationMenuLink, { 'href': '#blog', 'data-testid': 'blog' }, () => '博客')),
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { 'value': 'docs', 'data-testid': 'docs' }, () => '文档'),
        h(XhNavigationMenuContent, { value: 'docs' }, () => [
          h(XhNavigationMenuLink, { 'href': '#guide', 'current': true, 'data-testid': 'guide' }, () => '指南'),
          h(XhNavigationMenuLink, { href: '#api' }, () => '接口'),
        ]),
      ]),
      withIndicator ? h(XhNavigationMenuIndicator) : null,
    ])),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  const current = host.querySelector<HTMLElement>('[data-testid="home"][data-part="link"]')!
  expect(current.getAttribute('data-current'), '写了 current 的直达链接投影 data-current').toBe('')
  return {
    list: host.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="list"]')!,
    current,
    rest: host.querySelector<HTMLElement>('[data-testid="blog"][data-part="link"]')!,
    panelLink: host.querySelector<HTMLElement>('[data-testid="guide"][data-part="link"]')!,
    trigger: host.querySelector<HTMLElement>('[data-testid="docs"][data-part="trigger"]')!,
    indicator: host.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="indicator"]'),
  }
}

/** 令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 令牌在该元素上解到的长度（px）。 */
function resolveLength(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.blockSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).height)
  probe.remove()
  return value
}

function after(element: HTMLElement): CSSStyleDeclaration {
  return getComputedStyle(element, '::after')
}

/** 线贴在行向起始缘：ltr 在左、rtl 在右，两端各退一格。 */
function expectStartEdge(link: HTMLElement, dir: Dir, scope: HTMLElement): void {
  const line = after(link)
  const thickness = resolveLength('--xh-stroke-thick', scope)
  const clearance = resolveLength('--xh-space-1', scope)
  expect(Number.parseFloat(line.width)).toBe(thickness)
  expect(Number.parseFloat(line.top)).toBe(clearance)
  expect(Number.parseFloat(line.bottom)).toBe(clearance)
  expect(dir === 'ltr' ? line.left : line.right).toBe('0px')
  const farSide = Number.parseFloat(dir === 'ltr' ? line.right : line.left)
  expect(farSide).toBeCloseTo(link.clientWidth - thickness, 0)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe.each<[Orientation, Dir]>([
  ['horizontal', 'ltr'],
  ['horizontal', 'rtl'],
  ['vertical', 'ltr'],
  ['vertical', 'rtl'],
])('%s / %s', (orientation, dir) => {
  it('当前直达链接自画静态线，贴缘、厚度颜色圆角同 indicator 的缺省；其余链接不画', async () => {
    const { list, current, rest } = await mount(orientation, dir, false)
    const line = after(current)
    expect(line.content, '当前链接的 ::after 是静态指示线').toBe('""')
    expect(line.position).toBe('absolute')
    expect(getComputedStyle(current).position, '线以链接盒为定位参照').toBe('relative')
    expect(line.backgroundColor).toBe(resolveColor('--xh-fg-brand', list))
    expect(Number.parseFloat(line.borderTopLeftRadius)).toBe(resolveLength('--xh-shape-pill', list))
    expect(line.pointerEvents).toBe('none')

    if (orientation === 'horizontal') {
      // 贴底，两端各退一格避开圆角
      const thickness = resolveLength('--xh-stroke-thick', list)
      const clearance = resolveLength('--xh-space-1', list)
      expect(Number.parseFloat(line.height)).toBe(thickness)
      expect(line.bottom).toBe('0px')
      expect(Number.parseFloat(line.left)).toBe(clearance)
      expect(Number.parseFloat(line.right)).toBe(clearance)
    }
    else {
      expectStartEdge(current, dir, list)
    }

    expect(after(rest).content, '非当前链接不画线').toBe('none')
  })

  it('面板里的当前链接贴行向起始缘画线', async () => {
    const { list, panelLink, trigger } = await mount(orientation, dir, false)
    trigger.click()
    await nextTick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(after(panelLink).content).toBe('""')
    expectStartEdge(panelLink, dir, list)
  })

  it('放了 indicator 部件：部件指的是开着的面板，当前链接的静态线不收起', async () => {
    const { current, trigger, indicator } = await mount(orientation, dir, true)
    expect(indicator).not.toBeNull()
    expect(indicator!.hidden, '没有面板开着时部件不显示').toBe(true)
    expect(after(current).content, '部件在场也照画').toBe('""')
    trigger.click()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    expect(indicator!.hidden, '面板开着时部件滑到入口下').toBe(false)
    expect(after(current).content, '部件亮着也照画').toBe('""')
  })

  it('静态线与 indicator 部件读同一组缺省：厚度、颜色、圆角逐项相等', async () => {
    const { current, trigger, indicator } = await mount(orientation, dir, true)
    trigger.click()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    const line = after(current)
    const part = getComputedStyle(indicator!)
    expect({
      thickness: orientation === 'horizontal' ? line.height : line.width,
      color: line.backgroundColor,
      radius: line.borderTopLeftRadius,
    }).toEqual({
      thickness: orientation === 'horizontal' ? part.height : part.width,
      color: part.backgroundColor,
      radius: part.borderTopLeftRadius,
    })
  })
})
