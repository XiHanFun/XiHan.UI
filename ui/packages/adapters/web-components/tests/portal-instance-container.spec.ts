// @vitest-environment jsdom

import type { XhTourElement } from '../src/elements/tour'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

type PortalContainerResolver = () => Element | null

interface PortalHost extends HTMLElement {
  open?: boolean
  portalContainer?: PortalContainerResolver
  updateComplete: Promise<unknown>
}

interface ConfigHost extends HTMLElement {
  portalContainer?: PortalContainerResolver
}

interface SideNavHost extends PortalHost {
  collection: Array<{ value: string, children: Array<{ value: string }> }>
}

const PORTAL_TAGS = [
  'xh-cascader',
  'xh-color-picker',
  'xh-combobox',
  'xh-command',
  'xh-context-menu',
  'xh-date-picker',
  'xh-dialog',
  'xh-drawer',
  'xh-hover-card',
  'xh-image-viewer',
  'xh-mention',
  'xh-menu',
  'xh-menubar',
  'xh-pagination',
  'xh-popconfirm',
  'xh-popover',
  'xh-select',
  'xh-side-nav',
  'xh-time-picker',
  'xh-tooltip',
  'xh-tour',
  'xh-tree-select',
] as const

defineXhElements()

async function settle(doc: Document = document): Promise<void> {
  for (let round = 0; round < 7; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<PortalHost>(PORTAL_TAGS.join(', ')))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

function targetOf(root: HTMLElement): Element | null {
  return root.parentElement?.parentElement ?? null
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wC Portal 宿主公开面', () => {
  it('只给真正物理 Portal 宿主与 xh-config 暴露 property-only resolver', () => {
    const resolver = (): Element => document.body
    for (const tag of PORTAL_TAGS) {
      const element = document.createElement(tag) as PortalHost
      expect('portalContainer' in element, tag).toBe(true)
      element.portalContainer = resolver
      expect(element.portalContainer, tag).toBe(resolver)
      expect(element.hasAttribute('portal-container'), tag).toBe(false)
    }

    const config = document.createElement('xh-config') as ConfigHost
    expect('portalContainer' in config).toBe(true)
    expect('portalContainer' in document.createElement('xh-navigation-menu')).toBe(false)
  })
})

describe('wC Portal 实例目标优先级', () => {
  it('实例目标覆盖最近 xh-config，未设置的同类实例使用 xh-config', async () => {
    const configured = document.createElement('div')
    const instance = document.createElement('div')
    const config = document.createElement('xh-config') as ConfigHost
    config.portalContainer = () => configured
    config.innerHTML = `<xh-select open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list"></div></div></div></xh-select>
      <xh-select open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list"></div></div></div></xh-select>`
    const [explicit, inherited] = [...config.querySelectorAll<PortalHost>('xh-select')]
    const explicitPositioner = explicit!.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const inheritedPositioner = inherited!.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    explicit!.portalContainer = () => instance
    document.body.append(configured, instance, config)

    await settle()
    expect(targetOf(explicitPositioner)).toBe(instance)
    expect(targetOf(inheritedPositioner)).toBe(configured)
  })
})

