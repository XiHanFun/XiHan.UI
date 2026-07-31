// @vitest-environment jsdom
import type { Orientation } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ScrollAreaApi, ScrollAreaSchema } from '../src/scroll-area'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import {
  connectScrollArea,
  isOverflowing,
  maxScrollOffset,
  pointerDelta,
  SCROLL_AREA_MIN_THUMB_SIZE,
  scrollAreaMachine,
  scrollbarGeometry,
  scrollFromThumbDrag,
  scrollFromTrackPoint,
  thumbOffsetRatio,
  thumbSizeRatio,
  toDomScroll,
  toLogicalScroll,
  trackOffset,
} from '../src/scroll-area'

type Props = ScrollAreaSchema['props']
type Dict = Record<string, unknown>

// ───────────────────────── 几何：纯函数，不碰 DOM ─────────────────────────

/** 视口 100、内容 400、轨道 100：滑块比例 1/4，能走的距离 75px，可滚 300px。 */
const M = { viewport: 100, content: 400, scroll: 0, track: 100 }

describe('maxScrollOffset', () => {
  it('内容比视口长多少就能滚多少', () => {
    expect(maxScrollOffset({ viewport: 100, content: 400 })).toBe(300)
  })

  it('内容比视口短时给 0，不给负数', () => {
    // 负的余量会让后面的除法把滑块位置算成负比例，滑块直接跑出轨道
    expect(maxScrollOffset({ viewport: 400, content: 100 })).toBe(0)
  })
})

describe('isOverflowing', () => {
  it('差一整格以上才算溢出', () => {
    expect(isOverflowing({ viewport: 100, content: 102 })).toBe(true)
  })

  it('半像素级的差额不算：那样的容器根本滚不动', () => {
    // clientHeight 取整而 scrollHeight 不取整，不留这一格就会常年挂着一条按不动的滚动条
    expect(isOverflowing({ viewport: 100, content: 100.5 })).toBe(false)
    expect(isOverflowing({ viewport: 100, content: 100 })).toBe(false)
  })

  it('还没量到尺寸（全是 0）时不算溢出', () => {
    expect(isOverflowing({ viewport: 0, content: 0 })).toBe(false)
  })
})

describe('thumbSizeRatio', () => {
  it('滑块长度就是视口占内容的比例', () => {
    expect(thumbSizeRatio(M, 0)).toBe(0.25)
  })

  it('比例太小时兜住像素下限', () => {
    // 一万像素的内容配一百像素的视口，纯按比例只有 1px，按都按不住
    expect(thumbSizeRatio({ viewport: 100, content: 10000, scroll: 0, track: 100 })).toBe(0.2)
    expect(SCROLL_AREA_MIN_THUMB_SIZE).toBe(20)
  })

  it('轨道还没量到（收起的滚动条 clientHeight 是 0）时只用比例，不做除零', () => {
    const ratio = thumbSizeRatio({ viewport: 100, content: 10000, scroll: 0, track: 0 })
    expect(ratio).toBeCloseTo(0.01, 6)
  })

  it('不溢出或尺寸全空时铺满轨道', () => {
    expect(thumbSizeRatio({ viewport: 400, content: 100, scroll: 0, track: 100 })).toBe(1)
    expect(thumbSizeRatio({ viewport: 0, content: 0, scroll: 0, track: 0 })).toBe(1)
  })
})

describe('thumbOffsetRatio', () => {
  it('顶端是 0', () => {
    expect(thumbOffsetRatio(M, 0)).toBe(0)
  })

  it('滚到底时滑块起点停在 1 - 滑块长度，而不是 1', () => {
    // 直接用已滚比例的话，滑块会整个滑出轨道
    expect(thumbOffsetRatio({ ...M, scroll: 300 }, 0)).toBe(0.75)
  })

  it('中间按比例线性走', () => {
    expect(thumbOffsetRatio({ ...M, scroll: 150 }, 0)).toBe(0.375)
  })

  it('滚不动时恒为 0，不产生 NaN', () => {
    expect(thumbOffsetRatio({ viewport: 100, content: 100, scroll: 0, track: 100 })).toBe(0)
  })

  it('滚动量越界也夹在轨道内', () => {
    expect(thumbOffsetRatio({ ...M, scroll: 9999 }, 0)).toBe(0.75)
    expect(thumbOffsetRatio({ ...M, scroll: -50 }, 0)).toBe(0)
  })
})

