// @vitest-environment jsdom
import type { NavigationMenuNode, NavigationMenuSchema, NavigationMenuValueChangeDetails } from '../src/navigation-menu'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectNavigationMenu, navigationMenuMachine } from '../src/navigation-menu'

type Props = NavigationMenuSchema['props']

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/** 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (key === 'style' || raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, raw === true ? '' : String(raw))
  }
}

/** 面板的内容：直达链接，或一枝子级（开关 + 箭头 + 子级里的链接）。 */
type Entry = { link: string } | { branch: string, links: string[] }

const PANELS: Record<string, Entry[]> = {
  products: [
    { link: 'overview' },
    { branch: 'frameworks', links: ['vue', 'react'] },
    { branch: 'tools', links: ['cli'] },
  ],
  docs: [{ link: 'guide' }],
}

interface BranchMenuOptions {
  props?: Props
  /** 指向当前页面的那条链接。 */
  current?: string
  /** 部件上写死禁用的那一枝。 */
  disabledBranch?: string
  /** 装上消解层（与适配器同法），Escape 走层栈仲裁；缺省只剩根上的兜底。 */
  layer?: boolean
}

/**
 * 一整套活 DOM：nav > ul > li*2 >（button + div[面板]）；产品面板里一条链接、两枝子级，
 * 子级容器紧跟在自己的开关之后——Tab 走得进去靠的正是这个位置关系。
 */
function makeBranchMenu(options: BranchMenuOptions = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(options.props ?? {})
  const service = createService(navigationMenuMachine, { props: () => props.get(), runtime })

  const root = document.createElement('nav')
  const list = document.createElement('ul')
  const triggers = new Map<string, HTMLButtonElement>()
  const contents = new Map<string, HTMLElement>()
  const branchTriggers = new Map<string, HTMLButtonElement>()
  const branchIndicators = new Map<string, HTMLElement>()
  const branchContents = new Map<string, HTMLElement>()
  const links = new Map<string, HTMLAnchorElement>()
  const makeLink = (name: string): HTMLAnchorElement => {
    const link = document.createElement('a')
    link.href = `/${name}`
    link.textContent = name
    links.set(name, link)
    return link
  }
  for (const [value, entries] of Object.entries(PANELS)) {
    const item = document.createElement('li')
    const trigger = document.createElement('button')
    trigger.textContent = value
    const content = document.createElement('div')
    for (const entry of entries) {
      if ('link' in entry) {
        content.appendChild(makeLink(entry.link))
        continue
      }
      const branchTrigger = document.createElement('button')
      branchTrigger.textContent = entry.branch
      const indicator = document.createElement('span')
      branchTrigger.appendChild(indicator)
      const branchContent = document.createElement('div')
      for (const name of entry.links)
        branchContent.appendChild(makeLink(name))
      content.append(branchTrigger, branchContent)
      branchTriggers.set(entry.branch, branchTrigger)
      branchIndicators.set(entry.branch, indicator)
      branchContents.set(entry.branch, branchContent)
    }
    item.append(trigger, content)
    list.appendChild(item)
    triggers.set(value, trigger)
    contents.set(value, content)
  }
  root.appendChild(list)
  const outside = document.createElement('button')
  document.body.append(root, outside)

  service.refs.set('getListEl', () => list)
  if (options.layer) {
    const config = createRuntimeConfig()
    service.refs.set('config', config)
    service.refs.set('registerLayer', () => config.layerRegistry.register({
      kind: 'inline',
      node: () => root,
      branches: () => [],
      isModal: () => false,
      surfaces: () => [],
    }))
  }

  const events: NavigationMenuValueChangeDetails[] = []
  props.set({ ...props.get(), onValueChange: details => events.push(details) })

  runtime.start()

  const wire = (): void => {
    const api = connectNavigationMenu(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(list, api.getListProps() as Record<string, unknown>)
    for (const [value, el] of triggers)
      spread(el, api.getTriggerProps({ value }) as Record<string, unknown>)
    for (const [value, el] of contents)
      spread(el, api.getContentProps({ value }) as Record<string, unknown>)
    for (const [value, el] of branchTriggers)
      spread(el, api.getBranchTriggerProps({ value, disabled: value === options.disabledBranch || undefined }) as Record<string, unknown>)
    for (const [value, el] of branchIndicators)
      spread(el, api.getBranchIndicatorProps({ value }) as Record<string, unknown>)
    for (const [value, el] of branchContents)
      spread(el, api.getBranchContentProps({ value }) as Record<string, unknown>)
    for (const [name, el] of links)
      spread(el, api.getLinkProps({ value: `link-${name}`, current: name === options.current }) as Record<string, unknown>)
  }
  // 每次状态变化都重新接线，与适配器同构（属性与处理器都跟着最新状态走）
  runtime.subscribe(wire)
  wire()

  return {
    service,
    root,
    triggers,
    contents,
    branchTriggers,
    branchIndicators,
    branchContents,
    links,
    events,
    value: () => service.context.get('value') ?? null,
    branch: () => service.context.get('branchValue') ?? null,
    api: () => connectNavigationMenu(service, normalizeProps),
    click: (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })),
    press: (el: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
      el.dispatchEvent(event)
      return event
    },
    keyUp: (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true })),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => {
      runtime.stop()
      root.remove()
      outside.remove()
    },
  }
}

