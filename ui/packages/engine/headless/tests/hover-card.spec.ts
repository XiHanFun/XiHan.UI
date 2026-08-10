// @vitest-environment jsdom
import type { HoverCardOpenChangeDetails, HoverCardSchema } from '../src/hover-card'
import { createRuntimeConfig, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectHoverCard, hoverCardMachine } from '../src/hover-card'

type Props = HoverCardSchema['props']

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯比对 connect 的返回值只能验静态属性，
 * 「指针从 trigger 走到 content 途中卡片不收起」这类事实必须有活 DOM 才立得住。
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
    if (key === 'style' || raw === undefined || raw === null || raw === false)
      continue
    el.setAttribute(key, String(raw))
  }
}

/**
 * 一整套活 DOM：root > (trigger, positioner > content > link)。
 * content 里放一个链接是必需的——「内容可交互、可聚焦」这条只有真有个可聚焦后代才验得到。
 */
function makeCard(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(hoverCardMachine, { props: () => props.get(), runtime })

  const root = document.createElement('div')
  const trigger = document.createElement('button')
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  const link = document.createElement('a')
  link.href = '#profile'
  content.appendChild(link)
  positioner.appendChild(content)
  root.append(trigger, positioner)
  document.body.appendChild(root)

  // 定位引擎缺省（无布局环境）：机器照常转移，只是不产出坐标。
  // 元素 getter 必须给：焦点去向的判定要经它们取活节点。
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  runtime.start()

  const wire = (): void => {
    const api = connectHoverCard(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
  }
  // 每次状态变化都重新接线，与适配器同构（属性与处理器都跟着最新状态走）
  runtime.subscribe(wire)
  wire()

  return {
    service,
    root,
    trigger,
    positioner,
    content,
    link,
    state: () => service.state.get(),
    api: () => connectHoverCard(service, normalizeProps),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
}

/**
 * 补上消解层需要的 DOM 环境：适配器平时干的活（建 RuntimeConfig、给注册函数）。
 * 只给注册函数、不在这里注册——层的入栈出栈跟着可见态走，由机器的效应负责。
 * 返回的日志记下每次摘挂，用来验层不随指针穿行反复重建。
 */
function wireLayer(card: ReturnType<typeof makeCard>): string[] {
  const log: string[] = []
  const config = createRuntimeConfig()
  card.service.refs.set('config', config)
  card.service.refs.set('registerLayer', () => {
    log.push('register')
    const handle = config.layerRegistry.register({
      kind: 'popover',
      node: () => card.content,
      // trigger 记为本层分支：点它算层内交互
      branches: () => [card.trigger],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    return {
      layer: handle.layer,
      dispose: () => {
        log.push('dispose')
        handle.dispose()
      },
    }
  })
  return log
}

/** 指针事件在 jsdom 里没有默认构造语义，直接派发裸事件即可（连接层只看类型）。 */
function pointer(el: HTMLElement, type: 'pointerenter' | 'pointerleave'): void {
  el.dispatchEvent(new Event(type))
}

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('hoverCardMachine 悬停延时', () => {
  it('初态由 open / defaultOpen 决定；两者都没有即 closed', () => {
    expect(makeCard().state()).toBe('closed')
    expect(makeCard({ defaultOpen: true }).state()).toBe('visible.open')
    expect(makeCard({ open: true }).state()).toBe('visible.open')
  })

  it('悬停 trigger 要等满 openDelay 才展开；缺省 700ms', () => {
    const c = makeCard()
    pointer(c.trigger, 'pointerenter')
    expect(c.state()).toBe('opening')
    vi.advanceTimersByTime(699)
    expect(c.state()).toBe('opening')
    vi.advanceTimersByTime(1)
    expect(c.state()).toBe('visible.open')
  })

  it('等待期内指针又移出：撤销等待，且对外从未展开过（不发通知）', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ openDelay: 100, onOpenChange: d => seen.push(d) })
    pointer(c.trigger, 'pointerenter')
    pointer(c.trigger, 'pointerleave')
    expect(c.state()).toBe('closed')
    vi.advanceTimersByTime(500)
    expect(c.state()).toBe('closed')
    expect(seen).toEqual([])
  })

  it('指针离开 trigger 只进收起等待态：满 closeDelay 才真收起', () => {
    const c = makeCard({ openDelay: 10, closeDelay: 100 })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    pointer(c.trigger, 'pointerleave')
    expect(c.state()).toBe('visible.closing')
    // 收起等待期内浮层仍可见
    expect(c.api().open).toBe(true)
    vi.advanceTimersByTime(99)
    expect(c.state()).toBe('visible.closing')
    vi.advanceTimersByTime(1)
    expect(c.state()).toBe('closed')
  })
})

describe('hoverCard 指针从 trigger 走到 content', () => {
  it('途中隔着间隙也不收起：离开 trigger 后进入 content 即撤销收起等待', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ openDelay: 10, closeDelay: 100, onOpenChange: d => seen.push(d) })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    expect(seen).toEqual([{ open: true }])

    pointer(c.trigger, 'pointerleave')
    // 间隙里走 60ms（不足 closeDelay），此刻两端都没有指针
    vi.advanceTimersByTime(60)
    expect(c.state()).toBe('visible.closing')

    pointer(c.content, 'pointerenter')
    expect(c.state()).toBe('visible.open')
    // 再等过一整个 closeDelay：那个旧计时器若没被撤掉，这里就会把卡片收走
    vi.advanceTimersByTime(500)
    expect(c.state()).toBe('visible.open')
    expect(seen).toEqual([{ open: true }])
  })

  it('离开 content 同样只进等待态，回到 trigger 再次撤销', () => {
    const c = makeCard({ openDelay: 10, closeDelay: 100 })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    pointer(c.trigger, 'pointerleave')
    pointer(c.content, 'pointerenter')

    pointer(c.content, 'pointerleave')
    expect(c.state()).toBe('visible.closing')
    vi.advanceTimersByTime(60)
    pointer(c.trigger, 'pointerenter')
    expect(c.state()).toBe('visible.open')
    vi.advanceTimersByTime(500)
    expect(c.state()).toBe('visible.open')
  })

  it('穿行只在 visible 的子态间跳：定位与消解层不被反复摘挂', () => {
    const c = makeCard({ openDelay: 10, closeDelay: 100 })
    // 层只在浮层可见期间入栈；这里数它被摘挂了几次
    const mounted = wireLayer(c)

    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    expect(mounted).toEqual(['register'])

    pointer(c.trigger, 'pointerleave')
    pointer(c.content, 'pointerenter')
    pointer(c.content, 'pointerleave')
    pointer(c.trigger, 'pointerenter')
    // 四次穿行，层始终是同一层
    expect(mounted).toEqual(['register'])

    pointer(c.trigger, 'pointerleave')
    vi.advanceTimersByTime(100)
    expect(c.state()).toBe('closed')
    expect(mounted).toEqual(['register', 'dispose'])
  })
})

