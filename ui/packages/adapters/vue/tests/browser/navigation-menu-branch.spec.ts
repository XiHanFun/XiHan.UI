import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhNavigationMenuBranchContent,
  XhNavigationMenuBranchIndicator,
  XhNavigationMenuBranchTrigger,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from '../../src'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  // 指针挪回页面角落：下一个用例挂载时若指针仍停在某个入口上，Chromium 会补发 mousemove，入口划过即换张
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
})

/** 在宿主的主题下把令牌解析成最终值，断言不写死任何色值与尺寸。 */
function resolve(token: string, property: 'background-color' | 'color' | 'inline-size' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property === 'inline-size' ? 'width' : property)
  probe.remove()
  return value
}

interface MountOptions {
  defaultValue?: string
  current?: string
  dir?: 'rtl'
}

/** 产品面板：一条直达链接、两枝子级；文档面板：一条链接。 */
async function mountNav(options: MountOptions = {}): Promise<void> {
  host = document.createElement('div')
  if (options.dir)
    host.dir = options.dir
  document.body.append(host)
  const link = (href: string, text: string) => h(XhNavigationMenuLink, { href, current: href === options.current }, () => text)
  const branch = (value: string, text: string, links: ReturnType<typeof link>[]) => [
    h(XhNavigationMenuBranchTrigger, { value }, () => [text, h(XhNavigationMenuBranchIndicator, { value })]),
    h(XhNavigationMenuBranchContent, { value }, () => links),
  ]
  app = createApp({
    setup: () => () => h(XhNavigationMenuRoot, { defaultValue: options.defaultValue }, () => h(XhNavigationMenuList, null, () => [
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'products' }, () => '产品'),
        h(XhNavigationMenuContent, { value: 'products' }, () => [
          link('#overview', '产品概览'),
          ...branch('adapters', '框架适配器', [link('#vue', 'Vue'), link('#react', 'React')]),
          ...branch('tools', '开发工具', [link('#cli', '命令行')]),
        ]),
      ]),
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'docs' }, () => '文档'),
        h(XhNavigationMenuContent, { value: 'docs' }, () => link('#guide', '上手指南')),
      ]),
    ])),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string, value?: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="navigation-menu"][data-part="${name}"]${value ? `[data-value="${value}"]` : ''}`)!
}

function linkOf(href: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="navigation-menu"][data-part="link"][href="${href}"]`)!
}

function branchContent(value: string): HTMLElement {
  return document.getElementById(part('branch-trigger', value).getAttribute('aria-controls')!)!
}

function indicatorOf(value: string): HTMLElement {
  return part('branch-trigger', value).querySelector<HTMLElement>('[data-part="branch-indicator"]')!
}

/** 换面与转向的过渡压掉，断言读终值；动画是否播另由 getAnimations 看。 */
function freezeTransitions(): void {
  for (const el of host!.querySelectorAll<HTMLElement>('[data-scope="navigation-menu"]:is([data-part="branch-trigger"], [data-part="branch-indicator"], [data-part="link"])'))
    el.style.transition = 'none'
}

