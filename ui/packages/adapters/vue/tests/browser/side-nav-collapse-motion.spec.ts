// 侧栏导航折叠成图标栏：整栏宽度按 move 收窄，行文字先淡出、收窄落定才裁掉；分组标题留着自己的高度，
// 行不上下跳；放在 Layout 侧栏里时与侧栏同一段时长、同一条曲线。过渡与布局只有真实浏览器量得出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhLayoutContent,
  XhLayoutRoot,
  XhLayoutSider,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavGroup,
  XhSideNavGroupLabel,
  XhSideNavGroupList,
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
  app = null
  host?.remove()
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

function nav(collapsed: Ref<boolean>) {
  const link = (value: string, label: string) => h(XhSideNavItem, null, () =>
    h(XhSideNavLink, { value }, () => [h('span', { 'aria-hidden': 'true' }, '◆'), h(XhSideNavLinkText, null, () => label)]))
  return h(XhSideNavRoot, { collection: COLLECTION, collapsed: collapsed.value } as Record<string, unknown>, () =>
    h(XhSideNavList, null, () => [
      h(XhSideNavGroup, { value: 'main' }, () => [
        h(XhSideNavGroupLabel, { value: 'main' }, () => '常用'),
        h(XhSideNavGroupList, null, () => [link('home', '工作台')]),
      ]),
      h(XhSideNavGroup, { value: 'admin' }, () => [
        h(XhSideNavGroupLabel, { value: 'admin' }, () => '管理'),
        h(XhSideNavGroupList, null, () => [link('users', '用户管理'), link('logs', '操作日志')]),
      ]),
    ]))
}

function part(name: string, index = 0): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='${name}']`)[index]!
}

function linkOf(value: string): HTMLElement {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='link']`)].find(el => el.getAttribute('href') === `#${value}`)!
}

/** 节点上正在跑的 CSS 过渡：属性 → 时长与曲线。 */
function transitions(el: Element): Map<string, { duration: number, easing: string }> {
  return new Map(el.getAnimations()
    .filter(a => a instanceof CSSTransition)
    .map((a) => {
      const timing = (a as CSSTransition).effect!.getComputedTiming()
      return [(a as CSSTransition).transitionProperty, { duration: Number(timing.duration), easing: String(timing.easing) }]
    }))
}

async function finishAll(): Promise<void> {
  await Promise.all([...host!.querySelectorAll('*')].flatMap(el => el.getAnimations()).map(a => a.finished.catch(() => undefined)))
  await frames(2)
}

describe('side-nav 折叠', () => {
  async function mount(): Promise<Ref<boolean>> {
    const collapsed = ref(false)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => nav(collapsed) })
    app.mount(host)
    await frames(2)
    return collapsed
  }

  it('整栏宽度走过渡；行文字先淡出、仍在行里，落定之后才裁掉', async () => {
    const collapsed = await mount()
    const text = part('link-text')
    const before = text.getBoundingClientRect().width
    collapsed.value = true
    await frames(1)
    expect(transitions(part('root')).has('width'), '整栏宽度走过渡').toBe(true)
    expect(text.getBoundingClientRect().width, '收窄途中文字没被当场裁成 1px').toBeGreaterThan(1)
    expect(transitions(text).has('opacity'), '文字在淡出').toBe(true)
    expect(before).toBeGreaterThan(1)
    await finishAll()
    expect(text.getBoundingClientRect().width, '落定之后裁掉').toBeLessThanOrEqual(1)
  })

  it('分组标题留着自己的高度：折叠途中与落定之后，第二组的行都不上下跳', async () => {
    const collapsed = await mount()
    const top = (): number => linkOf('users').getBoundingClientRect().top
    const before = top()
    collapsed.value = true
    await frames(1)
    expect(top()).toBeCloseTo(before, 0)
    await finishAll()
    expect(top()).toBeCloseTo(before, 0)
  })

  it('展开：宽度先长开，文字在落定之后淡入', async () => {
    const collapsed = await mount()
    collapsed.value = true
    await frames(1)
    await finishAll()
    collapsed.value = false
    await frames(1)
    const text = part('link-text')
    expect(transitions(part('root')).has('width')).toBe(true)
    expect(Number(getComputedStyle(text).opacity), '宽度还在长，文字不先露出来').toBe(0)
    await finishAll()
    // 宽度落定之后文字才起播淡入：再等这一段
    expect(transitions(text).has('opacity'), '落定之后淡入').toBe(true)
    await finishAll()
    expect(Number(getComputedStyle(text).opacity)).toBe(1)
  })
})

describe('side-nav 折叠态的弹出分支', () => {
  it('锚定在分支行旁侧，按锚定列表从锚点一侧短移淡入', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const collection = [{ value: 'users', label: '用户', children: [{ value: 'list', label: '列表', href: '#list' }] }]
    app = createApp({
      render: () => h(XhSideNavRoot, { collection, collapsed: true } as Record<string, unknown>, () =>
        h(XhSideNavList, null, () => h(XhSideNavBranch, { value: 'users' }, () => [
          h(XhSideNavBranchTrigger, null, () => [h('span', { 'aria-hidden': 'true' }, '◆'), h(XhSideNavBranchText, null, () => '用户')]),
          h(XhSideNavBranchContent, null, () => h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'list' }, () => h(XhSideNavLinkText, null, () => '列表')))),
        ]))),
    })
    app.mount(host)
    await frames(2)
    part('branch-trigger').click()
    await frames(1)
    const content = document.querySelector<HTMLElement>(`[data-scope='side-nav'][data-part='branch-content'][data-popout]`)!
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-in')
  })
})

describe('side-nav 放在 Layout 侧栏里', () => {
  it('与侧栏同一段时长、同一条曲线一起收窄', async () => {
    const collapsed = ref(false)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhLayoutRoot, { siderCollapsed: collapsed.value } as Record<string, unknown>, () => [
        h(XhLayoutSider, null, () => nav(collapsed)),
        h(XhLayoutContent, null, () => '内容'),
      ]),
    })
    app.mount(host)
    await frames(3)
    collapsed.value = true
    await frames(1)
    const sider = host.querySelector<HTMLElement>(`[data-scope='layout'][data-part='sider']`)!
    const siderMove = transitions(sider).get('width')
    const navMove = transitions(part('root')).get('width')
    expect(siderMove, '侧栏走过渡').toBeDefined()
    expect(navMove).toEqual(siderMove)
  })
})
