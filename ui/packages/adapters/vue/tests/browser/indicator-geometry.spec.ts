// 滑动指示器量的是排布位：祖先带缩放（对话框进场）、整页 RTL 而组件没传 dir 时，
// 指示器仍要与选中项严丝合缝。位置走 translate，只有真实布局量得出它落在哪。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhAnchorIndicator, XhAnchorItem, XhAnchorLink, XhAnchorList, XhAnchorRoot, XhNavigationMenuContent, XhNavigationMenuIndicator, XhNavigationMenuItem, XhNavigationMenuLink, XhNavigationMenuList, XhNavigationMenuRoot, XhNavigationMenuTrigger, XhRadioGroupItem, XhRadioGroupItemText, XhRadioGroupRoot, XhRadioGroupThumb, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.documentElement.removeAttribute('dir')
  document.body.innerHTML = ''
})

const ITEMS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '按周统计' },
  { value: 'month', label: '月' },
]

async function mountSegmented(options: { scale?: number, value?: string, block?: boolean, width?: string } = {}): Promise<{ value: ReturnType<typeof ref<string>> }> {
  const value = ref(options.value ?? 'week')
  const host = document.createElement('div')
  if (options.scale)
    host.style.transform = `scale(${options.scale})`
  if (options.width)
    host.style.inlineSize = options.width
  document.body.append(host)
  app = createApp({
    render: () => h(XhRadioGroupRoot, { 'variant': 'segmented', 'block': options.block, 'value': value.value, 'onUpdate:value': (next: string | null) => (value.value = next ?? '') }, () => [
      h(XhRadioGroupThumb),
      ...ITEMS.map(item => h(XhRadioGroupItem, { value: item.value }, () => [h(XhRadioGroupItemText, null, () => item.label)])),
    ]),
  })
  app.mount(host)
  await settle()
  return { value }
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  for (const el of document.querySelectorAll<HTMLElement>('[data-part="indicator"], [data-part="thumb"]')) {
    for (const animation of el.getAnimations())
      animation.finish()
  }
}

function part(name: string, value?: string): HTMLElement {
  const selector = value ? `[data-scope='radio-group'][data-part='${name}'][data-value='${value}']` : `[data-scope='radio-group'][data-part='${name}']`
  return document.querySelector<HTMLElement>(selector)!
}

/** 滑块的屏幕矩形与选中段重合（祖先缩放同样作用于两者）。 */
function expectCovers(value: string): void {
  const thumb = part('thumb').getBoundingClientRect()
  const item = part('item', value).getBoundingClientRect()
  expect(thumb.left).toBeCloseTo(item.left, 0)
  expect(thumb.top).toBeCloseTo(item.top, 0)
  expect(thumb.width).toBeCloseTo(item.width, 0)
  expect(thumb.height).toBeCloseTo(item.height, 0)
}

describe('radio-group segmented 形态的滑块几何', () => {
  it('祖先带 scale(0.5) 时量排布位，滑块与选中段重合而不是再缩一半', async () => {
    await mountSegmented({ scale: 0.5 })
    expectCovers('week')
  })

  it('整页 RTL 而组件没传 dir：滑块照样落在选中段上', async () => {
    document.documentElement.dir = 'rtl'
    await mountSegmented()
    expectCovers('week')
  })

  it('换段只动 translate 与尺寸，不动 inset；滑过去之后与新选中段重合', async () => {
    const { value } = await mountSegmented()
    value.value = 'month'
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    const thumb = part('thumb')
    expect(thumb.hasAttribute('data-instant')).toBe(false)
    const style = getComputedStyle(thumb)
    expect(style.transitionProperty.split(', ')).toEqual(['translate', 'inline-size', 'block-size', 'background-color'])
    await settle()
    expectCovers('month')
  })

  it('block：整组撑满容器行宽，各段等分，滑块跟着等分后的段宽', async () => {
    await mountSegmented({ block: true, width: '480px' })
    const root = part('root')
    const inner = root.clientWidth - Number.parseFloat(getComputedStyle(root).paddingInlineStart) - Number.parseFloat(getComputedStyle(root).paddingInlineEnd)
    expect(root.getBoundingClientRect().width).toBeCloseTo(480, 0)
    const widths = [...document.querySelectorAll<HTMLElement>(`[data-scope='radio-group'][data-part='item']`)].map(el => el.getBoundingClientRect().width)
    for (const width of widths)
      expect(width).toBeCloseTo(inner / ITEMS.length, 0)
    expectCovers('week')
  })

  it('不写 block：轨道按内容收宽，各段按文字长短各自定宽', async () => {
    await mountSegmented({ width: '480px' })
    expect(part('root').getBoundingClientRect().width).toBeLessThan(480)
    const [day, week] = [...document.querySelectorAll<HTMLElement>(`[data-scope='radio-group'][data-part='item']`)].map(el => el.getBoundingClientRect().width)
    expect(week!).toBeGreaterThan(day!)
  })
})

