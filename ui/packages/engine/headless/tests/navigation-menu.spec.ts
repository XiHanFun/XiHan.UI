// @vitest-environment jsdom
import type { NavigationMenuSchema, NavigationMenuValueChangeDetails } from '../src/navigation-menu'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectNavigationMenu, navigationMenuMachine } from '../src/navigation-menu'

type Props = NavigationMenuSchema['props']

const VALUES = ['products', 'docs', 'company'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯比对 connect 的返回值只能验静态属性，
 * 「延时展开」「Escape 后焦点归还不会把面板重新弹出来」这类事实必须有活 DOM 才立得住。
 */
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

/** 给节点钉一个假的盒子：jsdom 不排版，所有 rect 恒为 0。 */
function stubRect(el: HTMLElement, box: { top: number, left?: number, width?: number, height?: number }): void {
  const { top, left = 0, width = 0, height = 0 } = box
  el.getBoundingClientRect = () => ({
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect
}

/**
 * 一整套活 DOM：nav > ul > li*3 >（button + div[面板] > a）。
 * 面板就住在 trigger 隔壁的同一个 li 里——Tab 走得进去靠的正是这个位置关系。
 */
function makeMenu(initial: Props = {}, disabled?: string) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(navigationMenuMachine, { props: () => props.get(), runtime })

  const root = document.createElement('nav')
  const list = document.createElement('ul')
  const triggers: HTMLButtonElement[] = []
  const contents: HTMLElement[] = []
  const links: HTMLAnchorElement[] = []
  for (const value of VALUES) {
    const item = document.createElement('li')
    const trigger = document.createElement('button')
    trigger.textContent = value
    const content = document.createElement('div')
    const link = document.createElement('a')
    link.href = `/${value}`
    content.appendChild(link)
    item.append(trigger, content)
    list.appendChild(item)
    triggers.push(trigger)
    contents.push(content)
    links.push(link)
  }
  const indicator = document.createElement('li')
  list.appendChild(indicator)
  root.appendChild(list)
  const outside = document.createElement('button')
  document.body.append(root, outside)

  service.refs.set('getListEl', () => list)

  runtime.start()

  const wire = (): void => {
    const api = connectNavigationMenu(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(list, api.getListProps() as Record<string, unknown>)
    spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    triggers.forEach((el, i) => {
      spread(el, api.getTriggerProps({ value: VALUES[i]!, disabled: VALUES[i] === disabled }) as Record<string, unknown>)
    })
    contents.forEach((el, i) => {
      spread(el, api.getContentProps({ value: VALUES[i]! }) as Record<string, unknown>)
    })
    for (const el of links)
      spread(el, api.getLinkProps({}) as Record<string, unknown>)
  }
  // 每次状态变化都重新接线，与适配器同构（属性与处理器都跟着最新状态走）
  runtime.subscribe(wire)
  wire()

  return {
    service,
    root,
    list,
    triggers,
    contents,
    links,
    indicator,
    outside,
    state: () => service.state.get(),
    value: () => service.context.get('value') ?? null,
    api: () => connectNavigationMenu(service, normalizeProps),
    hover: (index: number) => triggers[index]!.dispatchEvent(new Event('pointerenter')),
    leave: () => root.dispatchEvent(new Event('pointerleave')),
    press: (el: HTMLElement, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event
    },
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => {
      runtime.stop()
      root.remove()
      outside.remove()
    },
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('navigationMenu 悬停延时', () => {
  it('悬停 trigger 要等满 delayDuration 才展开；缺省 200ms', () => {
    const c = makeMenu()
    c.hover(0)
    expect(c.state()).toBe('opening')
    expect(c.value()).toBeNull()
    vi.advanceTimersByTime(199)
    expect(c.value()).toBeNull()
    vi.advanceTimersByTime(1)
    expect(c.value()).toBe('products')
    expect(c.state()).toBe('idle')
  })

  // 横穿导航栏是一次连续的动作：每划过一个 trigger 就把秒表归零的话，
  // 慢慢划过去会一个面板都等不出来。
  it('等待期内划到隔壁 trigger：不重新计时，到点展开的是后来那一个', () => {
    const c = makeMenu()
    c.hover(0)
    vi.advanceTimersByTime(120)
    c.hover(1)
    expect(c.value()).toBeNull()
    // 从第一次悬停算起满 200ms 就该展开（重新计时的话这会儿还差 120ms）
    vi.advanceTimersByTime(80)
    expect(c.value()).toBe('docs')
  })

  it('等待期内指针离开整个导航：撤销等待，对外从未展开过（不发通知）', () => {
    const seen: NavigationMenuValueChangeDetails[] = []
    const c = makeMenu({ onValueChange: d => seen.push(d) })
    c.hover(0)
    c.leave()
    expect(c.state()).toBe('idle')
    vi.advanceTimersByTime(500)
    expect(c.value()).toBeNull()
    expect(seen).toEqual([])
  })

  it('已经展开着再悬停别处：当场换一项，不再等延时', () => {
    const c = makeMenu({ defaultValue: 'products' })
    c.hover(2)
    expect(c.value()).toBe('company')
    expect(c.state()).toBe('idle')
  })

  it('聚焦 trigger 与悬停同一条路：同样走延时', () => {
    const c = makeMenu({ delayDuration: 50 })
    c.triggers[1]!.focus()
    expect(c.state()).toBe('opening')
    vi.advanceTimersByTime(50)
    expect(c.value()).toBe('docs')
  })
})

describe('navigationMenu 静默窗口', () => {
  it('收起后的窗口内再碰任意 trigger：直接展开，不再等延时', () => {
    const c = makeMenu({ defaultValue: 'products' })
    c.leave()
    expect(c.state()).toBe('skipping')
    expect(c.value()).toBeNull()

    vi.advanceTimersByTime(200)
    c.hover(1)
    // 窗口内是"直接"，不是"再等 200ms"
    expect(c.value()).toBe('docs')
    expect(c.state()).toBe('idle')
  })

  it('窗口过期之后回到常规延时', () => {
    const c = makeMenu({ defaultValue: 'products' })
    c.leave()
    vi.advanceTimersByTime(300)
    expect(c.state()).toBe('idle')

    c.hover(1)
    expect(c.value()).toBeNull()
    vi.advanceTimersByTime(199)
    expect(c.value()).toBeNull()
    vi.advanceTimersByTime(1)
    expect(c.value()).toBe('docs')
  })

  it('skipDelayDuration 可调', () => {
    const c = makeMenu({ defaultValue: 'products', skipDelayDuration: 1000 })
    c.leave()
    vi.advanceTimersByTime(900)
    c.hover(1)
    expect(c.value()).toBe('docs')
  })
})

describe('navigationMenu 显式激活', () => {
  it('点未展开的 trigger 立即展开，不走延时', () => {
    const c = makeMenu()
    c.triggers[1]!.click()
    expect(c.value()).toBe('docs')
    expect(c.state()).toBe('idle')
  })

  it('enter 立即展开，并吞掉默认激活（否则合成的 click 会把它当场关掉）', () => {
    const c = makeMenu()
    const event = c.press(c.triggers[0]!, 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(c.value()).toBe('products')
  })

  it('space 同理', () => {
    const c = makeMenu()
    const event = c.press(c.triggers[0]!, ' ')
    expect(event.defaultPrevented).toBe(true)
    expect(c.value()).toBe('products')
  })

  // 悬停弹出来之后顺手点一下（键盘上是 Tab 聚焦弹出后按 Enter），
  // 用户的意思是"我要用它"，当场收起就是把他刚够到的东西抽走。
  it('自动弹出来的那一项被点到：留着；再点一次才收起', () => {
    const c = makeMenu({ delayDuration: 10 })
    c.hover(0)
    vi.advanceTimersByTime(10)
    expect(c.value()).toBe('products')

    c.triggers[0]!.click()
    expect(c.value()).toBe('products')

    c.triggers[0]!.click()
    expect(c.value()).toBeNull()
    expect(c.state()).toBe('skipping')
  })

  it('点开的那一项再点一次就收起（没有"自动"这层豁免）', () => {
    const c = makeMenu()
    c.triggers[0]!.click()
    c.triggers[0]!.click()
    expect(c.value()).toBeNull()
    expect(c.state()).toBe('skipping')
  })

  it('等待期内直接点：立即展开，不必等完剩下的延时', () => {
    const c = makeMenu()
    c.hover(0)
    vi.advanceTimersByTime(50)
    c.triggers[0]!.click()
    expect(c.value()).toBe('products')
    expect(c.state()).toBe('idle')
  })
})

describe('navigationMenu 收起', () => {
  it('指针离开整个导航就收起；trigger 与面板之间穿行不算离开', () => {
    const c = makeMenu({ defaultValue: 'products' })
    // 指针从 trigger 划进面板：两者同在 root 内，根本不会派 pointerleave
    c.contents[0]!.dispatchEvent(new Event('pointerenter'))
    expect(c.value()).toBe('products')
    c.leave()
    expect(c.value()).toBeNull()
  })

  it('焦点还停在导航里时，鼠标扫出去不收起（那归 focusout 管）', () => {
    const c = makeMenu({ defaultValue: 'products' })
    c.links[0]!.focus()
    c.leave()
    expect(c.value()).toBe('products')
  })

  it('焦点真的离开整套导航才收起；面板内部换落点不算', () => {
    const second = document.createElement('a')
    second.href = '/more'
    const c = makeMenu({ defaultValue: 'products' })
    c.contents[0]!.appendChild(second)

    c.links[0]!.focus()
    second.focus()
    expect(c.value()).toBe('products')

    c.outside.focus()
    expect(c.value()).toBeNull()
  })

  it('面板里的链接被点：收起导航，但不拦跳转', () => {
    const c = makeMenu({ defaultValue: 'products' })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    c.links[0]!.dispatchEvent(event)
    expect(c.value()).toBeNull()
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('navigationMenu Escape', () => {
  it('收起并把焦点归还对应 trigger', () => {
    const c = makeMenu({ defaultValue: 'products' })
    c.links[0]!.focus()
    c.press(c.links[0]!, 'Escape')
    expect(c.value()).toBeNull()
    expect(document.activeElement).toBe(c.triggers[0])
  })

  // 光看终态测不出东西：静默窗口若认了这次聚焦，面板会被当场重新弹出来，
  // 用户按 Escape 等于什么都没发生。
  it('归还焦点不会把刚收起的面板重新弹出来', () => {
    const c = makeMenu({ defaultValue: 'products' })
    c.links[0]!.focus()
    c.press(c.links[0]!, 'Escape')
    expect(c.value()).toBeNull()
    // 静默窗口整段走完，中途不许有人偷偷把它打开
    vi.advanceTimersByTime(300)
    expect(c.value()).toBeNull()
    expect(c.state()).toBe('idle')
  })

  it('都收起时 Escape 不拦事件：放行给外层（对话框、抽屉）', () => {
    const c = makeMenu()
    const seen: string[] = []
    document.body.addEventListener('keydown', () => seen.push('body'), { once: true })
    c.press(c.triggers[0]!, 'Escape')
    expect(seen).toEqual(['body'])
  })
})

describe('navigationMenu 键盘导航', () => {
  it('横排：ArrowRight/ArrowLeft 在 trigger 之间走，尽头回绕', () => {
    const c = makeMenu()
    c.triggers[0]!.focus()
    c.press(c.triggers[0]!, 'ArrowRight')
    expect(document.activeElement).toBe(c.triggers[1])
    c.press(c.triggers[1]!, 'ArrowLeft')
    expect(document.activeElement).toBe(c.triggers[0])
    c.press(c.triggers[0]!, 'ArrowLeft')
    expect(document.activeElement).toBe(c.triggers[2])
  })

  it('home/End 跳到首尾 trigger', () => {
    const c = makeMenu()
    c.triggers[1]!.focus()
    c.press(c.triggers[1]!, 'End')
    expect(document.activeElement).toBe(c.triggers[2])
    c.press(c.triggers[2]!, 'Home')
    expect(document.activeElement).toBe(c.triggers[0])
  })

  it('横排里的上下键不归导航管：不拦事件，焦点也不动', () => {
    const c = makeMenu()
    c.triggers[0]!.focus()
    const event = c.press(c.triggers[0]!, 'ArrowDown')
    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(c.triggers[0])
  })

  it('orientation=vertical：换成上下键走，左右键让开', () => {
    const c = makeMenu({ orientation: 'vertical' })
    c.triggers[0]!.focus()
    c.press(c.triggers[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(c.triggers[1])
    c.press(c.triggers[1]!, 'ArrowRight')
    expect(document.activeElement).toBe(c.triggers[1])
  })

  it('dir=rtl：水平轴镜像，ArrowRight 走上一个', () => {
    const c = makeMenu({ dir: 'rtl' })
    c.triggers[1]!.focus()
    c.press(c.triggers[1]!, 'ArrowRight')
    expect(document.activeElement).toBe(c.triggers[0])
  })

  it('loop=false：走到尽头就停住', () => {
    const c = makeMenu({ loop: false })
    c.triggers[0]!.focus()
    c.press(c.triggers[0]!, 'ArrowLeft')
    expect(document.activeElement).toBe(c.triggers[0])
  })
})

describe('navigationMenu 禁用条目', () => {
  it('用 aria-disabled 而非原生 disabled：仍可聚焦，方向键把它跳过去', () => {
    const c = makeMenu({}, 'docs')
    const trigger = c.api().getTriggerProps({ value: 'docs', disabled: true }) as Record<string, unknown>
    expect(trigger['aria-disabled']).toBe('true')
    expect(trigger.disabled).toBeUndefined()
    expect(trigger['data-disabled']).toBe('')

    c.triggers[0]!.focus()
    c.press(c.triggers[0]!, 'ArrowRight')
    expect(document.activeElement).toBe(c.triggers[2])
  })

  it('禁用的那一项悬停与点击都不展开', () => {
    const c = makeMenu({ delayDuration: 10 }, 'docs')
    c.hover(1)
    vi.advanceTimersByTime(50)
    expect(c.value()).toBeNull()
    c.triggers[1]!.click()
    expect(c.value()).toBeNull()
  })
})

describe('connectNavigationMenu 输出', () => {
  it('收起态：面板常挂带 hidden，trigger 的 aria 显式为 false', () => {
    const c = makeMenu()
    const api = c.api()
    const trigger = api.getTriggerProps({ value: 'docs' }) as Record<string, unknown>
    const content = api.getContentProps({ value: 'docs' }) as Record<string, unknown>

    expect(trigger['data-scope']).toBe('navigation-menu')
    expect(trigger.type).toBe('button')
    expect(trigger['aria-expanded']).toBe('false')
    expect(trigger['aria-controls']).toBe(content.id)
    expect(trigger['aria-disabled']).toBe('false')
    expect(trigger['data-state']).toBe('closed')
    // 不做 roving tabindex：每个 trigger 都留在 Tab 序列里，面板才 Tab 得进去
    expect(trigger.tabindex).toBeUndefined()

    expect(content.role).toBe('group')
    expect(content['aria-labelledby']).toBe(trigger.id)
    expect(content.hidden).toBe(true)
    expect(content['data-state']).toBe('closed')
  })

  it('展开态：对应面板去掉 hidden，其余仍收着', () => {
    const c = makeMenu({ defaultValue: 'docs' })
    const api = c.api()
    expect(api.open).toBe(true)
    expect(api.isOpen('docs')).toBe(true)
    expect((api.getTriggerProps({ value: 'docs' }) as Record<string, unknown>)['aria-expanded']).toBe('true')
    expect((api.getContentProps({ value: 'docs' }) as Record<string, unknown>).hidden).toBeUndefined()
    expect((api.getContentProps({ value: 'products' }) as Record<string, unknown>).hidden).toBe(true)
    expect((api.getRootProps() as Record<string, unknown>)['data-state']).toBe('open')
    expect((api.getViewportProps() as Record<string, unknown>).hidden).toBeUndefined()
  })

  it('root 是带名字的 nav 地标；dir 只在作者给了才写', () => {
    const bare = makeMenu().api().getRootProps() as Record<string, unknown>
    expect(bare['aria-label']).toBe('Main navigation')
    expect(bare.dir).toBeUndefined()

    const named = makeMenu({ dir: 'rtl', translations: { root: '站点导航' } }).api()
    const root = named.getRootProps() as Record<string, unknown>
    expect(root['aria-label']).toBe('站点导航')
    expect(root.dir).toBe('rtl')
  })

  it('链接：当前页那条报 aria-current=page，其余省略', () => {
    const api = makeMenu().api()
    expect((api.getLinkProps({ current: true }) as Record<string, unknown>)['aria-current']).toBe('page')
    expect((api.getLinkProps({}) as Record<string, unknown>)['aria-current']).toBeUndefined()
  })

  it('指示条：装饰、随展开项显隐，横排只写内联轴那一条', () => {
    const c = makeMenu({ defaultValue: 'docs' })
    stubRect(c.list, { top: 0, left: 100, width: 600, height: 40 })
    stubRect(c.triggers[1]!, { top: 0, left: 220, width: 80, height: 40 })
    // 值没变时不会自己重量；走一趟同一条路把量测顶起来
    c.api().setValue('products')
    c.api().setValue('docs')

    const indicator = c.api().getIndicatorProps() as Record<string, unknown>
    expect(indicator['aria-hidden']).toBe(true)
    expect(indicator['data-value']).toBe('docs')
    expect(indicator.hidden).toBeUndefined()
    // 交叉轴（贴边与粗细）归样式层，内联样式一个字都不该写
    expect(indicator.style).toEqual({ inlineSize: '80px', insetInlineStart: '120px' })
  })

  // 展开项没变就没人去重量，指示条会一直停在旧坐标上——而导航栏换行、
  // 字体加载完都会让它脚下的那个 trigger 挪窝。
  it('窗口尺寸变了重量一次：展开项没动，位置照样跟着走', () => {
    const c = makeMenu({ defaultValue: 'docs' })
    stubRect(c.list, { top: 0, left: 0, width: 600, height: 40 })
    stubRect(c.triggers[1]!, { top: 0, left: 120, width: 80, height: 40 })
    window.dispatchEvent(new Event('resize'))
    expect((c.api().getIndicatorProps() as Record<string, unknown>).style)
      .toEqual({ inlineSize: '80px', insetInlineStart: '120px' })

    stubRect(c.triggers[1]!, { top: 0, left: 60, width: 40, height: 40 })
    window.dispatchEvent(new Event('resize'))
    expect((c.api().getIndicatorProps() as Record<string, unknown>).style)
      .toEqual({ inlineSize: '40px', insetInlineStart: '60px' })
  })

  it('停机即断开尺寸监听：监听器不该留在窗口上', () => {
    const removed = vi.spyOn(window, 'removeEventListener')
    const c = makeMenu()
    c.stop()
    expect(removed.mock.calls.map(call => call[0])).toContain('resize')
    removed.mockRestore()
  })

  it('都收起时指示条与 viewport 一起收起', () => {
    const c = makeMenu()
    expect((c.api().getIndicatorProps() as Record<string, unknown>).hidden).toBe(true)
    expect((c.api().getViewportProps() as Record<string, unknown>).hidden).toBe(true)
  })
})

describe('navigationMenu 受控 value', () => {
  it('受控时用户事件只发意图、不自改；宿主写回后才展开', () => {
    const seen: NavigationMenuValueChangeDetails[] = []
    const c = makeMenu({ value: null, onValueChange: d => seen.push(d) })
    c.triggers[1]!.click()
    expect(c.value()).toBeNull()
    expect(seen).toEqual([{ value: 'docs' }])

    c.setProps({ value: 'docs' })
    expect(c.value()).toBe('docs')
  })

  // 真实浏览器里按下按钮先给它焦点、再派 click，所以"点一下"到达机器的是
  // TRIGGER.FOCUS + TRIGGER.TOGGLE 两拍。受控时宿主还没把新值写回来，
  // 若拿 value 去认领"刚自动展开的是哪一项"就会认错，第二拍被当成又一次换项——
  // 一次点击对外发两条一模一样的意图。
  it('受控且已展开着，聚焦紧接着点同一个 trigger：只发一条意图', () => {
    const seen: NavigationMenuValueChangeDetails[] = []
    const c = makeMenu({ value: 'products', onValueChange: d => seen.push(d) })
    c.triggers[1]!.focus()
    c.triggers[1]!.click()
    expect(seen).toEqual([{ value: 'docs' }])
    // 宿主没写回，DOM 就还停在旧项上
    expect(c.value()).toBe('products')
  })

  // 宿主收下意图但拒绝写回时，用户再点一次得能把同一个意图重新递出去，
  // 不能因为上一次"自动展开"的记录还挂着就永远吞掉。
  it('受控且宿主不写回：再点一次照样把意图递出去', () => {
    const seen: NavigationMenuValueChangeDetails[] = []
    const c = makeMenu({ value: 'products', onValueChange: d => seen.push(d) })
    c.triggers[1]!.focus()
    c.triggers[1]!.click()
    // 焦点已经在这个 trigger 上，第二下点击不会再派 focus
    c.triggers[1]!.click()
    expect(seen).toEqual([{ value: 'docs' }, { value: 'docs' }])
  })

  it('受控展开着时悬停别处：直接发换项意图，不走延时', () => {
    const seen: NavigationMenuValueChangeDetails[] = []
    const c = makeMenu({ value: 'products', onValueChange: d => seen.push(d) })
    c.hover(2)
    expect(seen).toEqual([{ value: 'company' }])
    expect(c.state()).toBe('idle')
  })

  it('setValue 双向驱动', () => {
    const c = makeMenu()
    c.api().setValue('company')
    expect(c.value()).toBe('company')
    c.api().setValue(null)
    expect(c.value()).toBeNull()
  })

  it('程序化改写会把正在跑的展开等待一并撤掉', () => {
    const c = makeMenu()
    c.hover(0)
    expect(c.state()).toBe('opening')
    c.api().setValue('company')
    expect(c.state()).toBe('idle')
    vi.advanceTimersByTime(500)
    // 计时器若没被撤掉，这里会被 pending 的 products 顶掉
    expect(c.value()).toBe('company')
  })
})