describe('navigation-menu 面板里的子级', () => {
  it('开关与面板里的链接同一种行：等高、行首对齐；子级按缩进表出层级', async () => {
    await mountNav({ defaultValue: 'products' })
    const overview = linkOf('#overview').getBoundingClientRect()
    const trigger = part('branch-trigger', 'adapters')
    const row = trigger.getBoundingClientRect()
    expect(row.height).toBe(overview.height)
    expect(row.left).toBe(overview.left)
    expect(row.width).toBe(overview.width)
    // 行首文字与链接文字同一条起始线：内衬读同一组槽
    expect(getComputedStyle(trigger).paddingInlineStart).toBe(getComputedStyle(linkOf('#overview')).paddingInlineStart)

    await userEvent.click(trigger)
    const vue = linkOf('#vue').getBoundingClientRect()
    expect(vue.height).toBe(overview.height)
    expect(`${vue.left - overview.left}px`).toBe(resolve('--xh-space-4', 'inline-size'))
  })

  it('点开关：子级当场露出、面板随之长高，不播高度动画；箭头 16px 盒在行尾，收着指向行尾、展开转向下方', async () => {
    await mountNav({ defaultValue: 'products' })
    freezeTransitions()
    const trigger = part('branch-trigger', 'adapters')
    const content = branchContent('adapters')
    const panel = part('content')
    const indicator = indicatorOf('adapters')
    expect(getComputedStyle(content).display).toBe('none')
    expect(getComputedStyle(indicator).rotate).toBe('0deg')
    const box = indicator.getBoundingClientRect()
    expect(`${box.width}px`).toBe(resolve('--xh-control-indicator-size', 'inline-size'))
    // 行尾：箭头的末缘贴着开关的行内衬
    const padEnd = Number.parseFloat(getComputedStyle(trigger).paddingInlineEnd)
    expect(Math.round(trigger.getBoundingClientRect().right - padEnd)).toBe(Math.round(box.right))

    const before = panel.getBoundingClientRect().height
    await userEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(getComputedStyle(content).display).toBe('flex')
    expect(panel.getBoundingClientRect().height).toBeGreaterThan(before)
    expect(content.getAnimations()).toHaveLength(0)
    expect(getComputedStyle(indicator).rotate).toBe('90deg')
    // 展开不是打开中：开关不换面
    await userEvent.hover(linkOf('#overview'))
    expect(getComputedStyle(trigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('开关悬停 100、按下 200 只换面不缩放，字色与面板链接同为 default', async () => {
    await mountNav({ defaultValue: 'products' })
    freezeTransitions()
    const trigger = part('branch-trigger', 'tools')
    expect(getComputedStyle(trigger).color).toBe(resolve('--xh-fg-default', 'color'))
    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    const before = trigger.getBoundingClientRect()
    await pressPointer(trigger)
    expect(trigger.matches(':active')).toBe(true)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(trigger).scale).toBe('none')
    expect(trigger.getBoundingClientRect().width).toBe(before.width)
    await releasePointerAway()
  })

  it('键盘：Enter 展开、Tab 走进子级；子级里 Escape 只收这一枝、焦点回开关，再按一次收起面板、焦点回入口', async () => {
    await mountNav({ defaultValue: 'products' })
    const trigger = part('branch-trigger', 'adapters')
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(trigger)
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(linkOf('#vue'))
    await userEvent.keyboard('{Escape}')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(getComputedStyle(branchContent('adapters')).display).toBe('none')
    expect(document.activeElement).toBe(trigger)
    expect(part('trigger', 'products').getAttribute('aria-expanded')).toBe('true')
    // 收着的子级整段跳出 Tab 序列：下一站是另一枝的开关
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(part('branch-trigger', 'tools'))
    await userEvent.keyboard('{Escape}')
    expect(part('trigger', 'products').getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(part('trigger', 'products'))
  })

  it('当前页在子级里：点开面板时那一枝已展开，当前页链接带品牌字色与起始缘的静态线', async () => {
    await mountNav({ current: '#react' })
    freezeTransitions()
    await userEvent.click(part('trigger', 'products'))
    expect(part('branch-trigger', 'adapters').getAttribute('aria-expanded')).toBe('true')
    expect(part('branch-trigger', 'tools').getAttribute('aria-expanded')).toBe('false')
    const current = linkOf('#react')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(getComputedStyle(current).color).toBe(resolve('--xh-fg-brand-strong', 'color'))
    const line = getComputedStyle(current, '::after')
    expect(line.backgroundColor).toBe(resolve('--xh-fg-brand'))
    expect(line.insetInlineStart).toBe('0px')
  })

  it('强制色：箭头取开关的系统前景（禁用取 GrayText），不随底色一起被换成 Canvas 而消失', async () => {
    await mountNav({ defaultValue: 'products' })
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    try {
      const system = (keyword: string): string => {
        const probe = document.createElement('span')
        probe.style.color = keyword
        probe.style.setProperty('forced-color-adjust', 'none')
        host!.append(probe)
        const value = getComputedStyle(probe).color
        probe.remove()
        return value
      }
      const glyph = (value: string): string => getComputedStyle(indicatorOf(value), '::before').backgroundColor
      expect(glyph('adapters')).toBe(system('ButtonText'))
      expect(glyph('adapters')).not.toBe(system('Canvas'))
      part('branch-trigger', 'tools').setAttribute('data-disabled', '')
      expect(glyph('tools')).toBe(system('GrayText'))
    }
    finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'none' }] })
    }
  })

  it('rtl：收着的箭头转半圈指向行尾（左侧），子级的缩进落在右侧', async () => {
    await mountNav({ defaultValue: 'products', dir: 'rtl' })
    freezeTransitions()
    expect(getComputedStyle(indicatorOf('adapters')).rotate).toBe('180deg')
    const trigger = part('branch-trigger', 'adapters')
    const box = indicatorOf('adapters').getBoundingClientRect()
    expect(box.left).toBeLessThan(trigger.getBoundingClientRect().left + trigger.getBoundingClientRect().width / 2)
    await userEvent.click(trigger)
    expect(getComputedStyle(indicatorOf('adapters')).rotate).toBe('90deg')
    const overview = linkOf('#overview').getBoundingClientRect()
    const vue = linkOf('#vue').getBoundingClientRect()
    expect(`${overview.right - vue.right}px`).toBe(resolve('--xh-space-4', 'inline-size'))
  })
})
