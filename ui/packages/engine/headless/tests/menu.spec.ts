// @vitest-environment jsdom
import type { Anchor, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { MenuApi, MenuSchema } from '../src/menu'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectMenu, menuMachine } from '../src/menu'

type Props = MenuSchema['props']
type Dict = Record<string, unknown>

/** 条目的唯一事实源：与作者写在部件上的声明等价，绝不从 DOM 回读。 */
const ITEMS = [
  { value: 'copy', text: '复制' },
  { value: 'paste', text: '粘贴' },
  { value: 'delete', text: '删除' },
] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden'])

/** 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle）。 */
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
    if (key === 'style')
      continue
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  api: () => MenuApi
  service: ReturnType<typeof createService<MenuSchema>>
  send: (event: MenuSchema['event']) => void
  trigger: HTMLButtonElement
  positioner: HTMLElement
  content: HTMLElement
  item: (value: string) => HTMLElement
  state: () => string
  position: () => PositionResult | null
  focusedValue: () => string | null
  /** 换掉锚点 / 浮层 ref，用来验它们缺席时不挂订阅。 */
  setRef: (key: 'getAnchorEl' | 'getFloatingEl', value: () => HTMLElement | null) => void
}

interface MountOptions {
  /** 定位引擎；不给即缺省，机器照常转移但不产出位置结果。 */
  position?: PositionEnginePort
  /** 本层被移出层栈时调一次，用来记拆除顺序。 */
  onLayerDispose?: () => void
}

const runtimes: VanillaRuntime[] = []

function mount(initial: Partial<Props> = {}, options: MountOptions = {}): Harness {
  const doc = document
  const props: Partial<Props> = { ...initial }
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const trigger = doc.createElement('button')
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  positioner.appendChild(content)
  root.append(trigger, positioner)
  doc.body.appendChild(root)

  const itemEls = new Map<string, HTMLElement>()
  for (const item of ITEMS) {
    const el = doc.createElement('div')
    el.textContent = item.text
    content.appendChild(el)
    itemEls.set(item.value, el)
  }

  const service = createService(menuMachine, { props: () => props, runtime, scope })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => {
    const handle = config.layerRegistry.register({
      kind: 'popover',
      node: () => content,
      branches: () => [trigger],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    return {
      layer: handle.layer,
      dispose: () => {
        handle.dispose()
        options.onLayerDispose?.()
      },
    }
  })
  if (options.position)
    service.refs.set('position', options.position)
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  const render = (): void => {
    const api = connectMenu(service, normalizeProps)
    spread(trigger, api.getTriggerProps() as Dict)
    spread(positioner, api.getPositionerProps() as Dict)
    spread(content, api.getContentProps() as Dict)
    for (const item of ITEMS)
      spread(itemEls.get(item.value)!, api.getItemProps({ value: item.value }) as Dict)
  }

  runtime.start()
  runtime.subscribe(render)
  render()

  return {
    api: () => connectMenu(service, normalizeProps),
    service,
    send: event => service.send(event),
    trigger,
    positioner,
    content,
    item: v => itemEls.get(v)!,
    state: () => service.state.get(),
    position: () => service.context.get('position'),
    focusedValue: () => service.context.get('focusedValue'),
    setRef: (key, value) => service.refs.set(key, value),
  }
}

/** flush 在 vanilla 运行时是 queueMicrotask；消解层的监听器注册还要过一个 setTimeout。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** 等 n 帧：焦点域的落焦重试与归还都排在 rAF 上。 */
async function frames(n = 5): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function press(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

function fakeEngine(): {
  port: PositionEnginePort
  calls: { anchor: Anchor, floating: HTMLElement, options: PositionOptions, emit: (r: PositionResult) => void }[]
  stops: () => number
} {
  const calls: { anchor: Anchor, floating: HTMLElement, options: PositionOptions, emit: (r: PositionResult) => void }[] = []
  let stops = 0
  return {
    calls,
    stops: () => stops,
    port: {
      attach: (anchor, floating, options, onResult) => {
        calls.push({ anchor, floating, options, emit: onResult })
        return () => {
          stops += 1
        }
      },
    },
  }
}

const RESULT: PositionResult = { x: 12, y: 34, placement: 'bottom-start', hidden: false }

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('条目高亮标记', () => {
  it('收起态没有锚点：条目不打 data-highlighted，Tab 位也不归任何条目', () => {
    const h = mount()
    const item = h.api().getItemProps({ value: 'copy' }) as Dict
    expect(item['data-highlighted']).toBeUndefined()
    expect(item.tabindex).toBe(-1)
  })

  it('焦点落到条目上即同步打 data-highlighted，且整组只有它一个', () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'none' })
    h.send({ type: 'ITEM.FOCUS', value: 'copy' })
    expect(h.api().focusedValue).toBe('copy')
    expect((h.api().getItemProps({ value: 'copy' }) as Dict)['data-highlighted']).toBe('')
    expect((h.api().getItemProps({ value: 'copy' }) as Dict).tabindex).toBe(0)
    expect((h.api().getItemProps({ value: 'paste' }) as Dict)['data-highlighted']).toBeUndefined()
  })

  it('焦点回到 content 自身时锚点清空，标记随之摘掉', () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'none' })
    h.send({ type: 'ITEM.FOCUS', value: 'copy' })
    h.send({ type: 'FOCUS.CLEAR' })
    expect((h.api().getItemProps({ value: 'copy' }) as Dict)['data-highlighted']).toBeUndefined()
  })

  it('装饰箭头对读屏隐藏：aria-hidden 写布尔', () => {
    const h = mount()
    expect((h.api().getArrowProps() as Dict)['aria-hidden']).toBe(true)
  })
})

