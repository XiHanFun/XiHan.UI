// @vitest-environment jsdom
import type { Anchor, PositionEnginePort, PositionOptions, PositionRect } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ContextMenuApi, ContextMenuSchema } from '../src/context-menu'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectContextMenu, contextMenuMachine } from '../src/context-menu'

type Props = ContextMenuSchema['props']

/** 条目声明的唯一事实源：与作者写在部件上的声明等价，绝不从 DOM 回读（那会读到机器自己写的）。 */
const ITEMS = [
  { value: 'copy', text: 'Copy', group: 'edit' },
  { value: 'paste', text: 'Paste', group: 'edit', disabled: true },
  { value: 'delete', text: 'Delete', group: 'danger' },
] as const

const GROUPS = ['edit', 'danger'] as const

/** 长按用例统一用这个时长跑真定时器：够短不拖慢用例，又远大于一次事件循环。 */
const PRESS_DELAY = 20

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * "右键落在哪个坐标上""按键落到哪个条目上"这类事实必须有活 DOM 才立得住。
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
    if (key === 'style')
      continue
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface AttachCall {
  rect: PositionRect
  options: PositionOptions
}

interface FakeEngine extends PositionEnginePort {
  calls: AttachCall[]
  /** 已被撤销的订阅数：换锚点必须先撤旧的，否则两套位置会轮流往回写。 */
  stopped: number
}

function createFakeEngine(): FakeEngine {
  const engine: FakeEngine = {
    calls: [],
    stopped: 0,
    attach(anchor: Anchor, _floating, options) {
      engine.calls.push({
        rect: (anchor as { getBoundingClientRect: () => PositionRect }).getBoundingClientRect(),
        options,
      })
      return () => {
        engine.stopped += 1
      }
    },
  }
  return engine
}

interface Harness {
  api: () => ContextMenuApi
  trigger: HTMLElement
  positioner: HTMLElement
  content: HTMLElement
  item: (value: string) => HTMLElement
  itemText: (value: string) => HTMLElement
  groupEl: (value: string) => HTMLElement
  groupLabel: (value: string) => HTMLElement
  engine: FakeEngine
  service: Service<ContextMenuSchema>
  setProps: (next: Partial<Props>) => void
  render: () => void
  state: () => string
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { ...initial }
  const runtime = createVanillaRuntime()
  // 受控的 open 必须由一个 signal 承载：宿主写回要能把 watch 唤醒，
  // 直接改普通对象没有任何东西通知机器，影子事件永远发不出来
  const openSignal = runtime.signal<boolean | undefined>(initial.open)
  const service = createService(contextMenuMachine, {
    props: () => ({ ...props, open: openSignal.get() }),
    runtime,
  })

  const doc = document
  const root = doc.createElement('div')
  const trigger = doc.createElement('div')
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  const separator = doc.createElement('div')
  root.append(trigger, positioner)
  positioner.appendChild(content)

  const groupEls = new Map<string, HTMLElement>()
  const groupLabels = new Map<string, HTMLElement>()
  for (const g of GROUPS) {
    const el = doc.createElement('div')
    const gl = doc.createElement('span')
    gl.textContent = g
    el.appendChild(gl)
    content.appendChild(el)
    groupEls.set(g, el)
    groupLabels.set(g, gl)
  }
  // 分隔线夹在两组之间：它带 data-scope 却不入集合，End 落到它后面的条目即为证
  content.insertBefore(separator, groupEls.get('danger')!)

  const itemEls = new Map<string, HTMLElement>()
  const textEls = new Map<string, HTMLElement>()
  for (const item of ITEMS) {
    const el = doc.createElement('div')
    const text = doc.createElement('span')
    text.textContent = item.text
    el.appendChild(text)
    groupEls.get(item.group)!.appendChild(el)
    itemEls.set(item.value, el)
    textEls.set(item.value, text)
  }
  doc.body.appendChild(root)

  const engine = createFakeEngine()
  service.refs.set('position', engine)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  runtime.start()