describe('hoverCard 焦点', () => {
  it('trigger 获得焦点立即展开，不走 openDelay', () => {
    const c = makeCard({ openDelay: 5000 })
    c.trigger.focus()
    expect(c.state()).toBe('visible.open')
  })

  it('焦点停在卡片内时，纯指针移出不收起（收起归失焦管）', () => {
    const c = makeCard({ closeDelay: 50 })
    c.trigger.focus()
    pointer(c.trigger, 'pointerleave')
    expect(c.state()).toBe('visible.open')
    vi.advanceTimersByTime(500)
    expect(c.state()).toBe('visible.open')
  })

  // 光看终态测不出东西：焦点若被判成离场，卡片会先收起、随即被 content 的 focusin 重开，
  // 终态照样是 visible.open。真正的破绽在通知序列上——那一收一开会漏出去两条。
  it('焦点从 trigger 走进 content 不算离场：卡片留着，也不多派通知', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ onOpenChange: d => seen.push(d) })
    c.trigger.focus()
    expect(seen).toEqual([{ open: true }])

    c.link.focus()
    expect(document.activeElement).toBe(c.link)
    expect(c.state()).toBe('visible.open')
    expect(seen).toEqual([{ open: true }])
  })

  it('焦点在 content 内部换落点同样不算离场', () => {
    const second = document.createElement('button')
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ onOpenChange: d => seen.push(d) })
    c.content.appendChild(second)
    c.trigger.focus()
    c.link.focus()
    second.focus()
    expect(c.state()).toBe('visible.open')
    expect(seen).toEqual([{ open: true }])
  })

  it('焦点真的离开整张卡片才收起，且不等 closeDelay', () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    const c = makeCard({ closeDelay: 5000 })
    c.trigger.focus()
    c.link.focus()
    outside.focus()
    expect(c.state()).toBe('closed')
    outside.remove()
  })

  it('悬停打开后焦点落进 content，此后纯指针移出也不收起', () => {
    const c = makeCard({ openDelay: 10, closeDelay: 50 })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    c.link.focus()
    pointer(c.content, 'pointerleave')
    expect(c.state()).toBe('visible.open')
    vi.advanceTimersByTime(500)
    expect(c.state()).toBe('visible.open')
  })

  it('展开不抢焦点：悬停打开后焦点仍在原处', () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    const c = makeCard({ openDelay: 10 })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    expect(c.state()).toBe('visible.open')
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })
})