describe('tabs 的指示条几何', () => {
  const TABS = [
    { value: 'overview', label: '概览' },
    { value: 'members', label: '成员与权限' },
    { value: 'billing', label: '账单' },
  ]

  async function mountTabs(options: { scale?: number, variant?: 'line' | 'segment', orientation?: 'horizontal' | 'vertical' } = {}): Promise<void> {
    const host = document.createElement('div')
    host.style.inlineSize = '480px'
    if (options.scale)
      host.style.transform = `scale(${options.scale})`
    document.body.append(host)
    app = createApp({
      render: () => h(XhTabsRoot, { defaultValue: 'members', variant: options.variant, orientation: options.orientation }, () => [
        h(XhTabsList, null, () => [
          h(XhTabsIndicator),
          ...TABS.map(tab => h(XhTabsTrigger, { value: tab.value }, () => tab.label)),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))
    for (const animation of document.querySelector<HTMLElement>('[data-scope="tabs"][data-part="indicator"]')!.getAnimations())
      animation.finish()
  }

  function tabPart(name: string, value?: string): DOMRect {
    const selector = value ? `[data-scope='tabs'][data-part='${name}'][data-value='${value}']` : `[data-scope='tabs'][data-part='${name}']`
    return document.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
  }

  it('横排 line：祖先带 scale(0.5) 时指示条的主轴与选中标签对齐', async () => {
    await mountTabs({ scale: 0.5 })
    const indicator = tabPart('indicator')
    const trigger = tabPart('trigger', 'members')
    expect(indicator.left).toBeCloseTo(trigger.left, 0)
    expect(indicator.width).toBeCloseTo(trigger.width, 0)
  })

  it('segment 档：整页 RTL 而没传 dir，滑块与选中标签重合', async () => {
    document.documentElement.dir = 'rtl'
    await mountTabs({ variant: 'segment' })
    const indicator = tabPart('indicator')
    const trigger = tabPart('trigger', 'members')
    expect(indicator.left).toBeCloseTo(trigger.left, 0)
    expect(indicator.top).toBeCloseTo(trigger.top, 0)
    expect(indicator.width).toBeCloseTo(trigger.width, 0)
    expect(indicator.height).toBeCloseTo(trigger.height, 0)
  })

  it('竖排 line：指示条沿块轴落在选中标签旁，RTL 下也不横向错开', async () => {
    document.documentElement.dir = 'rtl'
    await mountTabs({ orientation: 'vertical' })
    const indicator = tabPart('indicator')
    const trigger = tabPart('trigger', 'members')
    const list = tabPart('list')
    expect(indicator.top).toBeCloseTo(trigger.top, 0)
    expect(indicator.height).toBeCloseTo(trigger.height, 0)
    // 贴在行向末端那条轨道上：RTL 下行尾在左边
    expect(indicator.left).toBeCloseTo(list.left + Number.parseFloat(getComputedStyle(document.querySelector('[data-part="list"]')!).borderLeftWidth), 0)
  })
})

describe('anchor 的指示条几何', () => {
  async function mountAnchor(options: { scale?: number, orientation?: 'horizontal' | 'vertical' } = {}): Promise<void> {
    const host = document.createElement('div')
    if (options.scale)
      host.style.transform = `scale(${options.scale})`
    document.body.append(host)
    app = createApp({
      render: () => h(XhAnchorRoot, { defaultValue: 'b', orientation: options.orientation, smooth: false, style: { inlineSize: '360px' } }, () => [
        h(XhAnchorList, null, () => [
          h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'a' }, () => '概览')),
          h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'b' }, () => '安装与配置')),
          h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'c' }, () => '用法')),
          h(XhAnchorIndicator),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))
    for (const animation of document.querySelector<HTMLElement>('[data-scope="anchor"][data-part="indicator"]')!.getAnimations())
      animation.finish()
  }

  function anchorPart(name: string, value?: string): DOMRect {
    const selector = value ? `[data-scope='anchor'][data-part='${name}'][data-value='${value}']` : `[data-scope='anchor'][data-part='${name}']`
    return document.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
  }

  it('竖排：祖先带 scale(0.5) 时指示条沿块轴与当前链接对齐', async () => {
    await mountAnchor({ scale: 0.5 })
    const indicator = anchorPart('indicator')
    const link = anchorPart('link', 'b')
    expect(indicator.top).toBeCloseTo(link.top, 0)
    expect(indicator.height).toBeCloseTo(link.height, 0)
  })

  it('横排：整页 RTL 而没传 dir，指示条沿行轴与当前链接对齐', async () => {
    document.documentElement.dir = 'rtl'
    await mountAnchor({ orientation: 'horizontal' })
    const indicator = anchorPart('indicator')
    const link = anchorPart('link', 'b')
    expect(indicator.left).toBeCloseTo(link.left, 0)
    expect(indicator.width).toBeCloseTo(link.width, 0)
  })
})