  const render = (): void => {
    const api = connectContextMenu(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    spread(separator, api.getSeparatorProps() as Record<string, unknown>)
    for (const g of GROUPS) {
      spread(groupEls.get(g)!, api.getGroupProps({ value: g }) as Record<string, unknown>)
      spread(groupLabels.get(g)!, api.getGroupLabelProps({ value: g }) as Record<string, unknown>)
    }
    for (const item of ITEMS) {
      const decl = { value: item.value, disabled: 'disabled' in item ? item.disabled : false }
      spread(itemEls.get(item.value)!, api.getItemProps(decl) as Record<string, unknown>)
      spread(textEls.get(item.value)!, api.getItemTextProps(decl) as Record<string, unknown>)
    }
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectContextMenu(service, normalizeProps),
    trigger,
    positioner,
    content,
    item: v => itemEls.get(v)!,
    itemText: v => textEls.get(v)!,
    groupEl: v => groupEls.get(v)!,
    groupLabel: v => groupLabels.get(v)!,
    engine,
    service,
    setProps: (next) => {
      Object.assign(props, next)
      if ('open' in next)
        openSignal.set(next.open)
      render()
    },
    render,
    state: () => service.state.get(),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function rightClick(el: HTMLElement, x = 120, y = 80): MouseEvent {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y })
  el.dispatchEvent(event)
  return event
}

/** 右键的键盘等价物：与指针入口不同，它要预落锚点，方向键与确认键才有起点。 */
function menuKey(el: HTMLElement): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'ContextMenu', bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

function pointer(el: HTMLElement, type: string, init: PointerEventInit = {}): void {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, ...init }))
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

function focused(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

/** 等真定时器到点；长按用例用它，避免假定时器把 queueMicrotask/rAF 一并接管。 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 等一次 flush（vanilla 运行时的 flush 是 queueMicrotask）。 */
function flushed(): Promise<void> {
  return Promise.resolve()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('contextMenuMachine 开合', () => {
  it('默认收起，defaultOpen 决定初态', () => {
    expect(mount().state()).toBe('closed')
    expect(mount({ defaultOpen: true }).state()).toBe('open')
  })

  it('右键展开：吞掉浏览器自带菜单，锚点落在光标坐标上', () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    const event = rightClick(h.trigger, 120, 80)
    // 不 preventDefault 就会与系统右键菜单叠在一起
    expect(event.defaultPrevented).toBe(true)
    expect(h.state()).toBe('open')
    expect(h.api().point).toEqual({ x: 120, y: 80 })
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith({ open: true })
  })

  it('已经展开时在别处再右键：只挪坐标，不先关再开', () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    rightClick(h.trigger, 10, 10)
    onOpenChange.mockClear()
    rightClick(h.trigger, 300, 200)
    expect(h.state()).toBe('open')
    expect(h.api().point).toEqual({ x: 300, y: 200 })
    // 关一次再开一次会在这里留下两条记录，用户看到的是浮层白闪一下
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('展开时左键按下即关闭；右键那一下不关（要留给随后的 contextmenu 换坐标）', () => {
    const h = mount()
    rightClick(h.trigger, 10, 10)
    pointer(h.trigger, 'pointerdown', { button: 2, pointerType: 'mouse' })
    expect(h.state()).toBe('open')
    pointer(h.trigger, 'pointerdown', { button: 0, pointerType: 'mouse' })
    expect(h.state()).toBe('closed')
  })

  it('浮层嵌在触发区内部时，点条目不会被触发区当成"点到别处"', () => {
    const h = mount()
    // 作者把 positioner 挂进触发区：条目上的 pointerdown 会一路冒泡到 trigger
    h.trigger.appendChild(h.positioner)
    rightClick(h.trigger, 10, 10)
    pointer(h.item('copy'), 'pointerdown', { button: 0, pointerType: 'mouse' })
    expect(h.state()).toBe('open')
  })

  it('setOpen(false) 关闭；setOpen(true) 落回最近一次坐标', () => {
    const h = mount()
    rightClick(h.trigger, 44, 55)
    h.api().setOpen(false)
    expect(h.state()).toBe('closed')
    h.api().setOpen(true)
    expect(h.state()).toBe('open')
    expect(h.api().point).toEqual({ x: 44, y: 55 })
  })

  it('openAt 命令式展开到指定坐标', () => {
    const h = mount()
    h.api().openAt(9, 9)
    expect(h.state()).toBe('open')
    expect(h.api().point).toEqual({ x: 9, y: 9 })
  })

  it('受控：右键只发意图不自改 DOM，宿主写回 open 后才展开', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: false, onOpenChange })
    rightClick(h.trigger, 70, 70)
    expect(h.state()).toBe('closed')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith({ open: true })
    // 坐标先记下了：受控那一拍走的是影子事件，读不到当初那个指针事件
    expect(h.api().point).toEqual({ x: 70, y: 70 })
    h.setProps({ open: true })
    expect(h.state()).toBe('open')
    expect(h.content.hasAttribute('hidden')).toBe(false)
  })
})

