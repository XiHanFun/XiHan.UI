// ContextMenu 的 M2 表面、Collection Item 列与四向短位移动效依赖完整 CSS 级联，只在真实 Chromium 验证。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhContextMenuArrow,
  XhContextMenuContent,
  XhContextMenuGroup,
  XhContextMenuGroupLabel,
  XhContextMenuItem,
  XhContextMenuItemDescription,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 context-menu/${name}`)
  return element
}

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountContextMenu(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhContextMenuRoot, { open: true, placement: 'bottom-start' }, () => [
      h(XhContextMenuTrigger, null, () => '目标区域'),
      h(XhContextMenuPositioner, null, () => [
        h(XhContextMenuContent, { style: { inlineSize: '260px' } }, () => [
          h(XhContextMenuGroup, { value: 'actions' }, () => [
            h(XhContextMenuGroupLabel, null, () => h('span', { 'data-testid': 'label-ink' }, '常用操作')),
            h(XhContextMenuItem, { value: 'detail' }, () => [
              h(XhContextMenuItemIndicator, null, () => '✓'),
              h(
                XhContextMenuItemText,
                { 'data-testid': 'item-text' },
                () => '一段需要在固定正文列里截断的很长右键菜单命令文字',
              ),
              h(XhContextMenuItemDescription, { 'data-testid': 'description' }, () => '说明文字也从正文列开始'),
            ]),
            h(XhContextMenuItem, { 'value': 'raw', 'data-testid': 'raw-item' }, () => [
              h('span', { 'data-testid': 'raw-text' }, '没有 item-text 部件的普通内容'),
            ]),
            h(XhContextMenuItem, { 'value': 'submenu', 'data-testid': 'submenu' }, () => [
              h(XhContextMenuItemText, null, () => '还有下一级'),
            ]),
            h(XhContextMenuItem, { 'value': 'disabled', 'disabled': true, 'data-testid': 'disabled' }, () => '不可用'),
          ]),
          h(XhContextMenuSeparator),
          h(XhContextMenuArrow),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  const submenu = byTestId('submenu')
  submenu.setAttribute('aria-haspopup', 'menu')
  submenu.setAttribute('data-state', 'open')
}

function menuProbe(partName: 'content' | 'separator'): HTMLElement {
  const probe = document.createElement('div')
  probe.dataset.scope = 'menu'
  probe.dataset.part = partName
  probe.style.position = 'absolute'
  document.body.append(probe)
  return probe
}

function backdrop(style: CSSStyleDeclaration): string {
  return style.getPropertyValue('backdrop-filter') || style.getPropertyValue('-webkit-backdrop-filter')
}

function directions(positioner: HTMLElement): readonly string[] {
  const style = getComputedStyle(positioner)
  return ['up', 'down', 'left', 'right'].map(side => style.getPropertyValue(`--xh-_overlay-enter-${side}`).trim())
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  document.querySelectorAll('[data-test-menu-probe]').forEach(node => node.remove())
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('右键菜单 M2 表面', () => {
  it('content、arrow 与 separator 和 Menu 采用同一材质值', async () => {
    await mountContextMenu()
    const contextContent = getComputedStyle(part('content'))
    const menuContentNode = menuProbe('content')
    menuContentNode.dataset.testMenuProbe = ''
    const menuContent = getComputedStyle(menuContentNode)

    expect(contextContent.backgroundColor).toBe(menuContent.backgroundColor)
    expect(contextContent.borderTopColor).toBe(menuContent.borderTopColor)
    expect(contextContent.color).toBe(menuContent.color)
    expect(contextContent.boxShadow).toBe(menuContent.boxShadow)
    expect(backdrop(contextContent)).toBe(backdrop(menuContent))
    expect(backdrop(contextContent)).toContain('blur(16px)')

    const contextHighlight = getComputedStyle(part('content'), '::before').backgroundColor
    const menuHighlight = getComputedStyle(menuContentNode, '::before').backgroundColor
    expect(contextHighlight).toBe(menuHighlight)

    const arrow = getComputedStyle(part('arrow'))
    expect(arrow.backgroundColor).toBe(contextContent.backgroundColor)
    expect(arrow.borderTopColor).toBe(contextContent.borderTopColor)
    expect(backdrop(arrow)).toBe('none')

    const contextSeparator = getComputedStyle(part('separator'))
    const menuSeparatorNode = menuProbe('separator')
    menuSeparatorNode.dataset.testMenuProbe = ''
    const menuSeparator = getComputedStyle(menuSeparatorNode)
    expect(contextSeparator.backgroundColor).toBe(menuSeparator.backgroundColor)
    expect(contextSeparator.borderRadius).toBe(menuSeparator.borderRadius)
  })
})

describe('右键菜单条目列与反馈', () => {
  it('标记、正文、说明、裸内容与组标题对齐，长文字在正文列真实截断', async () => {
    await mountContextMenu()
    const text = byTestId('item-text')
    const x = text.getBoundingClientRect().left

    expect(byTestId('description').getBoundingClientRect().left).toBeCloseTo(x, 0)
    expect(byTestId('raw-text').getBoundingClientRect().left).toBeCloseTo(x, 0)
    expect(byTestId('label-ink').getBoundingClientRect().left).toBeCloseTo(x, 0)
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    expect(getComputedStyle(text).overflow).toBe('hidden')
  })

  it('hover、pressed 与打开路径分档，子菜单箭头占末列且 disabled 不显示 pointer', async () => {
    await mountContextMenu()
    const raw = byTestId('raw-item')
    const rest = getComputedStyle(raw).backgroundColor
    await userEvent.hover(raw)
    const hovered = getComputedStyle(raw).backgroundColor
    expect(hovered).not.toBe(rest)

    raw.style.transition = 'none'
    let pressed = ''
    raw.addEventListener('pointerdown', () => {
      pressed = getComputedStyle(raw).backgroundColor
    }, { once: true })
    await userEvent.click(raw)
    expect(pressed).not.toBe(hovered)

    const submenu = byTestId('submenu')
    const arrow = getComputedStyle(submenu, '::after')
    expect(arrow.gridColumnStart).toBe('-2')
    expect(arrow.gridColumnEnd).toBe('-1')
    expect(getComputedStyle(submenu).fontWeight).toBe(getComputedStyle(raw).fontWeight)
    expect(getComputedStyle(submenu).borderInlineStartColor).not.toBe('transparent')
    expect(getComputedStyle(byTestId('disabled')).cursor).toBe('not-allowed')
  })
})

describe('右键菜单四向短位移', () => {
  it('共享 slide 动画不含 scale，placement 每次只激活一个物理方向', async () => {
    await mountContextMenu()
    const positioner = part('positioner')
    const content = part('content')
    const cases = [
      { placement: 'top-start', expected: ['0', '1', '0', '0'] },
      { placement: 'bottom-end', expected: ['1', '0', '0', '0'] },
      { placement: 'left-start', expected: ['0', '0', '0', '1'] },
      { placement: 'right-end', expected: ['0', '0', '1', '0'] },
    ] as const

    for (const item of cases) {
      positioner.dataset.placement = item.placement
      expect(directions(positioner), item.placement).toEqual(item.expected)
    }

    content.dataset.state = 'open'
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-in')
    expect(getComputedStyle(content).willChange).toContain('translate')
    expect(getComputedStyle(content).scale).toBe('none')
    content.dataset.state = 'closed'
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')
    expect(getComputedStyle(content).scale).toBe('none')
  })

  it('嵌套 positioner 先清父层方向，再按自己的 placement 决定单轴位移', async () => {
    await mountContextMenu()
    const outer = part('positioner')
    outer.dataset.placement = 'bottom-start'
    const inner = document.createElement('div')
    inner.dataset.scope = 'context-menu'
    inner.dataset.part = 'positioner'
    inner.dataset.placement = 'right-start'
    outer.append(inner)

    expect(directions(outer)).toEqual(['1', '0', '0', '0'])
    expect(directions(inner)).toEqual(['0', '0', '1', '0'])
  })
})
