// @vitest-environment jsdom
// 悬停意图的判据：安全三角几何用手算坐标核对；跟踪器用假定时器走完
// 「进-延时开」「斜穿三角不收」「走岔即收」「停滞超时收」四条路径。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pointInPolygon, safeTriangle, trackHoverIntent } from '../src/behavior'

describe('pointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ]

  it('内外与边界', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
    expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false)
    expect(pointInPolygon({ x: -1, y: 5 }, square)).toBe(false)
    // 水平边上算在内
    expect(pointInPolygon({ x: 5, y: 0 }, square)).toBe(true)
  })

  it('三角形斜边两侧', () => {
    const tri = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ]
    expect(pointInPolygon({ x: 2, y: 2 }, tri)).toBe(true)
    expect(pointInPolygon({ x: 8, y: 8 }, tri)).toBe(false)
  })

  it('退化输入（少于三点）恒为外', () => {
    expect(pointInPolygon({ x: 0, y: 0 }, [])).toBe(false)
    expect(pointInPolygon({ x: 0, y: 0 }, [{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false)
  })
})

describe('safeTriangle', () => {
  it('出发点在目标左侧：取左边线两角并外扩', () => {
    const tri = safeTriangle({ x: 0, y: 50 }, { x: 100, y: 20, width: 80, height: 60 }, 6)
    expect(tri).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 14 },
      { x: 100, y: 86 },
    ])
  })

  it('出发点在目标右侧：取右边线', () => {
    const tri = safeTriangle({ x: 300, y: 50 }, { x: 100, y: 20, width: 80, height: 60 }, 6)
    expect(tri[1]!.x).toBe(180)
    expect(tri[2]!.x).toBe(180)
  })

  it('出发点在目标上方：取上边线', () => {
    const tri = safeTriangle({ x: 140, y: 0 }, { x: 100, y: 100, width: 80, height: 60 }, 6)
    expect(tri[1]!.y).toBe(100)
    expect(tri[2]!.y).toBe(100)
    expect(tri[1]!.x).toBe(94)
    expect(tri[2]!.x).toBe(186)
  })

  it('斜穿路径落在三角内', () => {
    const tri = safeTriangle({ x: 0, y: 50 }, { x: 100, y: 20, width: 80, height: 60 })
    // 直线赶路的中途点
    expect(pointInPolygon({ x: 50, y: 45 }, tri)).toBe(true)
    // 明显走岔（反方向）
    expect(pointInPolygon({ x: 50, y: 120 }, tri)).toBe(false)
  })

  it('出发点已在矩形内：退化为整框外扩', () => {
    const poly = safeTriangle({ x: 110, y: 30 }, { x: 100, y: 20, width: 80, height: 60 }, 6)
    expect(poly).toHaveLength(4)
    expect(pointInPolygon({ x: 100, y: 20 }, poly)).toBe(true)
  })
})