describe('触摸端长按', () => {
  it('按住够久才展开，锚点取按下那一刻的坐标', async () => {
    const h = mount({ longPressDelay: PRESS_DELAY })
    pointer(h.trigger, 'pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 })
    expect(h.state()).toBe('pressing')
    expect(h.trigger.getAttribute('data-pressing')).toBe('')
    await wait(PRESS_DELAY * 3)
    expect(h.state()).toBe('open')
    expect(h.api().point).toEqual({ x: 30, y: 40 })
  })

  it('计时未到就抬手：不展开，一个回调也不发', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ longPressDelay: PRESS_DELAY, onOpenChange })
    pointer(h.trigger, 'pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 })
    pointer(h.trigger, 'pointerup', { pointerType: 'touch' })
    expect(h.state()).toBe('closed')
    await wait(PRESS_DELAY * 3)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('pointercancel（系统接管手势）同样取消长按', async () => {
    const h = mount({ longPressDelay: PRESS_DELAY })
    pointer(h.trigger, 'pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 })
    pointer(h.trigger, 'pointercancel', { pointerType: 'touch' })
    await wait(PRESS_DELAY * 3)
    expect(h.state()).toBe('closed')
  })

  it('手指滑走即取消；容差之内的抖动不算滑走', async () => {
    const slid = mount({ longPressDelay: PRESS_DELAY })
    pointer(slid.trigger, 'pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 })
    pointer(slid.trigger, 'pointermove', { pointerType: 'touch', clientX: 30, clientY: 90 })
    expect(slid.state()).toBe('closed')

    const jitter = mount({ longPressDelay: PRESS_DELAY })
    pointer(jitter.trigger, 'pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 })
    // 手指按住不动也会漂几像素，零容差等于长按永远触发不了
    pointer(jitter.trigger, 'pointermove', { pointerType: 'touch', clientX: 33, clientY: 43 })
    expect(jitter.state()).toBe('pressing')
    await wait(PRESS_DELAY * 3)
    expect(jitter.state()).toBe('open')
  })

  it('鼠标按住不动不当长按：否则拖选文字都会弹出菜单', async () => {
    const h = mount({ longPressDelay: PRESS_DELAY })
    pointer(h.trigger, 'pointerdown', { pointerType: 'mouse', button: 0, clientX: 30, clientY: 40 })
    expect(h.state()).toBe('closed')
    await wait(PRESS_DELAY * 3)
    expect(h.state()).toBe('closed')
  })

  it('收起态的指针移动不进机器：整块区域上的每次划过都送事件等于挂了个空转回调', () => {
    const h = mount()
    const before = h.api().point
    pointer(h.trigger, 'pointermove', { pointerType: 'touch', clientX: 500, clientY: 500 })
    expect(h.state()).toBe('closed')
    expect(h.api().point).toBe(before)
  })
})

describe('键盘入口', () => {
  it('菜单键与 Shift+F10 都能展开，锚点取触发区起始角', () => {
    for (const init of [{ key: 'ContextMenu' }, { key: 'F10', shiftKey: true }]) {
      const h = mount()
      h.trigger.getBoundingClientRect = (): DOMRect => ({
        x: 12,
        y: 34,
        width: 200,
        height: 100,
        top: 34,
        left: 12,
        right: 212,
        bottom: 134,
        toJSON: () => ({}),
      })
      const event = press(h.trigger, init.key, { shiftKey: init.shiftKey })
      expect(event.defaultPrevented).toBe(true)
      expect(h.state()).toBe('open')
      expect(h.api().point).toEqual({ x: 12, y: 34 })
      document.body.innerHTML = ''
    }
  })

  it('裸 F10 不归菜单管，也就绝不吞掉（浏览器菜单栏要用）', () => {
    const h = mount()
    const event = press(h.trigger, 'F10')
    expect(event.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')
  })
})

describe('connectContextMenu 属性输出', () => {
  it('触发区：全局 ARIA 属性 + Tab 位；不输出只对特定 role 有定义的 aria-expanded', () => {
    const h = mount()
    expect(h.trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.content.id)
    expect(h.trigger.getAttribute('aria-keyshortcuts')).toBe('Shift+F10')
    expect(h.trigger.getAttribute('tabindex')).toBe('0')
    expect(h.trigger.hasAttribute('aria-expanded')).toBe(false)
    expect(h.trigger.getAttribute('data-state')).toBe('closed')
  })

  it('content 是 menu 且自带名字；收起只 hidden，不卸载作者节点', () => {
    const h = mount()
    expect(h.content.getAttribute('role')).toBe('menu')
    // 触发区是作者的一整块内容且不带 role：指过去会把整块区域的文字算成菜单名
    expect(h.content.hasAttribute('aria-labelledby')).toBe(false)
    expect(h.content.getAttribute('aria-label')).toBe('Context menu')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(h.item('copy').isConnected).toBe(true)
    rightClick(h.trigger)
    expect(h.content.hasAttribute('hidden')).toBe(false)
    expect(h.positioner.getAttribute('data-state')).toBe('open')
    expect(h.positioner.getAttribute('data-placement')).toBe('bottom-start')
  })

  it('菜单名字可写：translations 覆盖默认那一份', () => {
    const h = mount({ translations: { content: '行操作' } })
    expect(h.content.getAttribute('aria-label')).toBe('行操作')
  })

  it('条目：role=menuitem，禁用走 aria-disabled 而非原生 disabled', () => {
    const h = mount()
    rightClick(h.trigger)
    expect(h.item('copy').getAttribute('role')).toBe('menuitem')
    expect(h.item('copy').getAttribute('aria-disabled')).toBe('false')
    expect(h.item('paste').getAttribute('aria-disabled')).toBe('true')
    // 原生 disabled 不可聚焦、也不派 click，禁用条目就再也当不成方向键的起点
    expect(h.item('paste').hasAttribute('disabled')).toBe(false)
    expect(h.item('paste').getAttribute('data-disabled')).toBe('')
  })

  it('分隔线与分组：分隔线不入集合，分组各自认领自己的标题', () => {
    const h = mount()
    expect(h.groupEl('edit').getAttribute('role')).toBe('group')
    expect(h.groupEl('edit').getAttribute('aria-labelledby')).toBe(h.groupLabel('edit').id)
    expect(h.groupEl('danger').getAttribute('aria-labelledby')).toBe(h.groupLabel('danger').id)
    expect(h.groupLabel('edit').id).not.toBe(h.groupLabel('danger').id)
  })

  it('条目文本与标记位跟着条目走同一份状态标记', () => {
    const h = mount()
    menuKey(h.trigger)
    expect(h.itemText('copy').getAttribute('data-highlighted')).toBe('')
    expect(h.itemText('paste').getAttribute('data-disabled')).toBe('')
    expect(h.itemText('delete').hasAttribute('data-highlighted')).toBe(false)
  })
})

describe('roving tabindex 与焦点锚点', () => {
  it('右键展开不预落锚点：一个条目都不高亮，Tab 位由 content 兜底', () => {
    const h = mount()
    rightClick(h.trigger)
    expect(h.api().focusedValue).toBeNull()
    expect(h.item('copy').getAttribute('tabindex')).toBe('-1')
    expect(h.item('copy').hasAttribute('data-highlighted')).toBe(false)
    expect(h.content.getAttribute('tabindex')).toBe('0')
  })

  it('键盘展开把锚点落到首个可用条目，整组只留一个 Tab 位', () => {
    const h = mount()
    menuKey(h.trigger)
    expect(h.api().focusedValue).toBe('copy')
    expect(h.item('copy').getAttribute('tabindex')).toBe('0')
    expect(h.item('paste').getAttribute('tabindex')).toBe('-1')
    expect(h.item('delete').getAttribute('tabindex')).toBe('-1')
    // 有条目认领 Tab 位，容器就让位
    expect(h.content.getAttribute('tabindex')).toBe('-1')
  })

  it('收起态没有锚点：条目连同 content 一起不可达', () => {
    const h = mount()
    expect(h.api().focusedValue).toBeNull()
    expect(h.item('copy').getAttribute('tabindex')).toBe('-1')
    expect(h.content.getAttribute('tabindex')).toBe('-1')
  })

  it('展开着却没有锚点时容器兜底，否则整个菜单一个 Tab 停靠点都没有', () => {
    const h = mount()
    // 命令式入口不预先落焦
    h.api().openAt(1, 1)
    expect(h.api().focusedValue).toBeNull()
    expect(h.content.getAttribute('tabindex')).toBe('0')
  })

  it('持有焦点的条目被移出 DOM：不补报离场就零个 Tab 停靠点', () => {
    // 浏览器不会为"被移除的节点带走了焦点"派 focusout（Chrome 如此），机器读不到这件事。
    // 两个适配器因此都在条目离场时补报 ITEM.LOST —— 这条用例钉的正是"不补报会怎样"。
    const h = mount()
    menuKey(h.trigger)
    expect(h.api().focusedValue).toBe('copy')
    h.item('copy').remove()
    h.render()
    // 锚点还指着一个已经不在文档里的条目：没人认领 tabindex=0，容器也判自己有锚点让了位
    expect(h.api().focusedValue).toBe('copy')
    expect(h.item('delete').getAttribute('tabindex')).toBe('-1')
    expect(h.content.getAttribute('tabindex')).toBe('-1')
    // 补报之后就地重挑（paste 禁用，跳到 delete）
    h.service.send({ type: 'ITEM.LOST' })
    expect(h.api().focusedValue).toBe('delete')
    expect(h.item('delete').getAttribute('tabindex')).toBe('0')
  })
})

describe('方向键导航', () => {
  it('跳过禁用条目并跨分组走，尽头回绕', () => {
    const h = mount()
    menuKey(h.trigger)
    press(h.content, 'ArrowDown')
    // paste 禁用，delete 在另一个分组里，中间还隔着分隔线
    expect(focused()).toBe('delete')
    press(h.content, 'ArrowDown')
    expect(focused()).toBe('copy')
    press(h.content, 'ArrowUp')
    expect(focused()).toBe('delete')
  })

  it('loop=false 时走到尽头原地不动', () => {
    const h = mount({ loop: false })
    menuKey(h.trigger)
    press(h.content, 'ArrowUp')
    expect(h.api().focusedValue).toBe('copy')
  })

  it('home / End 到端点，分隔线不入集合', () => {
    const h = mount()
    rightClick(h.trigger)
    press(h.content, 'End')
    expect(focused()).toBe('delete')
    press(h.content, 'Home')
    expect(focused()).toBe('copy')
  })

  it('禁用条目仍可聚焦，且仍是方向键的起点', () => {
    const h = mount()
    rightClick(h.trigger)
    h.item('paste').focus()
    expect(h.api().focusedValue).toBe('paste')
    press(h.content, 'ArrowDown')
    expect(focused()).toBe('delete')
  })

  it('左右键不归纵向菜单管，也就绝不吞掉', () => {
    const h = mount()
    menuKey(h.trigger)
    const event = press(h.content, 'ArrowRight')
    expect(event.defaultPrevented).toBe(false)
    expect(h.api().focusedValue).toBe('copy')
  })
})

describe('选中与关闭', () => {
  it('点击条目：先发选中详情再发关闭意图', () => {
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    const h = mount({ onSelect, onOpenChange })
    rightClick(h.trigger)
    onOpenChange.mockClear()
    click(h.item('delete'))
    expect(onSelect).toHaveBeenCalledExactlyOnceWith({ value: 'delete' })
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith({ open: false })
    expect(h.state()).toBe('closed')
    // 收起即清锚点
    expect(h.api().focusedValue).toBeNull()
  })

  it('禁用条目点不动：不选中、不关闭、一个事件也不发', () => {
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    const h = mount({ onSelect, onOpenChange })
    rightClick(h.trigger)
    onOpenChange.mockClear()
    click(h.item('paste'))
    expect(onSelect).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(h.state()).toBe('open')
  })

  it('enter / Space 认焦点所在条目，与点击同一条出口', () => {
    const onSelect = vi.fn()
    const h = mount({ onSelect })
    rightClick(h.trigger)
    h.item('copy').focus()
    const event = press(h.item('copy'), 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(onSelect).toHaveBeenCalledExactlyOnceWith({ value: 'copy' })
    expect(h.state()).toBe('closed')
  })

  it('焦点停在禁用条目上时确认键不认', () => {
    const onSelect = vi.fn()
    const h = mount({ onSelect })
    rightClick(h.trigger)
    h.item('paste').focus()
    press(h.item('paste'), 'Enter')
    expect(onSelect).not.toHaveBeenCalled()
    expect(h.state()).toBe('open')
  })

  it('tab 与层外交互关闭时不抢回焦点，其余出口归还触发区', () => {
    // 焦点归还策略记在 context 上，焦点域拆除那一刻读它：
    // Tab 是要去下一个控件、层外指针交互是用户已经点中了别的东西，抢回焦点会把光标从他刚点的地方拽走
    const tab = mount()
    rightClick(tab.trigger)
    press(tab.content, 'Tab')
    expect(tab.state()).toBe('closed')
    expect(tab.service.context.get('returnFocus')).toBe(false)

    const outside = mount()
    rightClick(outside.trigger)
    outside.service.send({ type: 'CLOSE', src: 'interact-outside' })
    expect(outside.service.context.get('returnFocus')).toBe(false)

    const esc = mount()
    rightClick(esc.trigger)
    esc.service.send({ type: 'CLOSE', src: 'esc' })
    expect(esc.service.context.get('returnFocus')).toBe(true)

    const picked = mount()
    rightClick(picked.trigger)
    click(picked.item('copy'))
    expect(picked.service.context.get('returnFocus')).toBe(true)
  })
})

describe('连打检索', () => {
  it('按首字母把焦点移到匹配条目，不选中它', () => {
    const onSelect = vi.fn()
    const h = mount({ onSelect })
    rightClick(h.trigger)
    const event = press(h.content, 'd')
    expect(event.defaultPrevented).toBe(true)
    expect(focused()).toBe('delete')
    expect(onSelect).not.toHaveBeenCalled()
    expect(h.state()).toBe('open')
  })

  it('跳过禁用条目：敲 p 落不到 paste 上', () => {
    const h = mount()
    menuKey(h.trigger)
    press(h.content, 'p')
    expect(h.api().focusedValue).toBe('copy')
  })

  it('缓冲区非空时空格算词中间的字符，不当确认键', () => {
    const onSelect = vi.fn()
    const h = mount({ onSelect })
    rightClick(h.trigger)
    press(h.content, 'd')
    expect(focused()).toBe('delete')
    press(h.item('delete'), ' ')
    // 查询串变成 "d "，匹配不上任何条目：焦点不动，更不该把 delete 选中
    expect(onSelect).not.toHaveBeenCalled()
    expect(h.state()).toBe('open')
  })

  it('typeahead 关掉后可打印字符一律放行', () => {
    const h = mount({ typeahead: false })
    menuKey(h.trigger)
    const event = press(h.content, 'd')
    expect(event.defaultPrevented).toBe(false)
    expect(h.api().focusedValue).toBe('copy')
  })

  it('菜单收起即丢缓冲：下次打开第一个字母不会被拼进上一轮', () => {
    const h = mount()
    rightClick(h.trigger)
    press(h.content, 'd')
    expect(focused()).toBe('delete')
    h.api().setOpen(false)
    rightClick(h.trigger)
    // 缓冲若没清，这一下的查询串会是 "dc"，谁也匹配不上
    press(h.content, 'c')
    expect(h.api().focusedValue).toBe('copy')
  })

  it('带 Ctrl 的组合不归检索管，也就绝不吞掉', () => {
    const h = mount()
    menuKey(h.trigger)
    const event = press(h.content, 'f', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(h.api().focusedValue).toBe('copy')
  })
})

describe('虚拟锚点定位', () => {
  it('展开后把光标那一点交给引擎：零尺寸矩形 + 贴着光标的间距', async () => {
    const h = mount()
    rightClick(h.trigger, 120, 80)
    await flushed()
    expect(h.engine.calls).toHaveLength(1)
    expect(h.engine.calls[0]!.rect).toEqual({ x: 120, y: 80, width: 0, height: 0 })
    // 引擎缺省间距是 8px（那是给"贴着一个触发按钮"准备的），右键菜单必须显式压成 0。
    // strategy 必须与 connect 产出的内联 position 同为 fixed：一处走岔就整族偏掉一个 scrollY。
    expect(h.engine.calls[0]!.options).toMatchObject({ placement: 'bottom-start', offset: 0, strategy: 'fixed' })
    // 箭头的量也交了出去：引擎量不到箭头，不交就算不出落点
    expect(h.engine.calls[0]!.options.arrow).toMatchObject({ size: expect.any(Number), padding: expect.any(Number) })
  })

  it('展开期间换坐标：重挂到新的一点，且先撤掉旧订阅', async () => {
    const h = mount()
    rightClick(h.trigger, 10, 10)
    await flushed()
    expect(h.engine.calls).toHaveLength(1)
    rightClick(h.trigger, 300, 200)
    await flushed()
    expect(h.engine.calls).toHaveLength(2)
    expect(h.engine.calls[1]!.rect).toEqual({ x: 300, y: 200, width: 0, height: 0 })
    // 旧订阅留着的话，两套 autoUpdate 会轮流往回写位置
    expect(h.engine.stopped).toBe(1)
  })

  it('同一坐标重复右键不白重挂', async () => {
    const h = mount()
    rightClick(h.trigger, 50, 50)
    await flushed()
    rightClick(h.trigger, 50, 50)
    await flushed()
    expect(h.engine.calls).toHaveLength(1)
  })

  it('收起即撤掉订阅，重挂钩子一并交还', async () => {
    const h = mount()
    rightClick(h.trigger, 50, 50)
    await flushed()
    h.api().setOpen(false)
    expect(h.engine.stopped).toBe(1)
    // 收起后再改坐标不该再挂上去
    h.api().openAt(60, 60)
    await flushed()
    expect(h.engine.calls).toHaveLength(2)
  })

  it('引擎结果没回来之前，浮层先落在光标坐标上', () => {
    const h = mount()
    rightClick(h.trigger, 120, 80)
    const style = h.api().getPositionerProps().style as Record<string, string>
    expect(style.left).toBe('120px')
    expect(style.top).toBe('80px')
  })
})