describe('scrollbarGeometry', () => {
  it('内容比视口短时整体不显形', () => {
    const g = scrollbarGeometry({ viewport: 300, content: 100, scroll: 0, track: 100 })
    expect(g.overflow).toBe(false)
  })

  it('溢出时给出可用的长度与位置', () => {
    const g = scrollbarGeometry({ ...M, scroll: 150 }, 0)
    expect(g).toEqual({ overflow: true, size: 0.25, offset: 0.375 })
  })
})

describe('toLogicalScroll / toDomScroll', () => {
  it('竖轴原样透传', () => {
    expect(toLogicalScroll(120, { axis: 'vertical', dir: 'rtl' })).toBe(120)
    expect(toDomScroll(120, { axis: 'vertical', dir: 'rtl' })).toBe(120)
  })

  it('从右往左排版时横轴：DOM 里是负数，对外一律是非负的"距逻辑起始缘"', () => {
    expect(toLogicalScroll(-120, { axis: 'horizontal', dir: 'rtl' })).toBe(120)
    expect(toDomScroll(120, { axis: 'horizontal', dir: 'rtl' })).toBe(-120)
  })

  it('从左往右排版时横轴不翻', () => {
    expect(toLogicalScroll(120, { axis: 'horizontal', dir: 'ltr' })).toBe(120)
    expect(toDomScroll(120, { axis: 'horizontal' })).toBe(120)
  })
})

describe('pointerDelta', () => {
  it('常规情形就是屏幕位移', () => {
    expect(pointerDelta(10, 40, { axis: 'vertical' })).toBe(30)
    expect(pointerDelta(10, 40, { axis: 'horizontal', dir: 'ltr' })).toBe(30)
  })

  it('从右往左排版时横轴反号：手往左移是滚动量变大', () => {
    expect(pointerDelta(40, 10, { axis: 'horizontal', dir: 'rtl' })).toBe(30)
  })

  it('从右往左排版不影响竖轴', () => {
    expect(pointerDelta(10, 40, { axis: 'vertical', dir: 'rtl' })).toBe(30)
  })
})

describe('trackOffset', () => {
  const RECT = { x: 100, y: 50, width: 200, height: 300 }

  it('竖直轨道从上缘量起', () => {
    expect(trackOffset({ clientX: 0, clientY: 200 }, RECT, { axis: 'vertical' })).toBe(150)
  })

  it('水平轨道从起始缘量起', () => {
    expect(trackOffset({ clientX: 180, clientY: 0 }, RECT, { axis: 'horizontal' })).toBe(80)
  })

  it('从右往左排版时水平轨道的起始缘在右侧', () => {
    expect(trackOffset({ clientX: 180, clientY: 0 }, RECT, { axis: 'horizontal', dir: 'rtl' })).toBe(120)
  })
})

describe('scrollFromThumbDrag', () => {
  it('位移按"滑块能走的距离"换算，不是按整条轨道', () => {
    // 轨道 100、滑块 25 → 能走 75；走 30px 即滚过 30/75 = 40% 的可滚量
    expect(scrollFromThumbDrag(0, 30, M, 0)).toBe(120)
  })

  it('两端夹住', () => {
    expect(scrollFromThumbDrag(0, 9999, M, 0)).toBe(300)
    expect(scrollFromThumbDrag(100, -9999, M, 0)).toBe(0)
  })

  it('轨道没量到时停在原处，不除出 Infinity', () => {
    expect(scrollFromThumbDrag(120, 30, { ...M, track: 0 }, 0)).toBe(120)
  })

  it('滚不动时恒为 0', () => {
    expect(scrollFromThumbDrag(0, 50, { viewport: 400, content: 100, scroll: 0, track: 100 })).toBe(0)
  })
})

