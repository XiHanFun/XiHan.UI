// @vitest-environment jsdom
// 悬停意图的判据：安全三角几何用手算坐标核对；跟踪器用假定时器走完
// 「进-延时开」「斜穿三角不收」「走岔即收」「停滞超时收」四条路径。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pointInPolygon, safeTriangle, trackHoverIntent } from '../src'

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
  let openIntent: ReturnType<typeof vi.fn>
  let closeIntent: ReturnType<typeof vi.fn>
  let dispose: (() => void) | null = null

  function mount(opts: { openDelay?: number, closeDelay?: number } = {}): void {
    dispose = trackHoverIntent({
      getTriggerEl: () => trigger,
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
    openIntent = vi.fn()
    closeIntent = vi.fn()
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