describe('hoverCard 收起的其它出口', () => {
  it('escape 立即收起，不等 closeDelay', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ closeDelay: 5000, onOpenChange: d => seen.push(d) })
    c.trigger.focus()
    press(c.trigger, 'Escape')
    expect(c.state()).toBe('closed')
    expect(seen).toEqual([{ open: true }, { open: false }])
  })

  it('escape 打在 content 内部的可聚焦节点上同样收起（事件冒泡到 content）', () => {
    const c = makeCard({ openDelay: 10, closeDelay: 5000 })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    press(c.link, 'Escape')
    expect(c.state()).toBe('closed')
  })

  it('收起等待期内按 Escape：不等剩余时间，当场收起', () => {
    const c = makeCard({ openDelay: 10, closeDelay: 5000 })
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    pointer(c.trigger, 'pointerleave')
    expect(c.state()).toBe('visible.closing')
    press(c.trigger, 'Escape')
    expect(c.state()).toBe('closed')
  })

  it('悬停打开、焦点根本不在卡片里时，Escape 仍收得掉（走消解层这条文档级通路）', async () => {
    const c = makeCard({ openDelay: 10, closeDelay: 5000 })
    wireLayer(c)
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    expect(c.state()).toBe('visible.open')

    // 消解层的监听器是延后注册的（避开打开自己的那一次交互）
    await vi.advanceTimersByTimeAsync(1)
    // 焦点不在卡片里：keydown 落在文档上，trigger/content 的处理器一个也收不到
    expect(c.root.contains(document.activeElement)).toBe(false)
    press(document.body, 'Escape')
    expect(c.state()).toBe('closed')
  })

  it('层外指针按下即收起，按在 trigger 上不算层外', async () => {
    const c = makeCard({ openDelay: 10, closeDelay: 5000 })
    wireLayer(c)
    pointer(c.trigger, 'pointerenter')
    vi.advanceTimersByTime(10)
    await vi.advanceTimersByTimeAsync(1)

    c.trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(c.state()).toBe('visible.open')

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(c.state()).toBe('closed')
  })

  it('escape 之外的键不收起', () => {
    const c = makeCard()
    c.trigger.focus()
    press(c.trigger, 'Enter')
    press(c.trigger, 'a')
    expect(c.state()).toBe('visible.open')
  })
})

describe('hoverCard disabled', () => {
  it('悬停与聚焦都不展开，也不发通知', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ disabled: true, openDelay: 10, onOpenChange: d => seen.push(d) })
    pointer(c.trigger, 'pointerenter')
    expect(c.state()).toBe('closed')
    c.trigger.focus()
    expect(c.state()).toBe('closed')
    vi.advanceTimersByTime(500)
    expect(c.state()).toBe('closed')
    expect(seen).toEqual([])
  })

  it('等待期中途被禁用：到点也不展开', () => {
    const c = makeCard({ openDelay: 100 })
    pointer(c.trigger, 'pointerenter')
    expect(c.state()).toBe('opening')
    c.setProps({ disabled: true })
    vi.advanceTimersByTime(100)
    expect(c.state()).toBe('closed')
  })
})

