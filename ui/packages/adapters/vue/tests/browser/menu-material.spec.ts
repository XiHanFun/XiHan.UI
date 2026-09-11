import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuArrow,
  XhMenuContent,
  XhMenuGroup,
  XhMenuGroupLabel,
  XhMenuItem,
  XhMenuItemDescription,
  XhMenuItemIndicator,
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

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 menu/${name}`)
  return element
}

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountMenu(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhMenuRoot, { open: true }, () => [
      h(XhMenuTrigger, null, () => '打开'),
      h(XhMenuPositioner, null, () => [
        h(XhMenuContent, { style: { inlineSize: '260px' } }, () => [
          h(XhMenuGroup, { value: 'actions' }, () => [
            h(XhMenuGroupLabel, null, () => h('span', { 'data-testid': 'label-ink' }, '常用操作')),
            h(XhMenuItem, { value: 'detail' }, () => [
              h(XhMenuItemIndicator, null, () => '✓'),
              h(XhMenuItemText, { 'data-testid': 'item-text' }, () => '一段需要在固定正文列里截断的很长菜单命令文字'),
              h(XhMenuItemDescription, { 'data-testid': 'description' }, () => '说明文字也从正文列开始'),
            ]),
            h(XhMenuItem, { 'value': 'raw', 'data-testid': 'raw-item' }, () => [
              h('span', { 'data-testid': 'raw-text' }, '没有 item-text 部件的普通内容'),
            ]),
            h(XhMenuItem, { 'value': 'submenu', 'data-testid': 'submenu' }, () => [
              h(XhMenuItemText, null, () => '还有下一级'),
            ]),
            h(XhMenuItem, { 'value': 'disabled', 'disabled': true, 'data-testid': 'disabled' }, () => '不可用'),
          ]),
          h(XhMenuSeparator),
          h(XhMenuArrow),
        ]),
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

describe('menu M2 与条目几何', () => {
  it('使用静态磨砂配方，正文与分隔结构保持实体可读', async () => {
    await mountMenu()
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter || content.getPropertyValue('-webkit-backdrop-filter')).toContain('blur(16px)')
    expect(content.backgroundColor).toMatch(/0\.88\)|\/ 0\.88\)/)
    expect(content.boxShadow).not.toBe('none')
    const separator = getComputedStyle(part('separator'))
    expect(Number.parseFloat(separator.borderRadius)).toBeGreaterThan(0)
    expect(separator.backgroundColor).not.toBe('transparent')
  })

  it('indicator、正文、说明、裸内容和组标题落在稳定列，长文字真实截断', async () => {
    await mountMenu()
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

  it('子菜单箭头占最后一条显式轨，打开路径不改字重；disabled 不再显示 pointer', async () => {
    await mountMenu()
    const submenu = byTestId('submenu')
    const arrow = getComputedStyle(submenu, '::after')
    expect(arrow.gridColumnStart).toBe('-2')
    expect(arrow.gridColumnEnd).toBe('-1')
    expect(getComputedStyle(submenu).fontWeight).toBe(getComputedStyle(byTestId('raw-item')).fontWeight)
    expect(getComputedStyle(submenu).borderInlineStartColor).not.toBe('transparent')
    expect(getComputedStyle(byTestId('disabled')).cursor).toBe('not-allowed')
  })
})