describe('scrollFromTrackPoint', () => {
  it('点在轨道正中，内容也停在正中——落点对齐的是滑块中心', () => {
    // 用落点当滑块起点的话，内容会整体偏掉半个滑块的距离
    expect(scrollFromTrackPoint(50, M, 0)).toBe(150)
  })

  it('点在两端夹到端点', () => {
    expect(scrollFromTrackPoint(0, M, 0)).toBe(0)
    expect(scrollFromTrackPoint(100, M, 0)).toBe(300)
  })

  it('滚不动时不动', () => {
    expect(scrollFromTrackPoint(50, { viewport: 400, content: 100, scroll: 0, track: 100 })).toBe(0)
  })
})

// ───────────────────────── 机器 + 连接层：活 DOM ─────────────────────────

interface BoxSize {
  clientH: number
  clientW: number
  scrollH: number
  scrollW: number
}

/**
 * jsdom 不做布局，clientHeight/scrollHeight 恒是 0——机器会当成"没有溢出"，
 * 滚动条一条也不会显形。这里把四个尺寸桩在真实节点上，滚动量则做成可读可写的，
 * 与浏览器一样在两端夹住（拖出边界时要能验到"停在端点"）。
 */
function stubBox(el: HTMLElement, size: BoxSize): void {
  let top = 0
  let left = 0
  const maxTop = Math.max(0, size.scrollH - size.clientH)
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => size.clientH },
    clientWidth: { configurable: true, get: () => size.clientW },
    scrollHeight: { configurable: true, get: () => size.scrollH },
    scrollWidth: { configurable: true, get: () => size.scrollW },
    scrollTop: {
      configurable: true,
      get: () => top,
      set: (v: number) => {
        top = Math.min(Math.max(v, 0), maxTop)
      },
    },
    scrollLeft: {
      configurable: true,
      get: () => left,
      set: (v: number) => {
        left = v
      },
    },
  })
}

/** 滚动条只有轨道长度要紧；点击轨道那一路还要一个矩形。 */
function stubBar(el: HTMLElement, length: number, axis: Orientation): void {
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => (axis === 'vertical' ? length : 10) },
    clientWidth: { configurable: true, get: () => (axis === 'vertical' ? 10 : length) },
  })
  el.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: axis === 'vertical' ? 10 : length,
    height: axis === 'vertical' ? length : 10,
    top: 0,
    left: 0,
    right: axis === 'vertical' ? 10 : length,
    bottom: axis === 'vertical' ? length : 10,
    toJSON: () => ({}),
  }) as DOMRect
}

interface Rig {
  service: Service<ScrollAreaSchema>
  viewport: HTMLElement
  content: HTMLElement
  bars: Record<Orientation, HTMLElement>
  api: () => ScrollAreaApi
  setProps: (next: Props) => void
  stop: () => void
}

function makeRig(initial: Props = {}, size: BoxSize = { clientH: 100, clientW: 100, scrollH: 400, scrollW: 400 }): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(scrollAreaMachine, { props: () => props.get(), runtime })

  const make = (part: string): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'scroll-area')
    el.setAttribute('data-part', part)
    return el
  }
  const root = make('root')
  const viewport = make('viewport')
  const content = make('content')
  const bars: Record<Orientation, HTMLElement> = { vertical: make('scrollbar'), horizontal: make('scrollbar') }
  viewport.appendChild(content)
  root.append(viewport, bars.vertical, bars.horizontal)
  document.body.appendChild(root)

  stubBox(viewport, size)
  stubBar(bars.vertical, 100, 'vertical')
  stubBar(bars.horizontal, 100, 'horizontal')

  service.refs.set('getViewportEl', () => viewport)
  service.refs.set('getContentEl', () => content)
  service.refs.set('getScrollbarEl', (axis: Orientation) => bars[axis])

  runtime.start()

  return {
    service,
    viewport,
    content,
    bars,
    api: () => connectScrollArea(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
}

/** 效应挂载与 measureSoon 都推迟一拍（queueMicrotask），等它们跑完再断言。 */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

function barProps(rig: Rig, axis: Orientation = 'vertical'): Dict {
  return rig.api().getScrollbarProps({ orientation: axis }) as Dict
}

function thumbProps(rig: Rig, axis: Orientation = 'vertical'): Dict {
  return rig.api().getThumbProps({ orientation: axis }) as Dict
}

/** 原生滚动：改滚动量再派 scroll 事件，与浏览器同序。 */
function scrollViewport(rig: Rig, top: number): void {
  rig.viewport.scrollTop = top
  rig.viewport.dispatchEvent(new Event('scroll'))
}

function pointer(type: string, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { button: 0, bubbles: true, cancelable: true, ...init })
}

