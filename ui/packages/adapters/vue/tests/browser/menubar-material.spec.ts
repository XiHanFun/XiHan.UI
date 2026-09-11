import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenubarArrow,
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemDescription,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 menubar/${name}`)
  return element
}

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountMenubar(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhMenubarRoot, { defaultValue: 'file' }, () => [
      h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
      h(XhMenubarPositioner, { value: 'file' }, () => [
        h(XhMenubarContent, { style: { inlineSize: '260px' } }, () => [
          h(XhMenubarGroup, { value: 'actions' }, () => [
            h(XhMenubarGroupLabel, null, () => h('span', { 'data-testid': 'label-ink' }, '常用操作')),
            h(XhMenubarItem, { value: 'detail' }, () => [
              h(XhMenubarItemIndicator, null, () => '✓'),
              h('span', { 'data-testid': 'item-icon' }, '✂'),
              h(XhMenubarItemText, { 'data-testid': 'item-text' }, () => '一段需要在主行剩余空间里截断的很长菜单命令文字'),
              h('kbd', { 'data-testid': 'shortcut' }, 'Ctrl+X'),
              h(XhMenubarItemDescription, { 'data-testid': 'description' }, () => '说明文字独占第二行'),
            ]),
            h(XhMenubarItem, { 'value': 'raw', 'data-testid': 'raw-item' }, () => [
              h('span', { 'data-testid': 'raw-text' }, '没有 item-text 部件的普通内容'),
            ]),
            h(XhMenubarItem, { 'value': 'submenu', 'data-testid': 'submenu' }, () => [
              h(XhMenubarItemText, null, () => '还有下一级'),
            ]),
            h(XhMenubarItem, { 'value': 'disabled', 'disabled': true, 'data-testid': 'disabled' }, () => '不可用'),
          ]),
          h(XhMenubarSeparator),
        ]),
        h(XhMenubarArrow),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  const submenu = byTestId('submenu')
  submenu.setAttribute('aria-haspopup', 'menu')
  submenu.setAttribute('data-state', 'open')
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('menubar M2 菜单面与条目几何', () => {
  it('顶层控制条保持导航表面，弹出菜单使用静态磨砂材质', async () => {
    await mountMenubar()
    const root = getComputedStyle(part('root'))
    const content = getComputedStyle(part('content'))

    expect(root.backdropFilter || root.getPropertyValue('-webkit-backdrop-filter')).toBe('none')
    expect(content.backdropFilter || content.getPropertyValue('-webkit-backdrop-filter')).toContain('blur(16px)')
    expect(content.backgroundColor).toMatch(/0\.88\)|\/ 0\.88\)/)
    expect(content.boxShadow).not.toBe('none')
    expect(getComputedStyle(part('separator')).borderRadius).not.toBe('0px')
  })

  it('作者图标、正文与快捷键保持原顺序同排，只有 description 独占第二行', async () => {
    await mountMenubar()
    const item = byTestId('item-text').parentElement!
    const icon = byTestId('item-icon')
    const text = byTestId('item-text')
    const description = byTestId('description')
    const shortcut = byTestId('shortcut')
    const center = (element: Element): number => {
      const rect = element.getBoundingClientRect()
      return rect.top + rect.height / 2
    }

    expect(getComputedStyle(item).display).toBe('flex')
    expect([...item.children].map(node => (node as HTMLElement).dataset.testid ?? node.tagName.toLowerCase()))
      .toEqual(['span', 'item-icon', 'item-text', 'shortcut', 'description'])
    expect(center(icon)).toBeCloseTo(center(text), 0)
    expect(center(shortcut)).toBeCloseTo(center(text), 0)
    expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(text.getBoundingClientRect().bottom)
    expect(shortcut.getBoundingClientRect().left).toBeGreaterThan(text.getBoundingClientRect().left)
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    expect(getComputedStyle(text).overflow).toBe('hidden')
    expect(getComputedStyle(byTestId('raw-item')).display).toBe('flex')
  })

  it('子菜单箭头停在主行末端，展开背景保持中性且无始端色条', async () => {
    await mountMenubar()
    const submenu = byTestId('submenu')
    const arrow = getComputedStyle(submenu, '::after')
    const raw = byTestId('raw-item')
    raw.style.transition = 'none'
    await userEvent.hover(raw)
    const hovered = getComputedStyle(raw).backgroundColor

    expect(arrow.gridColumnStart).toBe('auto')
    expect(arrow.order).toBe('1')
    expect(getComputedStyle(submenu).fontWeight).toBe(getComputedStyle(raw).fontWeight)
    expect(getComputedStyle(submenu).borderInlineStartWidth).toBe('0px')
    expect(getComputedStyle(submenu).backgroundColor).toBe(hovered)
    expect(getComputedStyle(byTestId('disabled')).cursor).toBe('not-allowed')
  })

  it('实际 placement 选择单一入场方向，菜单面使用 translate 动效而非 zoom', async () => {
    await mountMenubar()
    const positioner = part('positioner')
    const placement = positioner.dataset.placement ?? ''
    const style = getComputedStyle(positioner)
    const active = placement.startsWith('top')
      ? '--xh-_overlay-enter-down'
      : placement.startsWith('left')
        ? '--xh-_overlay-enter-right'
        : placement.startsWith('right')
          ? '--xh-_overlay-enter-left'
          : '--xh-_overlay-enter-up'
    const directions = [
      '--xh-_overlay-enter-up',
      '--xh-_overlay-enter-down',
      '--xh-_overlay-enter-left',
      '--xh-_overlay-enter-right',
    ]

    expect(style.getPropertyValue(active).trim()).toBe('1')
    expect(directions.filter(name => style.getPropertyValue(name).trim() === '1')).toEqual([active])
    const content = getComputedStyle(part('content'))
    expect(content.animationName).toContain('xh-overlay-slide-in')
    expect(content.getPropertyValue('scale')).toBe('none')
  })
})
