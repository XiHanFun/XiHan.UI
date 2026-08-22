// @vitest-environment jsdom
// side-nav 折叠态的子级弹出：顶层分支换装浮层触发（悬停/点按/方向键），
// 面板内选中叶子落值并收面板；平铺态与 collapsedPopout=false 不受影响。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

async function sleep(ms: number): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
  await tick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

const COLLECTION = [
  { value: 'docs', label: '文档', children: [{ value: 'guide', label: '指南' }, { value: 'api', label: '接口' }] },
  { value: 'blog', label: '博客', children: [{ value: 'b1', label: '第一篇' }] },
  { value: 'home', label: '首页' },
]

function mountNav(props: Record<string, unknown> = {}): { select: ReturnType<typeof vi.fn> } {
  const select = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const branch = (v: string, links: string[]): ReturnType<typeof h> =>
    h(XhSideNavBranch, { value: v }, () => [
      h(XhSideNavBranchTrigger, () => [h(XhSideNavBranchText, () => v)]),
      h(XhSideNavBranchContent, null, () => links.map(l =>
        h(XhSideNavItem, { key: l }, () => [h(XhSideNavLink, { value: l }, () => [h(XhSideNavLinkText, () => l)])]),
      )),
    ])
  const app = createApp({
    setup: () => () =>
      h(XhSideNavRoot, { 'collection': COLLECTION, 'collapsed': true, 'onValue-change': select, ...props }, () => [
        h(XhSideNavList, null, () => [
          branch('docs', ['guide', 'api']),
          branch('blog', ['b1']),
          h(XhSideNavItem, null, () => [h(XhSideNavLink, { value: 'home' }, () => [h(XhSideNavLinkText, () => 'home')])]),
        ]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { select }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const TRIGGER = (v: string): string => `[data-scope="side-nav"][data-part="branch-trigger"][data-value="${v}"]`

function panelOf(v: string): HTMLElement {
  // 弹出面板的定位层被搬到浮层落点，面板不再是触发按钮的祖先子树成员，
  // 只能全局按配对 id 找：id 由 connect 从 scope 派生，触发按钮的 aria-controls 指着它
  const id = el(TRIGGER(v)).getAttribute('aria-controls')
  const panel = id == null ? null : document.getElementById(id)
  if (!panel)
    throw new Error(`找不到 ${v} 的面板`)
  return panel as HTMLElement
}

/** 定位层：被搬到浮层落点，按 connect 派生的配对 id 全局查。 */
function positionerOf(v: string): HTMLElement {
  const panel = panelOf(v)
  const positioner = panel.closest<HTMLElement>('[data-part="positioner"]')
  if (!positioner)
    throw new Error(`找不到 ${v} 的定位层`)
  return positioner
}

describe('side-nav 折叠态弹出', () => {
  it('悬停顶层分支：延时后弹出面板，触发按钮 aria-expanded 同步', async () => {
    mountNav()
    await tick()
    const trigger = el(TRIGGER('docs'))
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType: 'mouse' }))
    await sleep(150)
    const panel = panelOf('docs')
    expect(panel.hasAttribute('hidden')).toBe(false)
    expect(panel.hasAttribute('data-popout')).toBe(true)
    expect(positionerOf('docs').style.position).toBe('fixed')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('点按开合；换分支点按即切换', async () => {
    mountNav()
    await tick()
    el(TRIGGER('docs')).click()
    await tick()
    expect(panelOf('docs').hasAttribute('hidden')).toBe(false)

    el(TRIGGER('blog')).click()
    await tick()
    expect(panelOf('blog').hasAttribute('hidden')).toBe(false)
    expect(panelOf('docs').hasAttribute('hidden')).toBe(true)

    el(TRIGGER('blog')).click()
    await tick()
    expect(panelOf('blog').hasAttribute('hidden')).toBe(true)
  })

  it('换枝播退场：旧面板 data-state=closed 且留在原位直到退场播完，新面板同时 open', async () => {
    mountNav()
    await tick()
    el(TRIGGER('docs')).click()
    await tick()
    const docs = positionerOf('docs')
    expect(docs.hasAttribute('data-positioned')).toBe(true)

    // jsdom 不把样式表里的 animation 算进 getComputedStyle：给收起态的面板伪造一支退场动画，退场闸门才申领得到租约
    const native = window.getComputedStyle
    const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((target, pseudo) => {
      const style = native.call(window, target, pseudo)
      if (target.getAttribute('data-part') !== 'branch-content' || target.getAttribute('data-state') !== 'closed')
        return style
      return new Proxy(style, {
        get(t, key) {
          if (key === 'animationName')
            return 'xh-pop-out'
          if (key === 'display')
            return 'block'
          const value = Reflect.get(t, key)
          return typeof value === 'function' ? value.bind(t) : value
        },
      })
    })
    cleanup.push(() => spy.mockRestore())

    el(TRIGGER('blog')).click()
    await tick()
    // 旧面板：收起态、未藏、坐标仍是它自己名下那份；新面板同帧展开
    expect(docs.getAttribute('data-state')).toBe('closed')
    expect(docs.hasAttribute('hidden')).toBe(false)
    expect(docs.hasAttribute('data-positioned')).toBe(true)
    expect(docs.style.position).toBe('fixed')
    expect(panelOf('docs').hasAttribute('hidden')).toBe(false)
    expect(positionerOf('blog').getAttribute('data-state')).toBe('open')
    expect(panelOf('blog').hasAttribute('hidden')).toBe(false)

    // 退场播完才真收
    const end = new Event('animationend', { bubbles: true })
    Object.defineProperty(end, 'animationName', { value: 'xh-pop-out' })
    panelOf('docs').dispatchEvent(end)
    await tick()
    expect(docs.hasAttribute('hidden')).toBe(true)
    expect(panelOf('docs').hasAttribute('hidden')).toBe(true)
    expect(panelOf('blog').hasAttribute('hidden')).toBe(false)
  })

  it('面板内点链接：落选中并收面板', async () => {
    const t = mountNav()
    await tick()
    el(TRIGGER('docs')).click()
    await tick()
    const link = panelOf('docs').querySelector<HTMLElement>('[data-part="link"][data-value="api"]')
    expect(link).toBeTruthy()
    link!.click()
    await tick()
    expect(t.select).toHaveBeenCalledWith({ value: 'api' })
    expect(panelOf('docs').hasAttribute('hidden')).toBe(true)
  })

  it('键盘：右方向键弹出并落焦面板第一行，左方向键收回还焦触发按钮', async () => {
    mountNav()
    await tick()
    const trigger = el(TRIGGER('docs'))
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await sleep(50)
    const panel = panelOf('docs')
    expect(panel.hasAttribute('hidden')).toBe(false)
    const first = panel.querySelector<HTMLElement>('[data-part="link"][data-value="guide"]')
    expect(document.activeElement).toBe(first)

    first!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    // 焦点返还延后一帧（rAF），多等一拍
    await sleep(50)
    expect(panel.hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(trigger)
  })

  it('键盘：面板内上下方向键走面板行序列', async () => {
    mountNav()
    await tick()
    const trigger = el(TRIGGER('docs'))
    trigger.focus()
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await sleep(50)
    const panel = panelOf('docs')
    const guide = panel.querySelector<HTMLElement>('[data-value="guide"]')!
    guide.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await tick()
    expect(document.activeElement).toBe(panel.querySelector('[data-value="api"]'))
  })

  it('平铺态不弹出：hover 与点按都走原来的内嵌展开', async () => {
    mountNav({ collapsed: false })
    await tick()
    const trigger = el(TRIGGER('docs'))
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType: 'mouse' }))
    await sleep(150)
    const panel = panelOf('docs')
    expect(panel.hasAttribute('data-popout')).toBe(false)
    expect(panel.hasAttribute('hidden')).toBe(true)

    trigger.click()
    await tick()
    expect(panel.hasAttribute('hidden')).toBe(false)
    expect(panel.style.position).not.toBe('fixed')
  })

  it('指针打开后键盘进入面板：关闭路径照样把焦点还给触发按钮', async () => {
    mountNav()
    await tick()
    const trigger = el(TRIGGER('docs'))
    trigger.focus()
    trigger.click()
    await tick()
    const panel = panelOf('docs')
    expect(panel.hasAttribute('hidden')).toBe(false)
    // 已开着再按 Enter：进面板第一行
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await tick()
    const first = panel.querySelector<HTMLElement>('[data-value="guide"]')
    expect(document.activeElement).toBe(first)

    first!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await sleep(50)
    expect(panel.hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(trigger)
  })

  it('弹出期间折叠开关翻回平铺：面板收掉，分支恢复内嵌展开', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const collapsed = ref(true)
    const app = createApp({
      setup: () => () =>
        h(XhSideNavRoot, { collection: COLLECTION, collapsed: collapsed.value }, () => [
          h(XhSideNavList, null, () => [
            h(XhSideNavBranch, { value: 'docs' }, () => [
              h(XhSideNavBranchTrigger, () => [h(XhSideNavBranchText, () => 'docs')]),
              h(XhSideNavBranchContent, null, () => [
                h(XhSideNavItem, null, () => [h(XhSideNavLink, { value: 'guide' }, () => [h(XhSideNavLinkText, () => 'guide')])]),
              ]),
            ]),
          ]),
        ]),
    })
    app.mount(host)
    cleanup.push(() => {
      app.unmount()
      host.remove()
    })
    await tick()
    el(TRIGGER('docs')).click()
    await tick()
    expect(panelOf('docs').hasAttribute('data-popout')).toBe(true)
    expect(panelOf('docs').hasAttribute('hidden')).toBe(false)

    collapsed.value = false
    await tick()
    const panel = panelOf('docs')
    expect(panel.hasAttribute('data-popout')).toBe(false)
    expect(panel.style.position).not.toBe('fixed')
    // 机器已回 idle：内嵌展开照常工作
    el(TRIGGER('docs')).click()
    await tick()
    expect(panel.hasAttribute('hidden')).toBe(false)
  })

  it('collapsedPopout=false：回到纯图标栏，点按不弹面板', async () => {
    mountNav({ collapsedPopout: false })
    await tick()
    el(TRIGGER('docs')).click()
    await sleep(150)
    const panel = panelOf('docs')
    expect(panel.hasAttribute('data-popout')).toBe(false)
    expect(panel.hasAttribute('hidden')).toBe(true)
  })
})
