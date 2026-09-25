// Layout 的侧栏里装着 SideNav 时，侧栏内衬缺省归零：SideNav 自带一圈内衬，宽度又与侧栏同取侧栏令牌，
// 再叠一圈侧栏内衬，导航就比侧栏的内容盒宽出两侧内衬、右缘被裁掉。
//
// 侧栏有宽度过渡：折叠态在挂载前就由 props 定好，读到的是落定宽度，不是过渡中途。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhLayoutContent,
  XhLayoutRoot,
  XhLayoutSider,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function sideNav(collapsed: boolean) {
  return h(XhSideNavRoot, { collection: [{ value: 'home', label: '工作台', href: '#home' }], collapsed } as any, () => [
    h(XhSideNavList, null, () => [
      h(XhSideNavItem, null, () => [
        h(XhSideNavLink, { value: 'home' }, () => [h(XhSideNavLinkText, null, () => '工作台')]),
      ]),
    ]),
  ])
}

function mount(options: { withNav: boolean, collapsed?: boolean, sheet?: boolean, style?: string }) {
  host = document.createElement('div')
  if (options.style)
    host.style.cssText = options.style
  document.body.append(host)
  const collapsed = options.collapsed ?? false
  app = createApp({
    render: () => h(XhLayoutRoot, { siderCollapsed: collapsed, siderPresentation: options.sheet ? 'sheet' : 'inline' } as any, () => [
      h(XhLayoutSider, null, () => options.withNav ? [sideNav(collapsed)] : ['侧栏']),
      h(XhLayoutContent, null, () => '内容'),
    ]),
  })
  app.mount(host)
  const sider = host.querySelector<HTMLElement>(`[data-scope='layout'][data-part='sider']`)!
  const nav = host.querySelector<HTMLElement>(`[data-scope='side-nav'][data-part='root']`)
  return { sider, nav }
}

/** 解出令牌的像素值。 */
function tokenPx(name: string): string {
  const probe = document.createElement('div')
  probe.style.paddingInlineStart = `var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).paddingInlineStart
  probe.remove()
  return value
}

describe('layout 侧栏里的 SideNav', () => {
  it('没有 SideNav 时侧栏照旧留 space-3 内衬', () => {
    const { sider } = mount({ withNav: false })
    const style = getComputedStyle(sider)
    expect(style.paddingInlineStart).toBe(tokenPx('--xh-space-3'))
    expect(style.paddingBlockStart).toBe(tokenPx('--xh-space-3'))
  })

  it('装了 SideNav 的侧栏内衬归零，导航与侧栏同宽、不被裁', () => {
    const { sider, nav } = mount({ withNav: true })
    const style = getComputedStyle(sider)
    expect(style.paddingInlineStart).toBe('0px')
    expect(style.paddingInlineEnd).toBe('0px')
    expect(style.paddingBlockStart).toBe('0px')
    const siderBox = sider.getBoundingClientRect()
    const navBox = nav!.getBoundingClientRect()
    expect(navBox.width).toBe(siderBox.width)
    expect(navBox.left).toBe(siderBox.left)
    expect(navBox.right).toBe(siderBox.right)
  })

  it('两件一起折叠成图标栏时同样严丝合缝', () => {
    const { sider, nav } = mount({ withNav: true, collapsed: true })
    const siderBox = sider.getBoundingClientRect()
    const navBox = nav!.getBoundingClientRect()
    expect(nav!.hasAttribute('data-collapsed')).toBe(true)
    expect(navBox.width).toBe(siderBox.width)
    expect(navBox.right).toBe(siderBox.right)
  })

  it('覆盖档的侧栏同样归零：内衬与安全区取大，桌面上安全区是 0', () => {
    const { sider } = mount({ withNav: true, sheet: true })
    expect(sider.dataset.presentation).toBe('sheet')
    const style = getComputedStyle(sider)
    expect(style.paddingInlineStart).toBe('0px')
    expect(style.paddingBlockStart).toBe('0px')
    expect(style.paddingBlockEnd).toBe('0px')
  })

  it('写了内衬槽就按槽走', () => {
    const { sider } = mount({ withNav: true, style: '--xh-layout-sider-padding: 8px' })
    expect(getComputedStyle(sider).paddingInlineStart).toBe('8px')
  })
})