describe('hoverCard 受控 open', () => {
  it('受控时用户事件只发意图、不自改状态；宿主写回后才展开', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ open: false, onOpenChange: d => seen.push(d) })
    c.trigger.focus()
    expect(c.state()).toBe('closed')
    expect(seen).toEqual([{ open: true }])

    c.setProps({ open: true })
    expect(c.state()).toBe('visible.open')
  })

  it('受控时收起同样只发意图；收起等待期内退回可见态而不是卡在等待里', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ open: true, closeDelay: 100, onOpenChange: d => seen.push(d) })
    pointer(c.trigger, 'pointerenter')
    pointer(c.trigger, 'pointerleave')
    expect(c.state()).toBe('visible.closing')

    vi.advanceTimersByTime(100)
    expect(c.state()).toBe('visible.open')
    expect(seen).toEqual([{ open: false }])

    c.setProps({ open: false })
    expect(c.state()).toBe('closed')
  })

  // 受控时失焦不改状态，「焦点还在里面」这个标记若留着，卡片就再也不会响应纯指针移出。
  // 破绽藏在下一轮：宿主写回 open 打开的卡片带着一个过期标记，POINTER.LEAVE 被静默吞掉。
  it('受控失焦后标记复位：此后纯指针移出仍能发出收起意图', () => {
    const seen: HoverCardOpenChangeDetails[] = []
    const c = makeCard({ open: true, closeDelay: 50, onOpenChange: d => seen.push(d) })
    // 焦点落进卡片，标记置上
    c.trigger.focus()
    // 焦点离开：受控下只发意图、状态不动，标记必须跟着复位
    c.trigger.blur()
    expect(c.state()).toBe('visible.open')
    expect(seen).toEqual([{ open: false }])

    pointer(c.trigger, 'pointerenter')
    pointer(c.trigger, 'pointerleave')
    expect(c.state()).toBe('visible.closing')
    vi.advanceTimersByTime(50)
    expect(seen).toEqual([{ open: false }, { open: false }])
  })

  it('open 变回 undefined 是转非受控，不强制收起', () => {
    const c = makeCard({ open: true })
    c.setProps({ open: undefined })
    expect(c.state()).toBe('visible.open')
  })
})

describe('connectHoverCard', () => {
  it('收起态：content 常挂带 hidden，trigger 的 aria 显式为 false', () => {
    const c = makeCard()
    const api = c.api()
    const trigger = api.getTriggerProps() as Record<string, unknown>
    const content = api.getContentProps() as Record<string, unknown>

    expect(trigger['data-scope']).toBe('hover-card')
    expect(trigger['data-part']).toBe('trigger')
    expect(trigger.type).toBe('button')
    expect(trigger['aria-haspopup']).toBe('dialog')
    expect(trigger['aria-expanded']).toBe('false')
    expect(trigger['aria-controls']).toBe(content.id)
    expect(trigger['data-state']).toBe('closed')

    expect(content.role).toBe('dialog')
    expect(content.tabindex).toBe(-1)
    expect(content['aria-modal']).toBe('false')
    expect(content['aria-labelledby']).toBe(trigger.id)
    expect(content.hidden).toBe(true)
    expect(content['data-state']).toBe('closed')
  })

  it('展开态：content 去掉 hidden，四处 data-state 同步', () => {
    const c = makeCard({ defaultOpen: true })
    const api = c.api()
    expect(api.open).toBe(true)
    expect((api.getTriggerProps() as Record<string, unknown>)['aria-expanded']).toBe('true')
    expect((api.getContentProps() as Record<string, unknown>).hidden).toBeUndefined()
    expect((api.getRootProps() as Record<string, unknown>)['data-state']).toBe('open')
    expect((api.getPositionerProps() as Record<string, unknown>)['data-state']).toBe('open')
  })

  it('无定位结果时朝向退回请求值，箭头跟着同一个朝向', () => {
    const c = makeCard({ placement: 'top-start' })
    expect((c.api().getPositionerProps() as Record<string, unknown>)['data-placement']).toBe('top-start')
    expect((c.api().getArrowProps() as Record<string, unknown>)['data-placement']).toBe('top-start')
    expect((makeCard().api().getPositionerProps() as Record<string, unknown>)['data-placement']).toBe('bottom')
  })

  it('箭头是装饰：aria-hidden 恒为真', () => {
    expect((makeCard().api().getArrowProps() as Record<string, unknown>)['aria-hidden']).toBe('true')
  })

  it('dir 只在作者给了才写；disabled 只在 root/trigger 上留标记，不输出原生 disabled', () => {
    const bare = makeCard().api()
    expect((bare.getRootProps() as Record<string, unknown>).dir).toBeUndefined()

    const rtl = makeCard({ dir: 'rtl', disabled: true }).api()
    const root = rtl.getRootProps() as Record<string, unknown>
    const trigger = rtl.getTriggerProps() as Record<string, unknown>
    expect(root.dir).toBe('rtl')
    expect(root['data-disabled']).toBe('')
    expect(trigger['data-disabled']).toBe('')
    expect(trigger.disabled).toBeUndefined()
    expect(trigger['aria-disabled']).toBeUndefined()
  })

  it('setOpen 双向驱动状态', () => {
    const c = makeCard()
    c.api().setOpen(true)
    expect(c.state()).toBe('visible.open')
    c.api().setOpen(false)
    expect(c.state()).toBe('closed')
  })
})