describe('trackHoverIntent', () => {
  let trigger: HTMLElement
  let content: HTMLElement | null
  let openIntent: ReturnType<typeof vi.fn<() => void>>
  let closeIntent: ReturnType<typeof vi.fn<() => void>>
  let dispose: (() => void) | null = null

  function mount(opts: { openDelay?: number, closeDelay?: number } = {}): void {
    dispose = trackHoverIntent({
      trigger,
      getContentEl: () => content,
      openDelay: opts.openDelay ?? 100,
      closeDelay: opts.closeDelay ?? 300,
      onOpenIntent: openIntent,
      onCloseIntent: closeIntent,
    })
  }

  function pointer(type: string, target: EventTarget, x = 0, y = 0, relatedTarget: EventTarget | null = null): void {
    const event = new Event(type, { bubbles: true }) as PointerEvent
    Object.defineProperties(event, {
      clientX: { value: x },
      clientY: { value: y },
      relatedTarget: { value: relatedTarget },
    })
    target.dispatchEvent(event)
  }

  beforeEach(() => {
    vi.useFakeTimers()
    trigger = document.createElement('button')
    document.body.appendChild(trigger)
    content = null
    openIntent = vi.fn<() => void>()
    closeIntent = vi.fn<() => void>()
  })

  afterEach(() => {
    dispose?.()
    dispose = null
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  function mountContent(rect: { x: number, y: number, width: number, height: number }): HTMLElement {
    const el = document.createElement('div')
    el.getBoundingClientRect = () =>
      ({ ...rect, top: rect.y, left: rect.x, right: rect.x + rect.width, bottom: rect.y + rect.height, toJSON: () => ({}) }) as DOMRect
    document.body.appendChild(el)
    return el
  }

  it('进触发器延时报开；提前离开不报', () => {
    mount()
    pointer('pointerenter', trigger)
    vi.advanceTimersByTime(99)
    expect(openIntent).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(openIntent).toHaveBeenCalledTimes(1)

    pointer('pointerenter', trigger)
    pointer('pointerleave', trigger, 0, 0)
    vi.advanceTimersByTime(200)
    expect(openIntent).toHaveBeenCalledTimes(1)
  })

  it('浮层没开时离开触发器：closeDelay 后报关', () => {
    mount()
    pointer('pointerleave', trigger)
    vi.advanceTimersByTime(299)
    expect(closeIntent).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(closeIntent).toHaveBeenCalledTimes(1)
  })

  it('斜穿安全三角赶往浮层：路上不报关，走岔立即报', () => {
    mount()
    content = mountContent({ x: 100, y: 20, width: 80, height: 60 })
    // 从 (0,50) 离开，浮层在右侧
    pointer('pointerleave', trigger, 0, 50)
    // 在三角里挪：续命
    pointer('pointermove', document, 40, 48)
    vi.advanceTimersByTime(250)
    expect(closeIntent).not.toHaveBeenCalled()
    // 走岔出三角：立即报关
    pointer('pointermove', document, 40, 200)
    expect(closeIntent).toHaveBeenCalledTimes(1)
  })

  it('在三角里停滞超过 closeDelay：报关', () => {
    mount()
    content = mountContent({ x: 100, y: 20, width: 80, height: 60 })
    pointer('pointerleave', trigger, 0, 50)
    pointer('pointermove', document, 30, 48)
    vi.advanceTimersByTime(300)
    expect(closeIntent).toHaveBeenCalledTimes(1)
  })

  it('半路到站（指针进浮层）：撤销关意图，之后离开浮层才报', () => {
    mount()
    content = mountContent({ x: 100, y: 20, width: 80, height: 60 })
    pointer('pointerleave', trigger, 0, 50)
    // composedPath 里带上 content：视为到站
    const arrive = new Event('pointermove', { bubbles: true }) as PointerEvent
    Object.defineProperties(arrive, { clientX: { value: 120 }, clientY: { value: 40 } })
    Object.defineProperty(arrive, 'composedPath', { value: () => [content, document.body, document] })
    document.dispatchEvent(arrive)
    vi.advanceTimersByTime(1000)
    expect(closeIntent).not.toHaveBeenCalled()

    // 到站时监听已补挂：离开浮层按 closeDelay 报关
    pointer('pointerleave', content!, 200, 200)
    vi.advanceTimersByTime(300)
    expect(closeIntent).toHaveBeenCalledTimes(1)
  })

  it('拆除后一切静默', () => {
    mount()
    pointer('pointerenter', trigger)
    dispose!()
    dispose = null
    vi.advanceTimersByTime(1000)
    expect(openIntent).not.toHaveBeenCalled()
  })
})

describe('trackHoverIntent 所属 realm 与资源生命周期', () => {
  function foreignElements(): {
    frame: HTMLIFrameElement
    doc: Document
    win: Window & typeof globalThis
    trigger: HTMLElement
    content: HTMLElement
  } {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    const win = frame.contentWindow! as Window & typeof globalThis
    const trigger = doc.createElement('button')
    const content = doc.createElement('div')
    doc.body.append(trigger, content)
    return { frame, doc, win, trigger, content }
  }

  function pointerIn(
    win: Window & typeof globalThis,
    type: string,
    target: EventTarget,
    x = 0,
    y = 0,
    relatedTarget: EventTarget | null = null,
  ): void {
    const event = new win.Event(type, { bubbles: true }) as PointerEvent
    Object.defineProperties(event, {
      clientX: { value: x },
      clientY: { value: y },
      relatedTarget: { value: relatedTarget },
    })
    target.dispatchEvent(event)
  }

  function bridgeTimers(win: Window & typeof globalThis): {
    set: ReturnType<typeof vi.spyOn>
    clear: ReturnType<typeof vi.spyOn>
  } {
    const schedule = window.setTimeout.bind(window)
    const cancel = window.clearTimeout.bind(window)
    const set = vi.spyOn(win, 'setTimeout').mockImplementation((handler, timeout, ...args) =>
      schedule(handler, timeout, ...args))
    const clear = vi.spyOn(win, 'clearTimeout').mockImplementation(handle => cancel(handle))
    return { set, clear }
  }

  function track(options: {
    trigger: HTMLElement
    getContentEl: () => HTMLElement | null
    openDelay?: number
    closeDelay?: number
    buffer?: number
    onOpenIntent: () => void
    onCloseIntent: () => void
  }): () => void {
    return trackHoverIntent(options)
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('iframe 的直接互转与计时器都使用所属 Window', () => {
    const { win, trigger, content } = foreignElements()
    const timers = bridgeTimers(win)
    const open = vi.fn()
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      openDelay: 100,
      closeDelay: 300,
      onOpenIntent: open,
      onCloseIntent: close,
    })

    pointerIn(win, 'pointerenter', trigger)
    expect(timers.set).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(100)
    expect(open).toHaveBeenCalledTimes(1)

    pointerIn(win, 'pointerleave', trigger, 0, 0, content)
    vi.advanceTimersByTime(300)
    expect(close).not.toHaveBeenCalled()
    pointerIn(win, 'pointerleave', content, 0, 0, trigger)
    vi.advanceTimersByTime(300)
    expect(close).not.toHaveBeenCalled()
    pointerIn(win, 'pointerleave', trigger)
    pointerIn(win, 'pointerenter', content)
    expect(timers.clear).toHaveBeenCalled()
    stop()
  })

  it('安全三角只监听触发器所属 Document', () => {
    const { doc, win, trigger, content } = foreignElements()
    bridgeTimers(win)
    content.getBoundingClientRect = () => ({
      x: 100,
      y: 20,
      width: 80,
      height: 60,
      top: 20,
      left: 100,
      right: 180,
      bottom: 80,
      toJSON: () => ({}),
    }) as DOMRect
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })

    pointerIn(win, 'pointerleave', trigger, 0, 50)
    pointerIn(win, 'pointermove', doc, 40, 200)
    expect(close).toHaveBeenCalledTimes(1)
    stop()
  })

  it('顶层 DOM globals 缺失时显式外部节点仍可直接互转', () => {
    const { win, trigger, content } = foreignElements()
    bridgeTimers(win)
    let runtimeError: unknown = null
    const onError = (event: ErrorEvent): void => {
      runtimeError = event.error
      event.preventDefault()
    }
    win.addEventListener('error', onError)
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('Node', undefined)
    vi.stubGlobal('Element', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })

    pointerIn(win, 'pointerleave', trigger, 0, 0, content)
    vi.advanceTimersByTime(300)
    expect(runtimeError).toBeNull()
    expect(close).not.toHaveBeenCalled()
    stop()
    win.removeEventListener('error', onError)
  })

  it('content 换代后旧节点事件完全静默', () => {
    const trigger = document.createElement('button')
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(trigger, first, second)
    let content: HTMLElement | null = first
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })
    pointerIn(window, 'pointerenter', trigger)
    content = second
    pointerIn(window, 'pointerenter', trigger)

    pointerIn(window, 'pointerleave', first)
    vi.advanceTimersByTime(300)
    expect(close).not.toHaveBeenCalled()
    pointerIn(window, 'pointerleave', second)
    vi.advanceTimersByTime(300)
    expect(close).toHaveBeenCalledTimes(1)
    stop()
  })

  it('重复建立安全三角不会遗留旧的 Document 监听', () => {
    const trigger = document.createElement('button')
    const content = document.createElement('div')
    document.body.append(trigger, content)
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const stop = track({
      trigger,
      getContentEl: () => content,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    })

    pointerIn(window, 'pointerleave', trigger)
    pointerIn(window, 'pointerleave', trigger)
    expect(remove.mock.calls.filter(([type]) => type === 'pointermove')).toHaveLength(1)
    stop()
    const added = add.mock.calls.filter(([type]) => type === 'pointermove').length
    const removed = remove.mock.calls.filter(([type]) => type === 'pointermove').length
    expect(added).toBe(2)
    expect(removed).toBe(added)
  })

  it('跨 Document content 与非法数值在创建阶段明确失败且不挂监听', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    const { content } = foreignElements()
    const add = vi.spyOn(trigger, 'addEventListener')
    expect(() => track({
      trigger,
      getContentEl: () => content,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    })).toThrow(/content.*同一 Document/)
    expect(add).not.toHaveBeenCalled()

    expect(() => track({
      trigger,
      getContentEl: () => null,
      openDelay: Number.NaN,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    })).toThrow(/openDelay.*非负有限数/)
    expect(add).not.toHaveBeenCalled()
  })

  it('缺失、非 HTMLElement 与离线 Document trigger 均明确失败', () => {
    const base = {
      getContentEl: () => null,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    }
    expect(() => trackHoverIntent({ ...base, trigger: null as never })).toThrow(/trigger.*原生 HTMLElement/)
    expect(() => trackHoverIntent({ ...base, trigger: document.createElementNS('http://www.w3.org/2000/svg', 'svg') as never })).toThrow(/trigger.*原生 HTMLElement/)

    const offline = document.implementation.createHTMLDocument('offline')
    const trigger = offline.createElement('button')
    offline.body.appendChild(trigger)
    expect(() => trackHoverIntent({ ...base, trigger })).toThrow(/没有活动 Window/)
  })

  it.each([
    ['openDelay', Number.NaN],
    ['closeDelay', Number.POSITIVE_INFINITY],
    ['buffer', -1],
  ] as const)('%s 拒绝非有限或负数', (name, value) => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    expect(() => trackHoverIntent({
      trigger,
      getContentEl: () => null,
      [name]: value,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    })).toThrow(new RegExp(`${name}.*非负有限数`))
  })

  it('从其他 Window adopt 后的 content 按当前 Document 生效', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    const { frame, content: source } = foreignElements()
    const content = document.adoptNode(source)
    document.body.appendChild(content)
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })

    pointerIn(window, 'pointerleave', trigger, 0, 0, content)
    vi.advanceTimersByTime(300)
    expect(close).not.toHaveBeenCalled()
    stop()
    frame.remove()
  })

  it('初始 content 立即具备监听且重复 dispose 不重复拆除', () => {
    const trigger = document.createElement('button')
    const content = document.createElement('div')
    document.body.append(trigger, content)
    const close = vi.fn()
    const removeTrigger = vi.spyOn(trigger, 'removeEventListener')
    const removeContent = vi.spyOn(content, 'removeEventListener')
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })

    pointerIn(window, 'pointerleave', content)
    vi.advanceTimersByTime(300)
    expect(close).toHaveBeenCalledTimes(1)
    stop()
    stop()
    expect(removeTrigger.mock.calls.filter(([type]) => type.startsWith('pointer'))).toHaveLength(2)
    expect(removeContent.mock.calls.filter(([type]) => type.startsWith('pointer'))).toHaveLength(2)
  })

  it('travel 期间 content 换代会按原离开点重算安全三角', () => {
    const trigger = document.createElement('button')
    const right = document.createElement('div')
    const left = document.createElement('div')
    right.getBoundingClientRect = () => ({
      x: 100,
      y: 20,
      width: 80,
      height: 60,
      top: 20,
      left: 100,
      right: 180,
      bottom: 80,
      toJSON: () => ({}),
    }) as DOMRect
    left.getBoundingClientRect = () => ({
      x: -180,
      y: 20,
      width: 80,
      height: 60,
      top: 20,
      left: -180,
      right: -100,
      bottom: 80,
      toJSON: () => ({}),
    }) as DOMRect
    document.body.append(trigger, right, left)
    let content = right
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })

    pointerIn(window, 'pointerleave', trigger, 0, 50)
    content = left
    pointerIn(window, 'pointermove', document, -40, 50)
    expect(close).not.toHaveBeenCalled()
    vi.advanceTimersByTime(299)
    expect(close).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(close).toHaveBeenCalledTimes(1)
    stop()
  })

  it('travel 期间 content 暂时离场后仍能跟随重新出现的新节点', () => {
    const trigger = document.createElement('button')
    const right = document.createElement('div')
    const left = document.createElement('div')
    right.getBoundingClientRect = () => ({
      x: 100,
      y: 20,
      width: 80,
      height: 60,
      top: 20,
      left: 100,
      right: 180,
      bottom: 80,
      toJSON: () => ({}),
    }) as DOMRect
    left.getBoundingClientRect = () => ({
      x: -180,
      y: 20,
      width: 80,
      height: 60,
      top: 20,
      left: -180,
      right: -100,
      bottom: 80,
      toJSON: () => ({}),
    }) as DOMRect
    document.body.append(trigger, right, left)
    let content: HTMLElement | null = right
    const close = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => content,
      closeDelay: 300,
      onOpenIntent: () => {},
      onCloseIntent: close,
    })

    pointerIn(window, 'pointerleave', trigger, 0, 50)
    content = null
    pointerIn(window, 'pointermove', document, 20, 50)
    content = left
    pointerIn(window, 'pointermove', document, -40, 50)
    vi.advanceTimersByTime(299)
    expect(close).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(close).toHaveBeenCalledTimes(1)
    stop()
  })

  it('content getter 重入 dispose 后不会重新绑定或安排计时器', () => {
    const trigger = document.createElement('button')
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(trigger, first, second)
    let content = first
    let disposeDuringRead = false
    let stop = (): void => {}
    const open = vi.fn()
    const addSecond = vi.spyOn(second, 'addEventListener')
    stop = track({
      trigger,
      getContentEl: () => {
        if (disposeDuringRead)
          stop()
        return content
      },
      openDelay: 100,
      onOpenIntent: open,
      onCloseIntent: () => {},
    })

    content = second
    disposeDuringRead = true
    pointerIn(window, 'pointerenter', trigger)
    vi.advanceTimersByTime(100)
    expect(addSecond).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
    stop()
  })

  it('计时器编号为零时仍会被清理', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    const clear = vi.spyOn(window, 'clearTimeout')
    vi.spyOn(window, 'setTimeout').mockReturnValue(0)
    const stop = track({
      trigger,
      getContentEl: () => null,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    })

    pointerIn(window, 'pointerenter', trigger)
    pointerIn(window, 'pointerenter', trigger)
    expect(clear).toHaveBeenCalledWith(0)
    stop()
  })

  it('trigger 在计时期间被 adopt 时拒绝旧 realm 回调', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const open = vi.fn()
    const stop = track({
      trigger,
      getContentEl: () => null,
      openDelay: 100,
      onOpenIntent: open,
      onCloseIntent: () => {},
    })
    pointerIn(window, 'pointerenter', trigger)
    frame.contentDocument!.adoptNode(trigger)

    expect(() => vi.advanceTimersByTime(100)).toThrow(/更换所属 Document/)
    expect(open).not.toHaveBeenCalled()
    stop()
    frame.remove()
  })

  it('trigger 监听初始化失败时撤销已经绑定的 content', () => {
    const trigger = document.createElement('button')
    const content = document.createElement('div')
    document.body.append(trigger, content)
    const removeContent = vi.spyOn(content, 'removeEventListener')
    vi.spyOn(trigger, 'addEventListener').mockImplementationOnce(() => {
      throw new Error('trigger listener failed')
    })

    expect(() => track({
      trigger,
      getContentEl: () => content,
      onOpenIntent: () => {},
      onCloseIntent: () => {},
    })).toThrow('trigger listener failed')
    expect(removeContent.mock.calls.filter(([type]) => type.startsWith('pointer'))).toHaveLength(2)
  })
})