const rigs: Rig[] = []
function rig(initial?: Props, size?: BoxSize): Rig {
  const created = makeRig(initial, size)
  rigs.push(created)
  return created
}

afterEach(() => {
  while (rigs.length) rigs.pop()!.stop()
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('挂载与测量', () => {
  it('推迟一拍后量到尺寸：溢出被认出来', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(r.service.context.get('vertical')).toEqual({ viewport: 100, content: 400, scroll: 0, track: 100 })
    expect(r.api().vertical.overflow).toBe(true)
  })

  it('原生滚动后滑块跟着走：位置来自 context，连接层不读 DOM', async () => {
    const r = rig({ type: 'always' })
    await settle()
    scrollViewport(r, 150)
    expect(r.api().vertical.offset).toBe(0.375)
    expect((thumbProps(r).style as Dict).insetBlockStart).toBe('37.5%')
    expect((thumbProps(r).style as Dict).blockSize).toBe('25%')
  })

  it('横轴滑块写 inline 那条轴，竖轴那条清空——换轴时不会两轴都被钉住', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const style = thumbProps(r, 'horizontal').style as Dict
    expect(style.insetInlineStart).toBe('0%')
    expect(style.inlineSize).toBe('25%')
    expect(style.insetBlockStart).toBe('')
    expect(style.blockSize).toBe('')
  })

  it('尺寸没变就不重写 context：滚动一次不会把没动的那条轴也判成变了', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const before = r.service.context.get('horizontal')
    scrollViewport(r, 40)
    expect(r.service.context.get('horizontal')).toBe(before)
    expect(r.service.context.get('vertical').scroll).toBe(40)
  })

  it('停机后摘掉 scroll 监听与尺寸观察器', async () => {
    const win = document.defaultView as unknown as Record<string, unknown>
    const observed: HTMLElement[] = []
    let disconnected = 0
    win.ResizeObserver = class {
      observe(el: HTMLElement): void {
        observed.push(el)
      }

      disconnect(): void {
        disconnected += 1
      }

      unobserve(): void {}
    }
    try {
      const r = rig({ type: 'always' })
      await settle()
      const removeSpy = vi.spyOn(r.viewport, 'removeEventListener')
      // 视口与内容包裹层都要跟：内容变高时视口自己的尺寸并不变
      expect(observed).toEqual([r.viewport, r.content])
      r.stop()
      rigs.pop()
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(disconnected).toBe(1)
    }
    finally {
      delete win.ResizeObserver
    }
  })
})

