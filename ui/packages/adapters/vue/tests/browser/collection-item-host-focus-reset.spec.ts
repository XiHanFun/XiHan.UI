// 宿主页面带焦点复位时，真实指针在集合条目之间切换，失焦的那一条不得闪出描边。
//
// Collection Item 配方在条目根上常驻 solid 描边、静息透明。宿主常见的
// `button:focus:not(:focus-visible) { outline: none !important }`（VitePress 默认主题 base.css 原文）
// 是无层规则，压过库里分层的家族描边：指针落焦时简写把 outline-style 复位成 none，
// outline-color 同时落到 currentColor。焦点搬到下一条、规则失效的那一刻家族的 solid 立即回来；
// 若配方仍把 outline-color 放进过渡，颜色要从 currentColor 淡回透明——那几帧上一条目画出一圈实心边。
// 过渡的中间帧只有真实 Chromium 能看见，jsdom 不算数。
//
// 与 collection-item-pointer-focus-outline（库里自己的复位，已删）同一根因，这里钉的是宿主复位那条路，
// 覆盖 Tabs 之外同型的 nav / page 语境条目：Anchor link、NavigationMenu / Menubar trigger、
// Breadcrumb link、SideNav link。
import type { App, VNode } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import { pressPointer, releasePointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 松开后连续观察的帧数：micro 与 release 时长跨越的帧都在这个窗口里。 */
const FRAMES_AFTER = 5

interface Fixture {
  name: string
  tree: () => VNode
  /** 两枚条目的选择器，按文档序取第一、第二个 */
  item: string
}

const fixtures: Fixture[] = [
  {
    name: 'anchor link',
    item: '[data-scope="anchor"][data-part="link"]',
    tree: () => h(XhAnchorRoot, { defaultValue: 'a', smooth: false }, () => [
      h(XhAnchorList, null, () => [
        h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'a' }, () => '概述')),
        h(XhAnchorItem, null, () => h(XhAnchorLink, { value: 'b' }, () => '用法')),
      ]),
    ]),
  },
  {
    name: 'breadcrumb link',
    item: '[data-scope="breadcrumb"][data-part="link"]',
    tree: () => h(XhBreadcrumbRoot, null, () => [
      h(XhBreadcrumbList, null, () => [
        h(XhBreadcrumbItem, null, () => h(XhBreadcrumbLink, { value: 'a', href: '#a' }, () => '首页')),
        h(XhBreadcrumbItem, null, () => h(XhBreadcrumbLink, { value: 'b', href: '#b' }, () => '项目')),
        h(XhBreadcrumbItem, null, () => h(XhBreadcrumbLink, { value: 'c', current: true }, () => '当前')),
      ]),
    ]),
  },
  {
    name: 'menubar trigger',
    item: '[data-scope="menubar"][data-part="trigger"]',
    tree: () => h(XhMenubarRoot, null, () => [
      h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
      h(XhMenubarPositioner, { value: 'file' }, () => h(XhMenubarContent, { value: 'file' }, () => [
        h(XhMenubarItem, { value: 'new' }, () => h(XhMenubarItemText, null, () => '新建')),
      ])),
      h(XhMenubarTrigger, { value: 'edit' }, () => '编辑'),
      h(XhMenubarPositioner, { value: 'edit' }, () => h(XhMenubarContent, { value: 'edit' }, () => [
        h(XhMenubarItem, { value: 'undo' }, () => h(XhMenubarItemText, null, () => '撤销')),
      ])),
    ]),
  },
  {
    name: 'navigation-menu trigger',
    item: '[data-scope="navigation-menu"][data-part="trigger"]',
    tree: () => h(XhNavigationMenuRoot, null, () => h(XhNavigationMenuList, null, () => [
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'products' }, () => '产品'),
        h(XhNavigationMenuContent, { value: 'products' }, () => h(XhNavigationMenuLink, { href: '#overview' }, () => '总览')),
      ]),
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'docs' }, () => '文档'),
        h(XhNavigationMenuContent, { value: 'docs' }, () => h(XhNavigationMenuLink, { href: '#guide' }, () => '指南')),
      ]),
    ])),
  },
  {
    name: 'side-nav link',
    item: '[data-scope="side-nav"][data-part="link"]',
    tree: () => h(XhSideNavRoot, {
      collection: [
        { value: 'home', label: '首页', href: '#home' },
        { value: 'user', label: '用户', href: '#user' },
      ],
      defaultValue: 'home',
    }, () => h(XhSideNavList, null, () => [
      h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'home' }, () => h(XhSideNavLinkText, null, () => '首页'))),
      h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user' }, () => h(XhSideNavLinkText, null, () => '用户'))),
    ])),
  },
]