describe('navigation-menu 的指示条几何', () => {
  const ENTRIES = [
    { value: 'products', label: '产品' },
    { value: 'solutions', label: '解决方案与案例' },
    { value: 'docs', label: '文档' },
  ]

  async function mountMenu(options: { scale?: number } = {}): Promise<void> {
    const host = document.createElement('div')
    if (options.scale)
      host.style.transform = `scale(${options.scale})`
    document.body.append(host)
    app = createApp({
      render: () => h(XhNavigationMenuRoot, { value: 'solutions' }, () => [
        h(XhNavigationMenuList, null, () => [
          ...ENTRIES.map(entry => h(XhNavigationMenuItem, null, () => [
            h(XhNavigationMenuTrigger, { value: entry.value }, () => entry.label),
            h(XhNavigationMenuContent, { value: entry.value }, () => h(XhNavigationMenuLink, { href: `#${entry.value}` }, () => entry.label)),
          ])),
          h(XhNavigationMenuIndicator),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))
    for (const animation of document.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="indicator"]')!.getAnimations())
      animation.finish()
  }

  function menuPart(name: string, value?: string): DOMRect {
    const selector = value ? `[data-scope='navigation-menu'][data-part='${name}'][data-value='${value}']` : `[data-scope='navigation-menu'][data-part='${name}']`
    return document.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
  }

  it('祖先带 scale(0.5) 时指示条与展开的入口对齐', async () => {
    await mountMenu({ scale: 0.5 })
    const indicator = menuPart('indicator')
    const trigger = menuPart('trigger', 'solutions')
    expect(indicator.left).toBeCloseTo(trigger.left, 0)
    expect(indicator.width).toBeCloseTo(trigger.width, 0)
  })

  it('整页 RTL 而没传 dir：指示条照样落在展开的入口下', async () => {
    document.documentElement.dir = 'rtl'
    await mountMenu()
    const indicator = menuPart('indicator')
    const trigger = menuPart('trigger', 'solutions')
    expect(indicator.left).toBeCloseTo(trigger.left, 0)
    expect(indicator.width).toBeCloseTo(trigger.width, 0)
  })
})