describe('显隐时机', () => {
  it('type=always：内容根本不溢出也照样露着', async () => {
    const r = rig({ type: 'always' }, { clientH: 400, clientW: 400, scrollH: 100, scrollW: 100 })
    await settle()
    expect(r.api().vertical.overflow).toBe(false)
    expect(barProps(r)['data-state']).toBe('visible')
    expect(barProps(r).hidden).toBeUndefined()
  })

  it('type=auto：溢出就露着，不溢出就收起', async () => {
    const overflowing = rig({ type: 'auto' })
    await settle()
    expect(barProps(overflowing)['data-state']).toBe('visible')

    const flat = rig({ type: 'auto' }, { clientH: 400, clientW: 400, scrollH: 100, scrollW: 100 })
    await settle()
    expect(barProps(flat)['data-state']).toBe('hidden')
    expect(barProps(flat).hidden).toBe(true)
  })

  it('默认（hover）：挂载时收着，指针进入才露出', async () => {
    const r = rig()
    await settle()
    expect(r.service.state.get()).toBe('hidden')
    expect(barProps(r)['data-state']).toBe('hidden')

    ;((r.api().getRootProps() as Dict).onPointerEnter as () => void)()
    expect(r.service.state.get()).toBe('visible')
    expect(barProps(r)['data-state']).toBe('visible')
  })

  it('hover：指针离开后要等满 scrollHideDelay 才收起', async () => {
    vi.useFakeTimers()
    const r = rig({ type: 'hover', scrollHideDelay: 300 })
    await settle()
    const root = (): Dict => r.api().getRootProps() as Dict
    ;(root().onPointerEnter as () => void)()
    ;(root().onPointerLeave as () => void)()
    // 倒计时期间仍然露着：指针擦一下边就闪没了会很难看
    expect(r.service.state.get()).toBe('hiding')
    expect(barProps(r)['data-state']).toBe('visible')

    vi.advanceTimersByTime(299)
    expect(barProps(r)['data-state']).toBe('visible')
    vi.advanceTimersByTime(1)
    expect(r.service.state.get()).toBe('hidden')
    expect(barProps(r)['data-state']).toBe('hidden')
  })

  it('scrollHideDelay 给 Infinity 就一直露着，不该当场抛', async () => {
    vi.useFakeTimers()
    // Infinity 是"永不收起"的自然写法；直接喂给定时器会在 dev 下抛 INVALID_DELAY
    const r = rig({ type: 'hover', scrollHideDelay: Number.POSITIVE_INFINITY })
    await settle()
    const root = (): Dict => r.api().getRootProps() as Dict
    ;(root().onPointerEnter as () => void)()
    expect(() => (root().onPointerLeave as () => void)()).not.toThrow()
    vi.advanceTimersByTime(100_000)
    expect(r.service.state.get()).toBe('hiding')
    expect(barProps(r)['data-state']).toBe('visible')
  })

  it('scrollHideDelay 给 NaN 同样不排期，不会被当成 0 立刻收起', async () => {
    vi.useFakeTimers()
    // 与 toast 同一判据：非有限值一律不起计时器，而不是喂给 setTimeout 折算成 0
    const r = rig({ type: 'hover', scrollHideDelay: Number.NaN })
    await settle()
    const root = (): Dict => r.api().getRootProps() as Dict
    ;(root().onPointerEnter as () => void)()
    ;(root().onPointerLeave as () => void)()
    vi.advanceTimersByTime(100_000)
    expect(r.service.state.get()).toBe('hiding')
  })

  it('hover：收起倒计时里指针又回来即撤销', async () => {
    vi.useFakeTimers()
    const r = rig({ type: 'hover', scrollHideDelay: 300 })
    await settle()
    const root = (): Dict => r.api().getRootProps() as Dict
    ;(root().onPointerEnter as () => void)()
    ;(root().onPointerLeave as () => void)()
    ;(root().onPointerEnter as () => void)()
    vi.advanceTimersByTime(1000)
    expect(r.service.state.get()).toBe('visible')
  })

  it('收起态收到 POINTER.LEAVE 只记账，不会把滚动条凭空推出来', async () => {
    const r = rig({ type: 'hover' })
    await settle()
    ;((r.api().getRootProps() as Dict).onPointerLeave as () => void)()
    expect(r.service.state.get()).toBe('hidden')
    expect(barProps(r)['data-state']).toBe('hidden')
  })

  it('type=scroll：滚动时露出，停手一段时间后收起', async () => {
    vi.useFakeTimers()
    const r = rig({ type: 'scroll', scrollHideDelay: 200 })
    await settle()
    expect(barProps(r)['data-state']).toBe('hidden')

    scrollViewport(r, 40)
    expect(r.service.state.get()).toBe('hiding')
    expect(barProps(r)['data-state']).toBe('visible')

    // 手还在滚：倒计时要推倒重来，否则第一只计时器会照常走完
    vi.advanceTimersByTime(150)
    scrollViewport(r, 80)
    vi.advanceTimersByTime(150)
    expect(barProps(r)['data-state']).toBe('visible')

    vi.advanceTimersByTime(50)
    expect(barProps(r)['data-state']).toBe('hidden')
  })

  it('type=scroll：指针悬停不顶用（那是 hover 的事）', async () => {
    const r = rig({ type: 'scroll' })
    await settle()
    ;((r.api().getRootProps() as Dict).onPointerEnter as () => void)()
    expect(r.service.state.get()).toBe('hidden')
  })

  it('orientation 关掉的那条轴恒不显形，另一条照常', async () => {
    const r = rig({ type: 'always', orientation: 'vertical' })
    await settle()
    expect(barProps(r, 'vertical')['data-state']).toBe('visible')
    expect(barProps(r, 'horizontal')['data-state']).toBe('hidden')
    expect(barProps(r, 'horizontal').hidden).toBe(true)
  })

  it('两条都露着才补右下角那块', async () => {
    const both = rig({ type: 'always' })
    await settle()
    expect(both.api().cornerVisible).toBe(true)
    expect((both.api().getCornerProps() as Dict).hidden).toBeUndefined()

    const one = rig({ type: 'always', orientation: 'vertical' })
    await settle()
    expect(one.api().cornerVisible).toBe(false)
    expect((one.api().getCornerProps() as Dict).hidden).toBe(true)
  })

  it('运行期把 type 从 always 改成 auto 立刻生效，不用等任何回写', async () => {
    const r = rig({ type: 'always' }, { clientH: 400, clientW: 400, scrollH: 100, scrollW: 100 })
    await settle()
    expect(barProps(r)['data-state']).toBe('visible')
    r.setProps({ type: 'auto' })
    expect(barProps(r)['data-state']).toBe('hidden')
  })
})