describe('wC 多根与多实例 Portal', () => {
  it('dialog 双根与 Tour 三根分别原子搬到实例目标', async () => {
    const target = document.createElement('div')
    const stage = document.createElement('section')
    stage.innerHTML = `<button id="tour-instance-target"></button>
      <xh-dialog open><div data-xh-part="backdrop"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></xh-dialog>
      <xh-tour open><div data-xh-part="root"><div data-xh-part="backdrop"></div><div data-xh-part="spotlight"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-tour>`
    const dialog = stage.querySelector<PortalHost>('xh-dialog')!
    const tour = stage.querySelector<XhTourElement>('xh-tour')!
    dialog.portalContainer = () => target
    tour.portalContainer = () => target
    tour.steps = [{ id: 'one', target: '#tour-instance-target', title: '第一步' }]
    const dialogRoots = ['backdrop', 'positioner'].map(part => dialog.querySelector<HTMLElement>(`[data-xh-part="${part}"]`)!)
    const tourRoots = ['backdrop', 'spotlight', 'positioner'].map(part => tour.querySelector<HTMLElement>(`[data-xh-part="${part}"]`)!)
    document.body.append(target, stage)

    await settle()
    expect(dialogRoots.every(root => targetOf(root) === target)).toBe(true)
    expect(tourRoots.every(root => targetOf(root) === target)).toBe(true)
    expect(new Set(dialogRoots.map(root => root.parentElement)).size).toBe(1)
    expect(new Set(tourRoots.map(root => root.parentElement)).size).toBe(1)
  })

  it('menu 根层与子层可各自使用实例目标', async () => {
    const rootTarget = document.createElement('div')
    const subTarget = document.createElement('div')
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-menu><button data-xh-part="trigger">文件</button><div data-xh-part="positioner"><div data-xh-part="content">
      <xh-menu submenu><div data-xh-part="trigger" value="share">发送到</div><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="mail">邮件</div></div></div></xh-menu>
    </div></div></xh-menu>`
    const [root, sub] = [...stage.querySelectorAll<PortalHost>('xh-menu')]
    const rootPositioner = root!.querySelector<HTMLElement>(':scope > [data-xh-part="positioner"]')!
    const subTrigger = sub!.querySelector<HTMLElement>('[data-xh-part="trigger"]')!
    const subPositioner = sub!.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    root!.portalContainer = () => rootTarget
    sub!.portalContainer = () => subTarget
    document.body.append(rootTarget, subTarget, stage)
    await settle()

    root!.querySelector<HTMLElement>(':scope > [data-xh-part="trigger"]')!.click()
    await settle()
    subTrigger.click()
    await settle()
    expect(targetOf(rootPositioner)).toBe(rootTarget)
    expect(targetOf(subPositioner)).toBe(subTarget)
  })

  it('pagination 两个 Portal 与 SideNav 多个分支共用各自宿主实例目标', async () => {
    const paginationTarget = document.createElement('div')
    const sideNavTarget = document.createElement('div')
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-pagination count="2000" default-page="100"><nav data-xh-part="root">
      <div data-xh-part="page-size-select"></div><button data-xh-part="item" value="100">100</button><button data-xh-part="ellipsis-trigger" side="start">更多</button>
      <div data-xh-part="positioner"><div data-xh-part="content"></div></div></nav></xh-pagination>
      <xh-side-nav collapsed><nav data-xh-part="root"><ul data-xh-part="list">
        <li data-xh-part="branch" value="products"><button data-xh-part="branch-trigger">产品</button><div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="a">甲</a></li></ul></div></li>
        <li data-xh-part="branch" value="settings"><button data-xh-part="branch-trigger">设置</button><div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="b">乙</a></li></ul></div></li>
      </ul></nav></xh-side-nav>`
    const pagination = stage.querySelector<PortalHost>('xh-pagination')!
    const sideNav = stage.querySelector<SideNavHost>('xh-side-nav')!
    pagination.portalContainer = () => paginationTarget
    sideNav.portalContainer = () => sideNavTarget
    sideNav.collection = [
      { value: 'products', children: [{ value: 'a' }] },
      { value: 'settings', children: [{ value: 'b' }] },
    ]
    const ellipsis = pagination.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const sideNavPositioners = [...sideNav.querySelectorAll<HTMLElement>('[data-xh-part="positioner"]')]
    const sideNavTriggers = [...sideNav.querySelectorAll<HTMLElement>('[data-xh-part="branch-trigger"]')]
    document.body.append(paginationTarget, sideNavTarget, stage)
    await settle()

    pagination.querySelector<HTMLElement>('[data-xh-part="ellipsis-trigger"]')!.click()
    await settle()
    expect(targetOf(ellipsis)).toBe(paginationTarget)
    pagination.querySelector<HTMLElement>('[data-xh-part="ellipsis-trigger"]')!.click()
    await settle()

    const pageSizeTrigger = pagination.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!
    const pageSizePositioner = pagination.querySelector<HTMLElement>('[data-scope="select"][data-part="positioner"]')!
    pageSizeTrigger.click()
    await settle()
    expect(targetOf(pageSizePositioner)).toBe(paginationTarget)

    sideNavTriggers[0]!.click()
    await settle()
    expect(targetOf(sideNavPositioners[0]!)).toBe(sideNavTarget)
    sideNavTriggers[1]!.click()
    await settle()
    expect(targetOf(sideNavPositioners[1]!)).toBe(sideNavTarget)
  })
})