let app: App | null = null
let host: HTMLElement | null = null
let hostReset: HTMLStyleElement | null = null

/** 宿主页面常见的焦点复位（VitePress base.css 原文，链接一并纳入）。 */
function installHostFocusReset(): void {
  hostReset = document.createElement('style')
  hostReset.textContent = [
    ':is(button, a):focus, :is(button, a):focus-visible { outline: 1px dotted; outline: 4px auto -webkit-focus-ring-color; }',
    ':is(button, a):focus:not(:focus-visible) { outline: none !important; }',
  ].join('\n')
  document.head.append(hostReset)
}

interface Sample {
  frame: number
  outlineColor: string
  outlineStyle: string
  outlineWidth: string
  focusVisible: boolean
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** 过渡中的颜色以 oklab / color-mix 串回报，alpha 为 0 的一律视为透明。 */
function transparent(color: string): boolean {
  return color === 'rgba(0, 0, 0, 0)' || color === 'transparent' || /\/\s*0\)$/.test(color)
}

function sample(frame: number, element: HTMLElement): Sample {
  const style = getComputedStyle(element)
  return {
    frame,
    outlineColor: style.outlineColor,
    outlineStyle: style.outlineStyle,
    outlineWidth: style.outlineWidth,
    focusVisible: element.matches(':focus-visible'),
  }
}

/** 这一帧是否画着看得见的描边：style 为 none、宽为 0 或颜色透明都算没画。 */
function outlined(s: Sample): boolean {
  return s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0 && !transparent(s.outlineColor)
}

async function mount(fixture: Fixture): Promise<{ a: HTMLElement, b: HTMLElement }> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: fixture.tree })
  app.mount(host)
  await nextTick()
  await nextFrame()
  const items = host.querySelectorAll<HTMLElement>(fixture.item)
  if (items.length < 2)
    throw new Error(`${fixture.name} 没挂出两枚条目`)
  return { a: items[0]!, b: items[1]! }
}

afterEach(async () => {
  await releasePointerAway()
  app?.unmount()
  host?.remove()
  hostReset?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  hostReset = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe.each(fixtures)('宿主焦点复位下 $name 的真实指针切换', (fixture) => {
  it('从 A 点到 B：按下、松开与随后各帧，A 与 B 都不出现非透明描边', async () => {
    installHostFocusReset()
    const { a, b } = await mount(fixture)

    await pressPointer(a)
    await releasePointer(a)
    await nextTick()
    await nextFrame()
    expect(document.activeElement, '指针点击把焦点搬到 A').toBe(a)
    expect(a.matches(':focus-visible'), '指针路径的焦点不带 :focus-visible').toBe(false)

    const frames: Array<{ phase: string, a: Sample, b: Sample }> = []
    await pressPointer(b)
    frames.push({ phase: 'down', a: sample(0, a), b: sample(0, b) })
    expect(document.activeElement, '按下即把焦点搬到 B').toBe(b)
    await releasePointer(b)
    await nextTick()
    frames.push({ phase: 'up', a: sample(0, a), b: sample(0, b) })
    for (let frame = 1; frame <= FRAMES_AFTER; frame += 1) {
      await nextFrame()
      frames.push({ phase: 'up', a: sample(frame, a), b: sample(frame, b) })
    }

    const leaked = frames.filter(f => outlined(f.a) || outlined(f.b) || f.a.focusVisible || f.b.focusVisible)
    expect(leaked, `逐帧采样：${JSON.stringify(frames, null, 1)}`).toEqual([])
  })
})
