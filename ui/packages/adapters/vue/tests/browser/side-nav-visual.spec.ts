import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function fontSizeOf(size: Size): Promise<number> {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(
      XhSideNavRoot,
      { size, collection: [{ value: 'home', label: '首页' }] },
      () => h(XhSideNavList, null, () => h(
        XhSideNavItem,
        null,
        () => h(XhSideNavLink, { value: 'home' }, () => h(XhSideNavLinkText, null, () => '首页')),
      )),
    ),
  })
  app.mount(host)
  await nextTick()
  const link = host.querySelector<HTMLElement>('[data-scope="side-nav"][data-part="link"]')!
  return Number.parseFloat(getComputedStyle(link).fontSize)
}

describe('side-nav 尺寸层级', () => {
  it('小、中、大三档的行文字逐档增大', async () => {
    const sm = await fontSizeOf('sm')
    const md = await fontSizeOf('md')
    const lg = await fontSizeOf('lg')

    expect(sm).toBeLessThan(md)
    expect(md).toBeLessThan(lg)
  })
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
  const collection = [
    { value: 'home', label: '首页' },
    { value: 'user', label: '用户', children: [{ value: 'user-list', label: '列表' }, { value: 'user-role', label: '角色' }] },
    { value: 'archive', label: '归档', disabled: true, children: [{ value: 'old', label: '旧' }] },
  ]
  app = createApp({
    setup: () => () => h(XhSideNavRoot, { collection, defaultValue: 'user-role', defaultExpandedValue: ['user'] }, () => [
      h(XhSideNavList, null, () => [
        h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'home' }, () => h(XhSideNavLinkText, null, () => '首页'))),
        h(XhSideNavBranch, { value: 'user' }, () => [
          h(XhSideNavBranchTrigger, null, () => [h(XhSideNavBranchText, null, () => '用户'), h(XhSideNavBranchIndicator)]),
          h(XhSideNavBranchContent, null, () => [
            h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user-list' }, () => h(XhSideNavLinkText, null, () => '列表'))),
            h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user-role' }, () => h(XhSideNavLinkText, null, () => '角色'))),
          ]),
        ]),
        h(XhSideNavBranch, { value: 'archive' }, () => [
          h(XhSideNavBranchTrigger, null, () => [h(XhSideNavBranchText, null, () => '归档'), h(XhSideNavBranchIndicator)]),
          h(XhSideNavBranchContent, null, () => [
            h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'old' }, () => h(XhSideNavLinkText, null, () => '旧'))),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  for (const row of host.querySelectorAll<HTMLElement>('[data-scope="side-nav"]:is([data-part="link"], [data-part="branch-trigger"])'))
    row.style.transition = 'none'
}

function link(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="side-nav"][data-part="link"][data-value="${value}"]`)!
}

function trigger(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="side-nav"][data-part="branch-trigger"][data-value="${value}"]`)!
}

describe('side-nav 当前项与展开路径（真源 §7.3 页内持久集合 / 展开路径）', () => {
  it('当前页：品牌淡底 + 淡底前景 + 起始侧 2px 指示条；展开路径是与悬停同档的中性面，不用品牌色也不加粗', async () => {
    await mountNav()
    const current = link('user-role')
    const plain = link('user-list')
    expect(current.hasAttribute('data-current')).toBe(true)
    expect(getComputedStyle(current).backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
    expect(getComputedStyle(current).color).toBe(resolve('--xh-fg-on-brand-subtle', 'color'))
    const bar = getComputedStyle(current, '::before')
    expect(bar.position).toBe('absolute')
    expect(bar.width).toBe('2px')
    expect(bar.backgroundColor).toBe(resolve('--xh-fg-brand'))
    expect(getComputedStyle(plain, '::before').content).toBe('none')

    const inPath = trigger('user')
    expect(inPath.hasAttribute('data-in-path')).toBe(true)
    expect(getComputedStyle(inPath).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(inPath).color).toBe(getComputedStyle(plain).color)
    expect(getComputedStyle(inPath).fontWeight).toBe(getComputedStyle(plain).fontWeight)
    // 箭头顶在行尾
    const indicator = inPath.querySelector<HTMLElement>('[data-part="branch-indicator"]')!
    expect(indicator.getBoundingClientRect().right).toBeLessThanOrEqual(inPath.getBoundingClientRect().right)
    expect(indicator.getBoundingClientRect().left).toBeGreaterThan(inPath.querySelector<HTMLElement>('[data-part="branch-text"]')!.getBoundingClientRect().left)
  })

  it('禁用分支：不悬停换底、字色降级、光标 not-allowed；普通行悬停 100，当前行悬停 20%', async () => {
    await mountNav()
    const disabled = trigger('archive')
    await userEvent.hover(disabled)
    expect(getComputedStyle(disabled).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(disabled).color).toBe(resolve('--xh-fg-disabled', 'color'))
    expect(getComputedStyle(disabled).cursor).toBe('not-allowed')
    const plain = link('home')
    await userEvent.hover(plain)
    expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    const current = link('user-role')
    await userEvent.hover(current)
    expect(getComputedStyle(current).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))
  })
})