/** 等 flush 排进微任务的那一遍落定。 */
const settle = (): Promise<void> => Promise.resolve()

afterEach(() => {
  document.body.innerHTML = ''
})

describe('navigationMenu 面板里的子级：连接层输出', () => {
  it('开关是原生按钮，aria-expanded / aria-controls 指向紧跟其后的子级容器；收着时容器 hidden', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    const trigger = c.branchTriggers.get('frameworks')!
    const content = c.branchContents.get('frameworks')!
    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.getAttribute('data-scope')).toBe('navigation-menu')
    expect(trigger.getAttribute('data-part')).toBe('branch-trigger')
    expect(trigger.getAttribute('data-value')).toBe('frameworks')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-disabled')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-controls')).toBe(content.id)
    expect(content.id).not.toBe('')
    expect(content.getAttribute('data-part')).toBe('branch-content')
    expect(content.getAttribute('role')).toBe('group')
    expect(content.getAttribute('aria-labelledby')).toBe(trigger.id)
    expect(content.hasAttribute('hidden')).toBe(true)
    expect(trigger.nextElementSibling).toBe(content)
    // 两枝的开关与容器各有各的 id，不因同在一张面板里撞车
    expect(c.branchContents.get('tools')!.id).not.toBe(content.id)
    expect(c.branchTriggers.get('tools')!.id).not.toBe(trigger.id)
    c.stop()
  })

  it('开关与面板里的链接同一种行：Collection Item 的 nav 语境与尺寸档；箭头对读屏隐藏、随开合换 data-state', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products', size: 'lg' } })
    const trigger = c.branchTriggers.get('frameworks')!
    expect(trigger.getAttribute('data-xh-collection-item')).toBe('')
    expect(trigger.getAttribute('data-xh-collection-context')).toBe('nav')
    expect(trigger.getAttribute('data-xh-collection-size')).toBe('lg')
    // 展开不是打开中：不投影 data-in-path，箭头与下面展开的子级说明它
    expect(trigger.hasAttribute('data-in-path')).toBe(false)
    const indicator = c.branchIndicators.get('frameworks')!
    expect(indicator.getAttribute('data-part')).toBe('branch-indicator')
    expect((c.api().getBranchIndicatorProps({ value: 'frameworks' }) as Record<string, unknown>)['aria-hidden']).toBe(true)
    expect(indicator.getAttribute('data-state')).toBe('closed')
    c.click(trigger)
    expect(indicator.getAttribute('data-state')).toBe('open')
    expect(trigger.hasAttribute('data-in-path')).toBe(false)
    c.stop()
  })
})