describe('menu 浮层定位', () => {
  it('等 DOM 落定才挂：进入展开态那一刻还没碰引擎，一拍之后才把锚点与浮层交进去', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    expect(engine.calls).toHaveLength(0)
    await tick()
    expect(engine.calls).toHaveLength(1)
    expect(engine.calls[0]!.anchor).toBe(h.trigger)
    expect(engine.calls[0]!.floating).toBe(h.positioner)
  })

  it('交给引擎的参数：缺省 bottom-start 与 8px，坐标系走视口，要可用空间，箭头量由这边交进去', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('bottom-start')
    expect(options.offset).toBe(8)
    expect(options.strategy).toBe('fixed')
    expect(options.size).toBe(true)
    expect(options.dir).toBeUndefined()
    expect(options.arrow).toEqual({ size: 8 * Math.SQRT2, padding: 8 })
  })

  it('子菜单缺省落位换到侧向，RTL 下翻到另一侧', async () => {
    const ltr = fakeEngine()
    const a = mount({ submenu: true }, { position: ltr.port })
    a.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect(ltr.calls[0]!.options.placement).toBe('right-start')

    const rtl = fakeEngine()
    const b = mount({ submenu: true, dir: 'rtl' }, { position: rtl.port })
    b.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect(rtl.calls[0]!.options.placement).toBe('left-start')
  })

  it('placement / offset / dir 由 props 覆盖', async () => {
    const engine = fakeEngine()
    const h = mount({ placement: 'top-end', offset: 2, dir: 'rtl' }, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('top-end')
    expect(options.offset).toBe(2)
    expect(options.dir).toBe('rtl')
  })

  it('引擎回报的结果写进 context，连接层据此认落位', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect((h.api().getPositionerProps() as Dict)['data-positioned']).toBeUndefined()
    engine.calls[0]!.emit(RESULT)
    expect(h.position()).toEqual(RESULT)
    expect((h.api().getPositionerProps() as Dict)['data-positioned']).toBe('')
  })

  it('重新展开先把上一轮坐标清掉：再次落位之前不算已定位', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    engine.calls[0]!.emit(RESULT)
    h.send({ type: 'CLOSE' })
    // 收起中坐标还留着，退场要用
    expect(h.position()).toEqual(RESULT)
    h.send({ type: 'OPEN', focus: 'none' })
    expect(h.position()).toBeNull()
  })

  it('收起即撤订阅', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect(engine.stops()).toBe(0)
    h.send({ type: 'CLOSE' })
    expect(engine.stops()).toBe(1)
  })

  it('展开当拍又收起：那一拍到来时不再挂订阅', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN', focus: 'none' })
    h.send({ type: 'CLOSE' })
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('锚点或浮层缺席就不挂', async () => {
    const engine = fakeEngine()
    const noAnchor = mount({}, { position: engine.port })
    noAnchor.setRef('getAnchorEl', () => null)
    noAnchor.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect(engine.calls).toHaveLength(0)

    const noFloating = mount({}, { position: engine.port })
    noFloating.setRef('getFloatingEl', () => null)
    noFloating.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('没有引擎照常转移，只是没有位置结果', async () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    expect(h.state()).toBe('open')
    expect(h.position()).toBeNull()
  })
})