describe('拖动滑块', () => {
  it('按下记起点、移动换算成滚动量写回视口、松手收尾', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    expect(r.service.state.get()).toBe('dragging')
    expect(r.api().draggingAxis).toBe('vertical')
    expect(thumbProps(r)['data-dragging']).toBe('')

    // 轨道 100、滑块 25 → 能走 75；手走 30px 即滚过 40% 的可滚量
    document.dispatchEvent(pointer('pointermove', { clientY: 40 }))
    expect(r.viewport.scrollTop).toBe(120)
    // 原生 scroll 事件要等下一帧，这里立刻回读，滑块不落后一帧
    expect(r.api().vertical.offset).toBeCloseTo(0.3, 10)
    expect((thumbProps(r).style as Dict).insetBlockStart).toBe('30%')

    document.dispatchEvent(pointer('pointerup'))
    expect(r.api().draggingAxis).toBe(null)
    expect(thumbProps(r)['data-dragging']).toBeUndefined()
  })

  it('位移始终相对按下那一刻算，不是逐帧累加', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    document.dispatchEvent(pointer('pointermove', { clientY: 40 }))
    document.dispatchEvent(pointer('pointermove', { clientY: 25 }))
    expect(r.viewport.scrollTop).toBe(60)
  })

  it('拖出边界停在端点', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    document.dispatchEvent(pointer('pointermove', { clientY: 9999 }))
    expect(r.viewport.scrollTop).toBe(300)
    document.dispatchEvent(pointer('pointermove', { clientY: -9999 }))
    expect(r.viewport.scrollTop).toBe(0)
  })

  it('系统抢走指针（pointercancel）也收尾，状态不会永远停在 dragging', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    document.dispatchEvent(pointer('pointercancel'))
    expect(r.service.state.get()).not.toBe('dragging')
    expect(r.api().draggingAxis).toBe(null)
  })

  it('松手后指针还在组件里就留着滚动条，人走了才开始倒计时', async () => {
    const r = rig({ type: 'hover', scrollHideDelay: 200 })
    await settle()
    ;((r.api().getRootProps() as Dict).onPointerEnter as () => void)()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    document.dispatchEvent(pointer('pointerup'))
    expect(r.service.state.get()).toBe('visible')

    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    ;((r.api().getRootProps() as Dict).onPointerLeave as () => void)()
    document.dispatchEvent(pointer('pointerup'))
    expect(r.service.state.get()).toBe('hiding')
  })

  it('松手后指针事件不再改滚动位置：监听器已经摘干净', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 10 }))
    document.dispatchEvent(pointer('pointermove', { clientY: 40 }))
    document.dispatchEvent(pointer('pointerup'))
    document.dispatchEvent(pointer('pointermove', { clientY: 90 }))
    expect(r.viewport.scrollTop).toBe(120)
  })

  it('只认主键：右键按下不开始拖动', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { button: 2, clientY: 10 }))
    expect(r.service.state.get()).not.toBe('dragging')
  })

  it('按在滑块上的那一下不许再冒到轨道那层去跳转', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const event = pointer('pointerdown', { clientY: 10 })
    const stop = vi.spyOn(event, 'stopPropagation')
    ;(thumbProps(r).onPointerDown as (e: PointerEvent) => void)(event)
    expect(stop).toHaveBeenCalled()
  })
})