describe('navigationMenu 面板里的子级：开合', () => {
  it('点开关展开这一枝，再点收起；面板始终开着，不发 value-change', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    const trigger = c.branchTriggers.get('frameworks')!
    const content = c.branchContents.get('frameworks')!
    c.click(trigger)
    expect(c.branch()).toBe('frameworks')
    expect(c.api().isBranchOpen('frameworks')).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(content.hasAttribute('hidden')).toBe(false)
    expect(content.getAttribute('data-state')).toBe('open')
    c.click(trigger)
    expect(c.branch()).toBeNull()
    expect(content.hasAttribute('hidden')).toBe(true)
    expect(c.value()).toBe('products')
    expect(c.events).toEqual([])
    c.stop()
  })

  it('同一张面板只展开一枝：展开另一枝时这一枝收起', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    c.click(c.branchTriggers.get('frameworks')!)
    c.click(c.branchTriggers.get('tools')!)
    expect(c.branch()).toBe('tools')
    expect(c.branchContents.get('frameworks')!.hasAttribute('hidden')).toBe(true)
    expect(c.branchContents.get('tools')!.hasAttribute('hidden')).toBe(false)
    expect(c.branchTriggers.get('frameworks')!.getAttribute('aria-expanded')).toBe('false')
    c.stop()
  })

  it('enter / Space 开合并吞掉按钮的默认激活；按住连发的 keydown 不来回翻转', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    const trigger = c.branchTriggers.get('frameworks')!
    trigger.focus()
    const enter = c.press(trigger, 'Enter')
    expect(enter.defaultPrevented).toBe(true)
    expect(c.branch()).toBe('frameworks')
    // 焦点留在开关上
    expect(document.activeElement).toBe(trigger)
    c.press(trigger, 'Enter', { repeat: true })
    expect(c.branch()).toBe('frameworks')
    c.keyUp(trigger, 'Enter')
    const space = c.press(trigger, ' ')
    expect(space.defaultPrevented).toBe(true)
    expect(c.branch()).toBeNull()
    c.stop()
  })

  it('禁用的开关点不开、按键也不开：部件上写的禁用与数据里的禁用都认，整套导航禁用一票通过', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' }, disabledBranch: 'frameworks' })
    const trigger = c.branchTriggers.get('frameworks')!
    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.hasAttribute('data-disabled')).toBe(true)
    // 用 aria-disabled 而非原生 disabled：仍可聚焦、仍念得出来
    expect(trigger.hasAttribute('disabled')).toBe(false)
    c.click(trigger)
    c.press(trigger, 'Enter')
    expect(c.branch()).toBeNull()
    c.stop()

    const collection: NavigationMenuNode[] = [{
      value: 'products',
      children: [
        { value: 'frameworks', disabled: true, children: [{ value: 'vue', href: '/vue' }] },
        { value: 'tools', children: [{ value: 'cli', href: '/cli' }] },
      ],
    }]
    const d = makeBranchMenu({ props: { defaultValue: 'products', collection } })
    expect(d.branchTriggers.get('frameworks')!.getAttribute('aria-disabled')).toBe('true')
    expect(d.branchTriggers.get('tools')!.getAttribute('aria-disabled')).toBe('false')
    d.click(d.branchTriggers.get('frameworks')!)
    expect(d.branch()).toBeNull()
    d.setProps({ disabled: true })
    expect(d.branchTriggers.get('tools')!.getAttribute('aria-disabled')).toBe('true')
    d.click(d.branchTriggers.get('tools')!)
    expect(d.branch()).toBeNull()
    d.stop()
  })

  it('收起一枝时焦点若还在它的子级里（点按钮不给焦点的浏览器），交给这次点到的开关，不掉出面板', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    c.click(c.branchTriggers.get('frameworks')!)
    c.links.get('vue')!.focus()
    // 焦点不随点击移动：直接派 click，模拟 Safari 点按钮不给焦点
    c.click(c.branchTriggers.get('tools')!)
    expect(document.activeElement).toBe(c.branchTriggers.get('tools'))
    expect(c.value()).toBe('products')
    c.stop()
  })
})

describe('navigationMenu 面板里的子级：Escape', () => {
  for (const layer of [false, true]) {
    const via = layer ? '消解层' : '根上的兜底'
    it(`焦点在子级里：先只收这一枝、焦点还给它的开关；再按一次才收起面板、焦点还给入口（${via}）`, async () => {
      const c = makeBranchMenu({ props: { defaultValue: 'products' }, layer })
      // 层入栈后隔一个微任务才接 Escape
      await settle()
      c.click(c.branchTriggers.get('frameworks')!)
      const link = c.links.get('react')!
      link.focus()
      c.press(link, 'Escape')
      expect(c.branch()).toBeNull()
      expect(c.value()).toBe('products')
      expect(document.activeElement).toBe(c.branchTriggers.get('frameworks'))
      expect(c.branchContents.get('frameworks')!.hasAttribute('hidden')).toBe(true)
      c.press(c.branchTriggers.get('frameworks')!, 'Escape')
      expect(c.value()).toBeNull()
      expect(document.activeElement).toBe(c.triggers.get('products'))
      expect(c.events).toEqual([{ value: null }])
      c.stop()
    })

    it(`焦点在展开着的开关上（不在子级里）：Escape 收起整张面板（${via}）`, async () => {
      const c = makeBranchMenu({ props: { defaultValue: 'products' }, layer })
      await settle()
      const trigger = c.branchTriggers.get('frameworks')!
      c.click(trigger)
      trigger.focus()
      c.press(trigger, 'Escape')
      expect(c.value()).toBeNull()
      expect(document.activeElement).toBe(c.triggers.get('products'))
      c.stop()
    })
  }
})

