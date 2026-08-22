// @vitest-environment jsdom
// side-nav 的侧栏行为：内嵌展开/手风琴、选中与祖先枝点亮、折叠图标栏、roving 方向键。
import type { SideNavNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchTrigger,
  XhSideNavLink,
  XhSideNavList,
  XhSideNavRoot,
} from '../src'

const COLLECTION: SideNavNode[] = [
  { value: 'home', label: '工作台', href: '#home' },
  {
    value: 'user',
    label: '用户管理',
    children: [
      { value: 'user-list', label: '用户列表', href: '#user-list' },
      { value: 'user-role', label: '角色权限', href: '#user-role' },
    ],
  },
  {
    value: 'order',
    label: '订单管理',
    children: [{ value: 'order-list', label: '订单列表', href: '#order-list' }],
  },
]

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

interface MountOptions {
  accordion?: boolean
  collapsed?: boolean
  defaultExpandedValue?: string[]
  defaultValue?: string | null
}

function mountNav(opts: MountOptions = {}): { value: () => string | null, expanded: () => string[] } {
  const value = ref<string | null>(opts.defaultValue ?? null)
  const expanded = ref<string[]>(opts.defaultExpandedValue ?? [])
  const host = document.createElement('div')
  document.body.appendChild(host)
  const branches = COLLECTION.filter(n => n.children)
  const app = createApp({
    setup: () => () =>
      h(XhSideNavRoot, {
        'collection': COLLECTION,
        'accordion': opts.accordion,
        'collapsed': opts.collapsed,
        'value': value.value,
        'expandedValue': expanded.value,
        'onUpdate:value': (v: string | null) => {
          value.value = v
        },
        'onUpdate:expandedValue': (v: string[]) => {
          expanded.value = v
        },
      }, () => [
        h(XhSideNavList, null, () => [
          h(XhSideNavLink, { value: 'home' }, () => '工作台'),
          ...branches.map(branch =>
            h(XhSideNavBranch, { key: branch.value, value: branch.value }, () => [
              h(XhSideNavBranchTrigger, () => branch.label),
              h(XhSideNavBranchContent, null, () => branch.children!.map(leaf =>
                h(XhSideNavLink, { key: leaf.value, value: leaf.value }, () => leaf.label))),
            ])),
        ]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { value: () => value.value, expanded: () => expanded.value }
}

function el(part: string, value?: string): HTMLElement {
  const selector = value
    ? `[data-scope="side-nav"][data-part="${part}"][data-value="${value}"]`
    : `[data-scope="side-nav"][data-part="${part}"]`
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${part} ${value ?? ''}`)
  return hit
}

describe('side-nav', () => {
  it('nav 地标 + 分支 aria-expanded/aria-controls 配对', async () => {
    mountNav({ defaultExpandedValue: ['user'] })
    await tick()
    expect(el('root').getAttribute('role')).toBe('navigation')
    const trigger = el('branch-trigger', 'user')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const contentId = trigger.getAttribute('aria-controls')!
    expect(document.getElementById(contentId)?.getAttribute('data-part')).toBe('branch-content')
  })

  it('点分支展开/收起，可多开', async () => {
    const t = mountNav()
    await tick()
    el('branch-trigger', 'user').click()
    await tick()
    el('branch-trigger', 'order').click()
    await tick()
    expect(t.expanded().sort()).toEqual(['order', 'user'])
  })

  it('accordion：同层只开一枝', async () => {
    const t = mountNav({ accordion: true })
    await tick()
    el('branch-trigger', 'user').click()
    await tick()
    el('branch-trigger', 'order').click()
    await tick()
    expect(t.expanded()).toEqual(['order'])
  })

  it('点叶子落选中：aria-current=page + 祖先枝 data-in-path', async () => {
    const t = mountNav({ defaultExpandedValue: ['user'] })
    await tick()
    el('link', 'user-list').click()
    await tick()
    expect(t.value()).toBe('user-list')
    expect(el('link', 'user-list').getAttribute('aria-current')).toBe('page')
    expect(el('branch-trigger', 'user').hasAttribute('data-in-path')).toBe(true)
    expect(el('branch-trigger', 'order').hasAttribute('data-in-path')).toBe(false)
  })

  it('链接渲染 collection 里的 href', async () => {
    mountNav()
    await tick()
    expect(el('link', 'home').getAttribute('href')).toBe('#home')
  })

  it('collapsed：内嵌展开整体收起、根带 data-collapsed', async () => {
    mountNav({ collapsed: true, defaultExpandedValue: ['user'] })
    await tick()
    expect(el('root').hasAttribute('data-collapsed')).toBe(true)
    expect(el('branch-content', undefined).hasAttribute('hidden')).toBe(true)
  })

  it('方向键上下走行、右键展开左键回父', async () => {
    const t = mountNav({ defaultExpandedValue: [] })
    await tick()
    const home = el('link', 'home')
    home.focus()
    home.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await tick()
    expect(document.activeElement).toBe(el('branch-trigger', 'user'))

    el('branch-trigger', 'user').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await tick()
    expect(t.expanded()).toEqual(['user'])

    el('branch-trigger', 'user').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await tick()
    expect(document.activeElement).toBe(el('link', 'user-list'))

    el('link', 'user-list').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await tick()
    expect(document.activeElement).toBe(el('branch-trigger', 'user'))
  })
})