describe('menu 浮层的层与消解', () => {
  it('escape 收起并把关闭原因报成 esc', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    press(document.body, 'Escape')
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false, reason: 'esc' })
  })

  it('层外按下指针收起并把关闭原因报成 interact-outside', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false, reason: 'interact-outside' })
  })

  it('收起之后这一层不再吃 Escape', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    h.send({ type: 'CLOSE' })
    onOpenChange.mockClear()
    press(document.body, 'Escape')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('逆序拆：先撤焦点域与消解层的订阅，最后才把层移出栈', async () => {
    const order: string[] = []
    const h = mount({}, { onLayerDispose: () => order.push('layer') })
    h.send({ type: 'OPEN', focus: 'none' })
    await tick()
    const remove = document.removeEventListener.bind(document)
    const spy = vi.spyOn(document, 'removeEventListener').mockImplementation(((type: string, listener: EventListener, opts?: boolean | EventListenerOptions) => {
      // focusout 只有焦点域摘、pointerdown 只有消解层摘，拿它们当各自的拆除标记
      if (type === 'focusout')
        order.push('focus-scope')
      if (type === 'pointerdown')
        order.push('dismiss')
      remove(type, listener, opts)
    }) as typeof document.removeEventListener)
    h.send({ type: 'CLOSE' })
    spy.mockRestore()
    expect(order).toEqual(['focus-scope', 'dismiss', 'layer'])
  })
})

describe('menu 展开时的焦点', () => {
  it('键盘从首端进：锚点落在首个条目上，焦点跟着落上去', async () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'first' })
    await frames()
    expect(h.focusedValue()).toBe('copy')
    expect(document.activeElement).toBe(h.item('copy'))
  })

  it('键盘从末端进：锚点落在末个条目上', async () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'last' })
    await frames()
    expect(h.focusedValue()).toBe('delete')
    expect(document.activeElement).toBe(h.item('delete'))
  })

  it('指针打开不落锚点：条目 Tab 位全为 -1，焦点歇在认领着 Tab 位的 content 上', async () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'none' })
    await frames()
    expect(h.focusedValue()).toBeNull()
    expect(ITEMS.map(i => h.item(i.value).getAttribute('tabindex'))).toEqual(['-1', '-1', '-1'])
    expect(h.content.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(h.content)
  })

  it('关掉之后焦点归还 trigger——展开之前焦点在 body 上也一样', async () => {
    const h = mount()
    expect(document.activeElement).toBe(document.body)
    h.send({ type: 'OPEN', focus: 'first' })
    await frames()
    h.send({ type: 'CLOSE' })
    await frames()
    expect(document.activeElement).toBe(h.trigger)
  })

  it('tab 关掉的那一路把焦点让出去，不往回抢', async () => {
    const h = mount()
    h.send({ type: 'OPEN', focus: 'first' })
    await frames()
    h.send({ type: 'CLOSE', src: 'tab' })
    await frames()
    expect(document.activeElement).not.toBe(h.trigger)
  })
})