describe('navigationMenu 面板里的子级：当前页', () => {
  it('挂载即展开的面板：当前页链接所在的那一枝直接展开', async () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' }, current: 'react' })
    await settle()
    expect(c.branch()).toBe('frameworks')
    expect(c.branchContents.get('frameworks')!.hasAttribute('hidden')).toBe(false)
    expect(c.links.get('react')!.getAttribute('aria-current')).toBe('page')
    c.stop()
  })

  it('展开面板时按当前页重新落定：当前页在子级里就展开那一枝，不在就都收着；用户的开合不跨一次展开保留', () => {
    const c = makeBranchMenu({ current: 'cli' })
    c.click(c.triggers.get('products')!)
    expect(c.branch()).toBe('tools')
    c.click(c.branchTriggers.get('frameworks')!)
    expect(c.branch()).toBe('frameworks')
    // 换到另一张：那张里没有子级，没有展开的
    c.click(c.triggers.get('docs')!)
    expect(c.value()).toBe('docs')
    expect(c.branch()).toBeNull()
    // 再回到这一张：重新按当前页落定
    c.click(c.triggers.get('products')!)
    expect(c.branch()).toBe('tools')
    c.stop()
  })

  it('当前页是面板里的直达链接、或所在那一枝禁用时：都收着', () => {
    const c = makeBranchMenu({ current: 'overview' })
    c.click(c.triggers.get('products')!)
    expect(c.branch()).toBeNull()
    c.stop()
    const d = makeBranchMenu({ current: 'vue', disabledBranch: 'frameworks' })
    d.click(d.triggers.get('products')!)
    expect(d.branch()).toBeNull()
    d.stop()
  })

  it('面板收起时不动子级：退场途中的面板不先塌下去一截', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    c.click(c.branchTriggers.get('tools')!)
    c.click(c.triggers.get('products')!)
    expect(c.value()).toBeNull()
    expect(c.branch()).toBe('tools')
    expect(c.branchContents.get('tools')!.hasAttribute('hidden')).toBe(false)
    c.stop()
  })
})

describe('navigationMenu 面板里的子级：按压通道', () => {
  const pressed = (el: HTMLElement): boolean => el.hasAttribute('data-pressed')

  it('开关按住投影 data-pressed、抬起撤下，与同名的入口分开认；面板收起时由机器撤下', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' } })
    const trigger = c.branchTriggers.get('frameworks')!
    c.press(trigger, ' ')
    expect(pressed(trigger)).toBe(true)
    expect(pressed(c.triggers.get('products')!)).toBe(false)
    c.keyUp(trigger, ' ')
    expect(pressed(trigger)).toBe(false)
    c.press(trigger, ' ')
    expect(pressed(trigger)).toBe(true)
    // 按住途中面板被收起：开关藏进 inert 的面板里不会再来 keyup
    c.api().setValue(null)
    expect(pressed(trigger)).toBe(false)
    c.stop()
  })

  it('禁用的开关不进按压面', () => {
    const c = makeBranchMenu({ props: { defaultValue: 'products' }, disabledBranch: 'tools' })
    const trigger = c.branchTriggers.get('tools')!
    c.press(trigger, ' ')
    expect(pressed(trigger)).toBe(false)
    c.stop()
  })
})

describe('navigationMenu 的 collection 子级', () => {
  const connect = (collection: NavigationMenuNode[]) => {
    const runtime = createVanillaRuntime()
    const service = createService(navigationMenuMachine, { props: () => ({ collection }), runtime })
    return () => connectNavigationMenu(service, normalizeProps)
  }

  it('逐层推出元信息：面板条目与子级条目各带自己的 children', () => {
    const api = connect([
      { value: 'products', label: '产品', children: [
        { value: 'overview', label: '概览', href: '/products' },
        { value: 'frameworks', label: '框架', children: [{ value: 'vue', href: '/vue', current: true }] },
      ] },
      { value: 'changelog', href: '/changelog' },
    ])()
    expect(api.collection).toEqual([
      {
        value: 'products',
        label: '产品',
        disabled: false,
        href: undefined,
        current: false,
        children: [
          { value: 'overview', label: '概览', disabled: false, href: '/products', current: false, children: [] },
          {
            value: 'frameworks',
            label: '框架',
            disabled: false,
            href: undefined,
            current: false,
            children: [{ value: 'vue', label: 'vue', disabled: false, href: '/vue', current: true, children: [] }],
          },
        ],
      },
      { value: 'changelog', label: 'changelog', disabled: false, href: '/changelog', current: false, children: [] },
    ])
  })

  it('不合法的嵌套当场报错，不静默修正', () => {
    expect(() => connect([{ value: 'a', children: [{ value: 'b', href: '/b' }] }, { value: 'b', href: '/x' }])())
      .toThrow(/value "b" 重复/)
    expect(() => connect([{ value: 'a', href: '/a', children: [{ value: 'b', href: '/b' }] }])())
      .toThrow(/同时给了 href 与 children/)
    expect(() => connect([{ value: 'a', children: [{ value: 'b' }] }])())
      .toThrow(/既没有 href 也没有 children/)
    expect(() => connect([{ value: 'a', children: [{ value: 'b', children: [{ value: 'c', children: [{ value: 'd', href: '/d' }] }] }] }])())
      .toThrow(/子级条目 "c" 没有 href/)
  })
})
