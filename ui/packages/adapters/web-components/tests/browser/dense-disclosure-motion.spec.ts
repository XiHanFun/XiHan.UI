// 密集展开（侧导航内联子层、树、JSON 查看器）：子层按实测高度补间，展开从 0 长到自己的高度、同帧淡入；
// 收起时原处的替身从原高度缩到 0、同帧淡出，播完即移除。替身里克隆出来的元素不接线，播完前不被重建。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, collection: unknown, defaultExpandedValue?: string[], value?: unknown }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
  setDiagnosticsLevel('warn')
})

async function settle(el: XhElement): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

/** 宿主上把展开与收起拉长到 10s：按键与点击经 CDP 往返，默认 200ms 回来时早就播完了。 */
async function mount(tag: string, setup: (el: XhElement) => void, markup = ''): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  host.style.setProperty('--xh-motion-duration-expand', '10s')
  host.style.setProperty('--xh-motion-duration-collapse', '10s')
  document.body.append(host)
  const el = document.createElement(tag) as XhElement
  el.innerHTML = markup
  setup(el)
  host.append(el)
  await settle(el)
  return el
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function ghostOf(scope: string): HTMLElement | null {
  return host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='branch-content'][data-xh-ghost]`)
}

function live(scope: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='branch-content']:not([data-xh-ghost])`)]
}

function seek(animation: Animation, progress: number): void {
  animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * progress
}

function leaf(value: string, label: string): string {
  return `<li data-xh-part="item"><a data-xh-part="link" value="${value}"><span data-xh-part="link-text">${label}</span></a></li>`
}

/** 侧导航的行由作者手写，元素只接线。 */
const NAV_MARKUP = `<nav data-xh-part="root"><ul data-xh-part="list">
  <li data-xh-part="branch" value="user">
    <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span></button>
    <ul data-xh-part="branch-content">${leaf('user-list', '用户列表')}${leaf('user-role', '角色权限')}</ul>
  </li>
  <li data-xh-part="branch" value="order">
    <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">订单管理</span></button>
    <ul data-xh-part="branch-content">${leaf('order-list', '订单列表')}</ul>
  </li>
</ul></nav>`

const NAV = [
  { value: 'user', label: '用户管理', children: [
    { value: 'user-list', label: '用户列表', href: '#user-list' },
    { value: 'user-role', label: '角色权限', href: '#user-role' },
  ] },
  { value: 'order', label: '订单管理', children: [{ value: 'order-list', label: '订单列表', href: '#order-list' }] },
]

function navTrigger(index: number): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='branch-trigger']`)[index]!
}

describe('xh-side-nav 内联子层', () => {
  it('展开从 0 补到实测高度、第一帧下面的分支不动；收起由替身缩回去、播完即移除', async () => {
    const nav = await mount('xh-side-nav', (el) => {
      el.collection = NAV
    }, NAV_MARKUP)
    const belowTop = navTrigger(1).getBoundingClientRect().top
    await userEvent.click(navTrigger(0))
    await nav.updateComplete
    await expect.poll(() => live('side-nav').some(el => tween(el) !== undefined)).toBe(true)
    const content = live('side-nav').find(el => tween(el) !== undefined)!
    const expanding = tween(content)!
    expanding.pause()
    seek(expanding, 0)
    expect(content.getBoundingClientRect().height).toBeLessThan(1)
    expect(Math.abs(navTrigger(1).getBoundingClientRect().top - belowTop)).toBeLessThan(1)
    expanding.finish()
    const height = content.getBoundingClientRect().height
    expect(height).toBeGreaterThan(1)

    await userEvent.click(navTrigger(0))
    await nav.updateComplete
    await expect.poll(() => ghostOf('side-nav') !== null).toBe(true)
    const ghost = ghostOf('side-nav')!
    expect(ghost.hasAttribute('inert')).toBe(true)
    const collapsing = tween(ghost)!
    collapsing.pause()
    seek(collapsing, 0)
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    // 替身里的链接是旧画面：键盘越过它直接到下一枝
    navTrigger(0).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(navTrigger(1))
    collapsing.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})

describe('xh-tree 与 xh-json-viewer', () => {
  it('树：右键展开补间，左键收起由替身缩回去', async () => {
    await mount('xh-tree', (el) => {
      el.collection = [{ value: 'docs', label: 'docs', children: [{ value: 'a', label: 'a.md' }, { value: 'b', label: 'b.md' }] }]
    })
    host!.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch']`)!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => live('tree').some(el => tween(el) !== undefined)).toBe(true)
    tween(live('tree').find(el => tween(el) !== undefined)!)!.finish()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(() => ghostOf('tree') !== null).toBe(true)
    const ghost = ghostOf('tree')!
    tween(ghost)!.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('jSON 查看器：子层收起由替身缩回去；再展开从 0 补间', async () => {
    // 作者只写一个 root 节点，行由元素铺进去
    await mount('xh-json-viewer', (el) => {
      el.value = { user: { name: 'Ada', role: 'admin', city: 'London' } }
    }, '<div data-xh-part="root"></div>')
    const branch = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='json-viewer'][data-part='branch'][aria-expanded]`)!
    branch().focus()
    if (branch().getAttribute('aria-expanded') === 'true') {
      await userEvent.keyboard('{ArrowLeft}')
      await expect.poll(() => ghostOf('json-viewer') !== null).toBe(true)
      const ghost = ghostOf('json-viewer')!
      tween(ghost)!.finish()
      await expect.poll(() => ghost.isConnected).toBe(false)
    }
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => live('json-viewer').some(el => tween(el) !== undefined)).toBe(true)
  })
})