describe('点轨道空白处', () => {
  it('滑块中心跳到落点', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(barProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientY: 50 }))
    // 轨道 100、滑块 25：点正中 → 中心对齐后正好滚到一半
    expect(r.viewport.scrollTop).toBe(150)
    expect(r.api().vertical.offset).toBe(0.375)
  })

  it('拦下默认行为，免得按住轨道顺手选中了页面文字', async () => {
    const r = rig({ type: 'always' })
    await settle()
    // 合成事件默认 cancelable=false，那种事件上 preventDefault 是空操作、断言会恒绿
    const event = pointer('pointerdown', { clientY: 50 })
    ;(barProps(r).onPointerDown as (e: PointerEvent) => void)(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('右键不跳', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(barProps(r).onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { button: 2, clientY: 50 }))
    expect(r.viewport.scrollTop).toBe(0)
  })
})

describe('原生滚动不被接管', () => {
  it('视口上一个事件处理器都不挂：按键与滚轮全归浏览器', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const props = r.api().getViewportProps() as Dict
    const handlers = Object.keys(props).filter(key => /^on[A-Z]/.test(key))
    expect(handlers).toEqual([])
  })

  it('视口占一个 Tab 位：滚动区里没有可聚焦元素时键盘用户也进得来', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect((r.api().getViewportProps() as Dict).tabindex).toBe(0)
  })

  it('滚动条与右下角补丁对读屏隐藏：原生滚动已经把这件事报过一遍了', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(barProps(r)['aria-hidden']).toBe('true')
    expect(thumbProps(r)['aria-hidden']).toBeUndefined()
    expect((r.api().getCornerProps() as Dict)['aria-hidden']).toBe('true')
  })
})

describe('从右往左排版的横轴', () => {
  it('dOM 里的负 scrollLeft 对外翻成非负的距起始缘距离', async () => {
    const r = rig({ type: 'always', dir: 'rtl' })
    await settle()
    r.viewport.scrollLeft = -150
    r.viewport.dispatchEvent(new Event('scroll'))
    expect(r.service.context.get('horizontal').scroll).toBe(150)
    expect(r.api().horizontal.offset).toBe(0.375)
  })

  it('拖动写回时翻回负数，手往左移是滚动量变大', async () => {
    const r = rig({ type: 'always', dir: 'rtl' })
    await settle()
    ;(thumbProps(r, 'horizontal').onPointerDown as (e: PointerEvent) => void)(pointer('pointerdown', { clientX: 40 }))
    document.dispatchEvent(pointer('pointermove', { clientX: 10 }))
    expect(r.viewport.scrollLeft).toBe(-120)
  })

  it('root 上不写死 dir：作者没给就让它从祖先继承', async () => {
    const inherit = rig({ type: 'always' })
    await settle()
    expect((inherit.api().getRootProps() as Dict).dir).toBeUndefined()

    const rtl = rig({ type: 'always', dir: 'rtl' })
    await settle()
    expect((rtl.api().getRootProps() as Dict).dir).toBe('rtl')
  })
})
