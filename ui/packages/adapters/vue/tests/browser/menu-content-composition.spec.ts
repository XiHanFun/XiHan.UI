import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const icon = {
  name: 'document',
  viewBox: '0 0 24 24',
  attrs: {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  nodes: [
    { tag: 'path', attrs: { d: 'M6 3H14L19 8V21H6Z' } },
    { tag: 'path', attrs: { d: 'M14 3V8H19' } },
  ],
} as const

const longText = '一段使用正式item-text并在固定菜单宽度内截断的超长命令文字ABCDEFGHIJKLMN'
const menuHintStyle = { marginInlineStart: 'auto', color: 'var(--xh-fg-muted)' }
const contextHintStyle = { color: 'var(--xh-fg-muted)' }

function menuTree(dir: 'ltr' | 'rtl') {
  return h(XhMenuRoot, { dir, open: true }, () => [
    h(XhMenuTrigger, null, () => '编辑'),
    h(XhMenuPositioner, null, () => [
      h(XhMenuContent, { style: { inlineSize: '280px' } }, () => [
        h(XhMenuItem, { 'value': 'copy', 'data-testid': 'menu-item' }, () => [
          h(XhIcon, { 'icon': icon, 'size': 'sm', 'data-testid': 'menu-icon' }),
          h('span', { 'data-testid': 'menu-text' }, '复制'),
          h('span', { 'data-testid': 'menu-shortcut', 'style': menuHintStyle }, 'Ctrl+C'),
        ]),
        h(XhMenuItem, { 'value': 'long', 'data-testid': 'menu-long-item' }, () => [
          h(XhIcon, { icon, size: 'sm' }),
          h(XhMenuItemText, { 'data-testid': 'menu-long-text' }, () => longText),
          h('span', { 'data-testid': 'menu-long-shortcut', 'style': menuHintStyle }, 'Ctrl+L'),
        ]),
        h(XhMenuSeparator),
      ]),
    ]),
  ])
}

function contextMenuTree(dir: 'ltr' | 'rtl') {
  return h(XhContextMenuRoot, { dir, open: true }, () => [
    h(XhContextMenuTrigger, { style: { minBlockSize: '80px' } }, () => '右键区域'),
    h(XhContextMenuPositioner, null, () => [
      h(XhContextMenuContent, { style: { inlineSize: '280px' } }, () => [
        h(XhContextMenuItem, { 'value': 'cut', 'data-testid': 'context-item' }, () => [
          h(XhIcon, { 'icon': icon, 'size': 'sm', 'data-testid': 'context-icon' }),
          h(XhContextMenuItemText, { 'data-testid': 'context-text' }, () => '剪切'),
          h('span', { 'data-testid': 'context-shortcut', 'style': contextHintStyle }, 'Ctrl+X'),
        ]),
        h(XhContextMenuItem, { 'value': 'long', 'data-testid': 'context-long-item' }, () => [
          h(XhIcon, { icon, size: 'sm' }),
          h(XhContextMenuItemText, { 'data-testid': 'context-long-text' }, () => longText),
          h('span', { 'data-testid': 'context-long-shortcut', 'style': contextHintStyle }, 'Ctrl+L'),
        ]),
        h(XhContextMenuSeparator),
      ]),
    ]),
  ])
}

function menubarTree(dir: 'ltr' | 'rtl') {
  return h(XhMenubarRoot, { dir, defaultValue: 'file' }, () => [
    h(XhMenubarTrigger, { value: 'file' }, () => [
      h(XhIcon, { icon, size: 'sm' }),
      '文件',
    ]),
    h(XhMenubarPositioner, { value: 'file' }, () => [
      h(XhMenubarContent, { style: { inlineSize: '280px' } }, () => [
        h(XhMenubarItem, { 'value': 'new', 'data-testid': 'menubar-item' }, () => [
          h(XhIcon, { 'icon': icon, 'size': 'sm', 'data-testid': 'menubar-icon' }),
          h(XhMenubarItemText, { 'data-testid': 'menubar-text' }, () => '新建'),
        ]),
        h(XhMenubarItem, { 'value': 'long', 'data-testid': 'menubar-long-item' }, () => [
          h(XhIcon, { icon, size: 'sm' }),
          h(XhMenubarItemText, { 'data-testid': 'menubar-long-text' }, () => longText),
        ]),
        h(XhMenubarSeparator),
      ]),
    ]),
  ])
}

type Family = 'menu' | 'context' | 'menubar'

const itemIds: Record<Family, string> = {
  menu: 'menu-item',
  context: 'context-item',
  menubar: 'menubar-item',
}

async function mountFamily(family: Family, dir: 'ltr' | 'rtl'): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  const tree = family === 'menu'
    ? menuTree(dir)
    : family === 'context'
      ? contextMenuTree(dir)
      : menubarTree(dir)
  app = createApp({
    render: () => h('div', { dir }, [tree]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  const item = byTestId(itemIds[family])
  item.style.transition = 'none'
  item.dataset.state = 'open'
}

function unmountFamily(): void {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
}

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

function tokenColor(name: '--xh-bg-subtle' | '--xh-bg-brand-subtle'): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  return color
}

function assertDirectSequence(itemId: string, childIds: string[]): void {
  const item = byTestId(itemId)
  for (const id of childIds)
    expect(byTestId(id).parentElement).toBe(item)
  const positions = childIds.map(id => [...item.children].indexOf(byTestId(id)))
  expect(positions).toEqual([...positions].sort((a, b) => a - b))
}

function assertTextIsContained(itemId: string, textId: string, shortcutId?: string): void {
  const item = byTestId(itemId)
  const text = byTestId(textId)
  const itemRect = item.getBoundingClientRect()
  const textRect = text.getBoundingClientRect()
  const textStyle = getComputedStyle(text)

  expect(textStyle.whiteSpace).toBe('nowrap')
  expect(textStyle.overflow).toBe('hidden')
  expect(textStyle.textOverflow).toBe('ellipsis')
  expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
  expect(textRect.left).toBeGreaterThanOrEqual(itemRect.left)
  expect(textRect.right).toBeLessThanOrEqual(itemRect.right)
  expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
  if (shortcutId) {
    const shortcutRect = byTestId(shortcutId).getBoundingClientRect()
    expect(shortcutRect.left).toBeGreaterThanOrEqual(itemRect.left)
    expect(shortcutRect.right).toBeLessThanOrEqual(itemRect.right)
    expect(textRect.right <= shortcutRect.left || shortcutRect.right <= textRect.left).toBe(true)
  }
}

function assertDemoRow(itemId: string, iconId: string, textId: string, shortcutId?: string): void {
  const item = byTestId(itemId)
  const iconRect = byTestId(iconId).getBoundingClientRect()
  const textRect = byTestId(textId).getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  expect(Math.abs((iconRect.top + iconRect.bottom) / 2 - (textRect.top + textRect.bottom) / 2)).toBeLessThanOrEqual(1)
  expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
  expect(textRect.left).toBeGreaterThanOrEqual(itemRect.left)
  expect(textRect.right).toBeLessThanOrEqual(itemRect.right)
  if (shortcutId) {
    const shortcutRect = byTestId(shortcutId).getBoundingClientRect()
    expect(Math.abs((shortcutRect.top + shortcutRect.bottom) / 2 - (textRect.top + textRect.bottom) / 2)).toBeLessThanOrEqual(1)
    expect(shortcutRect.left).toBeGreaterThanOrEqual(itemRect.left)
    expect(shortcutRect.right).toBeLessThanOrEqual(itemRect.right)
    expect(textRect.right <= shortcutRect.left || shortcutRect.right <= textRect.left).toBe(true)
  }
}

function assertNoPathBarAndNeutralOpen(itemId: string): void {
  const neutral = tokenColor('--xh-bg-subtle')
  const branded = tokenColor('--xh-bg-brand-subtle')
  const style = getComputedStyle(byTestId(itemId))
  expect(style.borderInlineStartWidth, itemId).toBe('0px')
  expect(style.backgroundColor, itemId).toBe(neutral)
  expect(style.backgroundColor, itemId).not.toBe(branded)
}

afterEach(() => {
  unmountFamily()
})

describe('菜单作者内容组合', () => {
  it('保持三个 icon demo 的直属作者插槽顺序，长文本不挤掉快捷键', async () => {
    await mountFamily('menu', 'ltr')
    assertDirectSequence('menu-item', ['menu-icon', 'menu-text', 'menu-shortcut'])
    assertDemoRow('menu-item', 'menu-icon', 'menu-text', 'menu-shortcut')
    assertTextIsContained('menu-long-item', 'menu-long-text', 'menu-long-shortcut')
    assertNoPathBarAndNeutralOpen('menu-item')
    unmountFamily()

    await mountFamily('context', 'ltr')
    assertDirectSequence('context-item', ['context-icon', 'context-text', 'context-shortcut'])
    assertDemoRow('context-item', 'context-icon', 'context-text', 'context-shortcut')
    assertTextIsContained('context-long-item', 'context-long-text', 'context-long-shortcut')
    assertNoPathBarAndNeutralOpen('context-item')
    unmountFamily()

    await mountFamily('menubar', 'ltr')
    assertDirectSequence('menubar-item', ['menubar-icon', 'menubar-text'])
    assertDemoRow('menubar-item', 'menubar-icon', 'menubar-text')
    assertTextIsContained('menubar-long-item', 'menubar-long-text')
    assertNoPathBarAndNeutralOpen('menubar-item')
  })

  it('rtl 保持同一 DOM 顺序与逻辑端布局，不恢复始端路径条或品牌蓝底', async () => {
    await mountFamily('menu', 'rtl')
    assertDirectSequence('menu-item', ['menu-icon', 'menu-text', 'menu-shortcut'])
    assertDemoRow('menu-item', 'menu-icon', 'menu-text', 'menu-shortcut')
    assertTextIsContained('menu-long-item', 'menu-long-text', 'menu-long-shortcut')
    expect(byTestId('menu-icon').getBoundingClientRect().right).toBeGreaterThan(byTestId('menu-text').getBoundingClientRect().right)
    expect(byTestId('menu-shortcut').getBoundingClientRect().left).toBeLessThan(byTestId('menu-text').getBoundingClientRect().left)
    assertNoPathBarAndNeutralOpen('menu-item')
    unmountFamily()

    await mountFamily('context', 'rtl')
    assertDirectSequence('context-item', ['context-icon', 'context-text', 'context-shortcut'])
    assertDemoRow('context-item', 'context-icon', 'context-text', 'context-shortcut')
    assertTextIsContained('context-long-item', 'context-long-text', 'context-long-shortcut')
    expect(byTestId('context-icon').getBoundingClientRect().right).toBeGreaterThan(byTestId('context-text').getBoundingClientRect().right)
    expect(byTestId('context-shortcut').getBoundingClientRect().left).toBeLessThan(byTestId('context-text').getBoundingClientRect().left)
    assertNoPathBarAndNeutralOpen('context-item')
    unmountFamily()

    await mountFamily('menubar', 'rtl')
    assertDirectSequence('menubar-item', ['menubar-icon', 'menubar-text'])
    assertDemoRow('menubar-item', 'menubar-icon', 'menubar-text')
    assertTextIsContained('menubar-long-item', 'menubar-long-text')
    expect(byTestId('menubar-icon').getBoundingClientRect().right).toBeGreaterThan(byTestId('menubar-text').getBoundingClientRect().right)
    assertNoPathBarAndNeutralOpen('menubar-item')
  })
})
