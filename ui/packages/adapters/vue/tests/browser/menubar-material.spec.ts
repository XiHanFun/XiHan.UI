import type { App } from 'vue'
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
              h(XhMenubarItemText, { 'data-testid': 'item-text' }, () => '一段需要在固定正文列里截断的很长菜单命令文字'),
              h(XhMenubarItemDescription, { 'data-testid': 'description' }, () => '说明文字也从正文列开始'),
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

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
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

  it('indicator、正文、说明、裸内容和组标题落在稳定列，长文字真实截断', async () => {
    await mountMenubar()
    const text = byTestId('item-text')
    const description = byTestId('description')
    const raw = byTestId('raw-text')
    const label = byTestId('label-ink')
    const x = text.getBoundingClientRect().left

    expect(description.getBoundingClientRect().left).toBeCloseTo(x, 0)
    expect(raw.getBoundingClientRect().left).toBeCloseTo(x, 0)
    expect(label.getBoundingClientRect().left).toBeCloseTo(x, 0)
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    expect(getComputedStyle(text).overflow).toBe('hidden')
  })

  it('子菜单箭头固定末轨，打开路径不改字重，禁用条目不再显示 pointer', async () => {
    await mountMenubar()
    const submenu = byTestId('submenu')
    const arrow = getComputedStyle(submenu, '::after')

    expect(arrow.gridColumnStart).toBe('-2')
    expect(arrow.gridColumnEnd).toBe('-1')
    expect(getComputedStyle(submenu).fontWeight).toBe(getComputedStyle(byTestId('raw-item')).fontWeight)
    expect(getComputedStyle(submenu).borderInlineStartColor).not.toBe('transparent')
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
