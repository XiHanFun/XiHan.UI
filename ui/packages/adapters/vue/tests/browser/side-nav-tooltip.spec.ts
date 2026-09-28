// 图标栏的名称提示：落成图标栏后只剩图标的叶子悬停或聚焦时，在行尾一侧显示行的标签。
// 它就是库内的 Tooltip：反白面、control 圆角、悬停等开延时、接替时原地换锚都随 Tooltip。
//
// 判据是真实布局与计算样式：提示落在行的哪一侧、与行是否居中对齐、面的圆角与字色，jsdom 都算不出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhSideNavTooltip,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

const COLLECTION = [
  { value: 'home', label: '工作台', href: '#home' },
  { value: 'users', label: '用户管理', href: '#users' },
  { value: 'logs', label: '操作日志', href: '#logs' },
]

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(options: { collapsed?: Ref<boolean>, dir?: 'ltr' | 'rtl' } = {}): Promise<void> {
  const collapsed = options.collapsed ?? ref(true)
  host = document.createElement('div')
  host.style.paddingInline = '200px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhSideNavRoot, { collection: COLLECTION, collapsed: collapsed.value, dir: options.dir } as Record<string, unknown>, () => [
      h(XhSideNavList, null, () => COLLECTION.map(node => h(XhSideNavItem, { key: node.value }, () =>
        h(XhSideNavLink, { value: node.value }, () => [
          h('span', { 'aria-hidden': 'true' }, '◆'),
          h(XhSideNavLinkText, null, () => node.label),
        ])))),
      h(XhSideNavTooltip),
    ]),
  })
  app.mount(host)
  await frames(2)
}

function link(index: number): HTMLElement {
  const el = host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='link']`)[index]
  if (!el)
    throw new Error(`缺少第 ${index} 条链接`)
  return el
}

function content(): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='tooltip'][data-part='content']`)
  if (!el)
    throw new Error('缺少名称提示的本体')
  return el
}

function shown(): boolean {
  const el = document.querySelector<HTMLElement>(`[data-scope='tooltip'][data-part='content']`)
  return !!el && el.getAttribute('data-state') === 'open' && getComputedStyle(el).display !== 'none'
}

/** 等进场动画播完：几何量的是落定的位置，不是途中的位移。 */
async function settled(): Promise<void> {
  await Promise.all(document.getAnimations().map(a => a.finished.catch(() => undefined)))
  await frames(2)
}

/** 读一支令牌在某个节点上解析出来的计算值。 */
function resolved(on: HTMLElement, property: string, token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  on.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('side-nav 图标栏名称提示', () => {
  it('悬停只剩图标的叶子：等开延时后在行尾一侧露面，与行竖向居中对齐，文字是行的标签', async () => {
    await mount()
    await userEvent.hover(link(1))
    await frames()
    expect(shown(), '悬停当下还在等开延时').toBe(false)
    await expect.poll(shown, { timeout: 2000 }).toBe(true)
    await settled()
    const row = link(1).getBoundingClientRect()
    const tip = content().getBoundingClientRect()
    expect(content().textContent).toBe('用户管理')
    expect(tip.left, '落在行尾（ltr 的右侧）').toBeGreaterThan(row.right)
    expect(tip.top + tip.height / 2).toBeCloseTo(row.top + row.height / 2, 0)
  })

  it('反白身份与 Tooltip 同一副：control 圆角、on 色文字，对读屏隐藏', async () => {
    await mount()
    link(0).focus()
    await expect.poll(shown).toBe(true)
    await settled()
    const el = content()
    const style = getComputedStyle(el)
    expect(style.borderTopLeftRadius).toBe(resolved(el, 'border-top-left-radius', '--xh-shape-control'))
    expect(style.color).toBe(resolved(el, 'color', '--xh-bg-surface'))
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.hasAttribute('role')).toBe(false)
    expect(link(0).hasAttribute('aria-describedby')).toBe(false)
  })

  it('开着时指针挪到下一片叶子：提示不收、不重播进场，原地换到新的一行', async () => {
    await mount()
    await userEvent.hover(link(0))
    await expect.poll(shown, { timeout: 2000 }).toBe(true)
    await settled()
    await userEvent.hover(link(2))
    await expect.poll(() => content().textContent).toBe('操作日志')
    await frames(2)
    expect(shown()).toBe(true)
    expect(content().getAnimations().length, '换行不重播进场').toBe(0)
    const row = link(2).getBoundingClientRect()
    const tip = content().getBoundingClientRect()
    expect(tip.top + tip.height / 2).toBeCloseTo(row.top + row.height / 2, 0)
  })

  it('聚焦立即露面、不走延时；rtl 下落在行的左侧', async () => {
    await mount({ dir: 'rtl' })
    link(0).focus()
    await frames(2)
    expect(shown()).toBe(true)
    await settled()
    expect(content().getBoundingClientRect().right).toBeLessThan(link(0).getBoundingClientRect().left)
  })

  it('平铺时行文字都在：悬停与聚焦都不露面', async () => {
    await mount({ collapsed: ref(false) })
    link(0).focus()
    await userEvent.hover(link(1))
    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(shown()).toBe(false)
  })
})
