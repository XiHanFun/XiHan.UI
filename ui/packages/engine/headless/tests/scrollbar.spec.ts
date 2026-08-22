// @vitest-environment jsdom
import type { Orientation } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ScrollbarApi, ScrollbarSchema } from '../src/scrollbar'
import { DIAGNOSTIC_CODES, normalizeProps, onDiagnostic, resetDiagnostics } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectScrollbar, scrollbarMachine } from '../src/scrollbar'

type Props = ScrollbarSchema['props']
type Dict = Record<string, unknown>

interface BoxSize {
  clientH: number
  clientW: number
  scrollH: number
  scrollW: number
}

/**
 * jsdom 不做布局，clientHeight/scrollHeight 恒是 0——机器会当成「没有溢出」，
 * 滚动条一条也不会显形。这里把四个尺寸桩在真实节点上，滚动量则做成可读可写的，
 * 与浏览器一样在两端夹住（拖出边界时要能验到「停在端点」）。
 */
function stubBox(el: HTMLElement, size: BoxSize): void {
  let top = 0
  let left = 0
  const maxTop = Math.max(0, size.scrollH - size.clientH)
  const maxLeft = Math.max(0, size.scrollW - size.clientW)
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
      // RTL 横轴是负数，两端都要留：夹在 [-max, max] 里
      set: (v: number) => {
        left = Math.min(Math.max(v, -maxLeft), maxLeft)
      },
    },
  })
}

/** 轨道只有长度要紧；点轨道那一路还要一个矩形。 */
function stubTrack(el: HTMLElement, length: number, axis: Orientation): void {
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
  service: Service<ScrollbarSchema>
  scrollable: HTMLElement
  root: HTMLElement
  track: HTMLElement
  thumb: HTMLElement
  api: () => ScrollbarApi
  setProps: (next: Props) => void
  /** 把滚动容器换成另一个节点，模拟作者条件渲染出新盒子。 */
  swapScrollable: (next: HTMLElement) => void
  stop: () => void
}

/**
 * 视口 100、内容 400、轨道 100：滑块比例 1/4，能走的距离 75px，可滚 300px。
 * 滚动容器刻意不是滚动条的祖先——这正是本组件与 scroll-area 的分野。
 */
function makeRig(initial: Props = {}, size: BoxSize = { clientH: 100, clientW: 100, scrollH: 400, scrollW: 400 }): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(scrollbarMachine, { props: () => props.get(), runtime })

  const axis: Orientation = initial.orientation ?? 'vertical'
  const make = (part: string): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'scrollbar')
    el.setAttribute('data-part', part)
    return el
  }
  const scrollable = document.createElement('div')
  scrollable.id = 'scrollable'
  const root = make('root')
  const track = make('track')
  const thumb = make('thumb')
  track.appendChild(thumb)
  root.appendChild(track)
  document.body.append(scrollable, root)

  stubBox(scrollable, size)
  stubTrack(track, 100, axis)

  let current: HTMLElement = scrollable
  service.refs.set('getScrollableEl', () => current)
  service.refs.set('getTrackEl', () => track)
  service.refs.set('getRootEl', () => root)

  runtime.start()

  return {
    service,
    scrollable,
    root,
    track,
    thumb,
    api: () => connectScrollbar(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
    swapScrollable: (next) => {
      current = next
    },
    stop: () => {
      runtime.stop()
      root.remove()
      scrollable.remove()
    },
  }
}

/** 效应挂载与 measureSoon 都推迟一拍（queueMicrotask），等它们跑完再断言。 */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

function pointer(type: string, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { button: 0, bubbles: true, cancelable: true, ...init })
}

/** 原生滚动：改滚动量再派 scroll 事件，与浏览器同序。 */
function scrollTo(r: Rig, top: number): void {
  r.scrollable.scrollTop = top
  r.scrollable.dispatchEvent(new Event('scroll'))
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

describe('挂在别人的滚动容器上', () => {
  it('推迟一拍后量到尺寸：溢出被认出来', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(r.service.context.get('metrics')).toEqual({ viewport: 100, content: 400, scroll: 0, track: 100 })
    expect(r.api().overflow).toBe(true)
  })

  it('滑块长度是视口占内容的比例，起点跟着滚动量走', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(r.api().thumbSize).toBeCloseTo(0.25)
    scrollTo(r, 150)
    expect(r.api().thumbOffset).toBeCloseTo(0.375) // 150/300 × (1 − 0.25)
    expect(r.api().scroll).toBe(150)
    expect(r.api().max).toBe(300)
  })

  it('内容不比视口长时不显形，always 也不例外那一半：overflow 为假', async () => {
    const r = rig({ type: 'auto' }, { clientH: 400, clientW: 400, scrollH: 400, scrollW: 400 })
    await settle()
    expect(r.api().overflow).toBe(false)
    expect(r.api().visible).toBe(false)
  })
})

describe('容器换了', () => {
  it('监听挪到新容器：新的滚得到，旧的不再算数', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const next = document.createElement('div')
    document.body.append(next)
    stubBox(next, { clientH: 100, clientW: 100, scrollH: 800, scrollW: 800 })
    r.swapScrollable(next)
    // 节点换了由依赖比对发现；测试运行时只在信号写入时比对，measure() 就是那一次写入
    r.api().measure()
    await settle()
    expect(r.api().max).toBe(700)

    next.scrollTop = 200
    next.dispatchEvent(new Event('scroll'))
    expect(r.api().scroll).toBe(200)

    r.scrollable.scrollTop = 50
    r.scrollable.dispatchEvent(new Event('scroll'))
    expect(r.api().scroll).toBe(200)
    next.remove()
  })

  it('挂载时查不到容器：投诊断，后到的容器经 measure() 接上', async () => {
    resetDiagnostics()
    const codes: string[] = []
    const off = onDiagnostic(record => void codes.push(record.code))
    const r = rig({ type: 'always' })
    const real = r.scrollable
    r.swapScrollable(null as unknown as HTMLElement)
    await settle()
    off()
    expect(codes).toContain(DIAGNOSTIC_CODES.scrollbarMissingScrollable)
    expect(r.api().overflow).toBe(false)

    r.swapScrollable(real)
    r.api().measure()
    await settle()
    expect(r.api().overflow).toBe(true)
    scrollTo(r, 30)
    expect(r.api().scroll).toBe(30)
  })
})

describe('运行期改 props', () => {
  it('type 从 hover 改成 always：立刻显形', async () => {
    const r = rig({ type: 'hover' })
    await settle()
    expect(r.api().visible).toBe(false)
    r.setProps({ type: 'always' })
    expect(r.api().visible).toBe(true)
  })

  it('运行期禁用：按下滑块不再进拖动态', async () => {
    const r = rig({ type: 'always' })
    await settle()
    r.setProps({ disabled: true })
    ;(r.api().getThumbProps() as Dict & { onPointerDown: (e: PointerEvent) => void })
      .onPointerDown(pointer('pointerdown', { clientY: 0 }))
    expect(r.api().dragging).toBe(false)
    expect(r.api().visible).toBe(false)
  })
})

describe('显隐时机', () => {
  it('always 恒显形，即便内容没溢出', async () => {
    const r = rig({ type: 'always' }, { clientH: 400, clientW: 400, scrollH: 400, scrollW: 400 })
    await settle()
    expect(r.api().visible).toBe(true)
  })

  it('hover：指针进滚动容器就露，离开后倒计时收起', async () => {
    vi.useFakeTimers()
    const r = rig({ type: 'hover', hideDelay: 100 })
    await settle()
    expect(r.api().visible).toBe(false)

    r.scrollable.dispatchEvent(new PointerEvent('pointerenter'))
    expect(r.api().visible).toBe(true)

    r.scrollable.dispatchEvent(new PointerEvent('pointerleave'))
    expect(r.api().visible).toBe(true)
    vi.advanceTimersByTime(120)
    expect(r.api().visible).toBe(false)
  })

  it('hover：指针挪到滚动条本身也算手还在这儿', async () => {
    const r = rig({ type: 'hover' })
    await settle()
    r.root.dispatchEvent(new PointerEvent('pointerenter'))
    expect(r.api().visible).toBe(true)
  })

  it('禁用恒不显形：一条按不动的灰条只会让人反复点', async () => {
    const r = rig({ type: 'always', disabled: true })
    await settle()
    expect(r.api().visible).toBe(false)
  })
})

describe('成段的滚动通知', () => {
  it('连滚只报一次开始，停手够久才报结束', async () => {
    vi.useFakeTimers()
    const onScrollStart = vi.fn()
    const onScrollEnd = vi.fn()
    const r = rig({ type: 'always', onScrollStart, onScrollEnd })
    await settle()

    scrollTo(r, 30)
    scrollTo(r, 60)
    scrollTo(r, 90)
    expect(onScrollStart).toHaveBeenCalledTimes(1)
    expect(onScrollEnd).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(onScrollEnd).toHaveBeenCalledTimes(1)
    expect(onScrollEnd).toHaveBeenCalledWith({ offset: 90, max: 300 })

    scrollTo(r, 120)
    expect(onScrollStart).toHaveBeenCalledTimes(2)
  })
})

describe('拖动滑块', () => {
  it('按下再移动：位移按行程换算成滚动量', async () => {
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    const r = rig({ type: 'always', onDragStart, onDragEnd })
    await settle()

    ;(r.api().getThumbProps() as Dict & { onPointerDown: (e: PointerEvent) => void })
      .onPointerDown(pointer('pointerdown', { clientY: 0 }))
    expect(r.api().dragging).toBe(true)
    expect(onDragStart).toHaveBeenCalledWith({ offset: 0, max: 300 })

    // 行程 75px（轨道 100 − 滑块 25），走 25px 即 1/3，滚动量 100
    document.dispatchEvent(pointer('pointermove', { clientY: 25 }))
    expect(r.scrollable.scrollTop).toBe(100)

    document.dispatchEvent(pointer('pointerup'))
    expect(r.api().dragging).toBe(false)
    expect(onDragEnd).toHaveBeenCalledTimes(1)
  })

  it('拖过头停在端点，不出负数也不越界', async () => {
    const r = rig({ type: 'always' })
    await settle()
    ;(r.api().getThumbProps() as Dict & { onPointerDown: (e: PointerEvent) => void })
      .onPointerDown(pointer('pointerdown', { clientY: 0 }))
    document.dispatchEvent(pointer('pointermove', { clientY: 9999 }))
    expect(r.scrollable.scrollTop).toBe(300)
    document.dispatchEvent(pointer('pointermove', { clientY: -9999 }))
    expect(r.scrollable.scrollTop).toBe(0)
  })

  it('禁用时按下滑块不进拖动态', async () => {
    const r = rig({ type: 'always', disabled: true })
    await settle()
    ;(r.api().getThumbProps() as Dict & { onPointerDown: (e: PointerEvent) => void })
      .onPointerDown(pointer('pointerdown', { clientY: 0 }))
    expect(r.api().dragging).toBe(false)
  })
})

describe('点轨道空白处', () => {
  it('把滑块中心挪到落点', async () => {
    const r = rig({ type: 'always' })
    await settle()
    // 轨道 100、滑块 25：点在 50 处，中心对齐后滚动量 = (50 − 12.5)/75 × 300 = 150
    ;(r.api().getTrackProps() as Dict & { onPointerDown: (e: PointerEvent) => void })
      .onPointerDown(pointer('pointerdown', { clientY: 50 }))
    expect(r.scrollable.scrollTop).toBe(150)
  })
})

describe('键盘', () => {
  const press = (r: Rig, key: string): void => {
    (r.api().getThumbProps() as Dict & { onKeyDown: (e: KeyboardEvent) => void })
      .onKeyDown(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  }

  it('方向键走一步，翻页键走一屏，Home/End 到两端', async () => {
    const r = rig({ type: 'always', focusable: true, step: 40 })
    await settle()

    press(r, 'ArrowDown')
    expect(r.scrollable.scrollTop).toBe(40)
    press(r, 'PageDown')
    expect(r.scrollable.scrollTop).toBe(140) // 40 + 视口 100
    press(r, 'Home')
    expect(r.scrollable.scrollTop).toBe(0)
    press(r, 'End')
    expect(r.scrollable.scrollTop).toBe(300)
    press(r, 'ArrowUp')
    expect(r.scrollable.scrollTop).toBe(260)
  })

  it('交叉轴的方向键不接：让它冒上去交给页面', async () => {
    const r = rig({ type: 'always', focusable: true })
    await settle()
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    ;(r.api().getThumbProps() as Dict & { onKeyDown: (e: KeyboardEvent) => void }).onKeyDown(event)
    expect(event.defaultPrevented).toBe(false)
    expect(r.scrollable.scrollTop).toBe(0)
  })

  it('禁用时一个键都不接', async () => {
    const r = rig({ type: 'always', focusable: true, disabled: true })
    await settle()
    press(r, 'End')
    expect(r.scrollable.scrollTop).toBe(0)
  })
})

describe('读屏面', () => {
  it('缺省整条隐藏、滑块退出 Tab 序：滚动本身由滚动容器报，没必要报两遍', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect((r.api().getRootProps() as Dict)['aria-hidden']).toBe(true)
    const thumb = r.api().getThumbProps() as Dict
    expect(thumb.role).toBeUndefined()
    expect(thumb.tabindex).toBe(-1)
  })

  it('focusable 打开后报 role=scrollbar 与三个数，名字可覆盖', async () => {
    const r = rig({ type: 'always', focusable: true, controls: 'scrollable', translations: { thumb: '内容滚动条' } })
    await settle()
    scrollTo(r, 150)
    expect((r.api().getRootProps() as Dict)['aria-hidden']).toBeUndefined()
    const thumb = r.api().getThumbProps() as Dict
    expect(thumb.role).toBe('scrollbar')
    expect(thumb['aria-orientation']).toBe('vertical')
    expect(thumb['aria-label']).toBe('内容滚动条')
    expect(thumb['aria-controls']).toBe('scrollable')
    expect(thumb['aria-valuemin']).toBe(0)
    expect(thumb['aria-valuemax']).toBe(300)
    expect(thumb['aria-valuenow']).toBe(150)
    expect(thumb.tabindex).toBe(0)
  })
})

describe('从右往左排版的横轴', () => {
  it('滚动量写回时取负，读出来仍是恒非负的逻辑距离', async () => {
    const r = rig({ type: 'always', orientation: 'horizontal', dir: 'rtl' })
    await settle()
    r.api().scrollTo(120)
    expect(r.scrollable.scrollLeft).toBe(-120)
    expect(r.api().scroll).toBe(120)
  })

  it('左右键按排版方向解释：ArrowLeft 往前走，ArrowRight 往回走', async () => {
    const r = rig({ type: 'always', orientation: 'horizontal', dir: 'rtl', focusable: true, step: 40 })
    await settle()
    const press = (key: string): void => {
      (r.api().getThumbProps() as Dict & { onKeyDown: (e: KeyboardEvent) => void })
        .onKeyDown(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    }
    press('ArrowLeft')
    expect(r.api().scroll).toBe(40)
    expect(r.scrollable.scrollLeft).toBe(-40)
    press('ArrowRight')
    expect(r.api().scroll).toBe(0)
  })
})

describe('命令式出口', () => {
  it('scrollTo 越界自动夹，scrollBy 相对当前位置走', async () => {
    const r = rig({ type: 'always' })
    await settle()
    r.api().scrollTo(9999)
    expect(r.scrollable.scrollTop).toBe(300)
    r.api().scrollBy(-100)
    expect(r.scrollable.scrollTop).toBe(200)
  })
})

describe('触屏与交叉口', () => {
  it('粗指针设备上交给原生滚动：不显形并带 data-native；forceVisible 打开才画', async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    try {
      const r = rig({ type: 'always' })
      await settle()
      expect(r.api().native).toBe(true)
      expect(r.api().visible).toBe(false)
      expect((r.api().getRootProps() as Dict)['data-native']).toBe('')
      r.setProps({ forceVisible: true })
      expect(r.api().native).toBe(false)
      expect(r.api().visible).toBe(true)
    }
    finally {
      window.matchMedia = original
    }
  })

  it('gutter 打在根上，corner 跟着本条的显隐与方向', async () => {
    const r = rig({ type: 'hover', gutter: true })
    await settle()
    expect((r.api().getRootProps() as Dict)['data-gutter']).toBe('')
    const corner = r.api().getCornerProps() as Dict
    expect(corner['data-part']).toBe('corner')
    expect(corner['data-orientation']).toBe('vertical')
    expect(corner['data-state']).toBe('hidden')
    r.setProps({ type: 'always' })
    expect((r.api().getCornerProps() as Dict)['data-state']).toBe('visible')
  })

  it('没给 controls 时 aria-controls 用容器自己的 id', async () => {
    const r = rig({ type: 'always', focusable: true })
    await settle()
    expect((r.api().getThumbProps() as Dict)['aria-controls']).toBe('scrollable')
    r.setProps({ controls: 'elsewhere' })
    expect((r.api().getThumbProps() as Dict)['aria-controls']).toBe('elsewhere')
  })
})

describe('容器上的标记', () => {
  it('挂上打 data-xh-scrollbar，拆走撤掉；交给原生滚动时不打', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(r.scrollable.getAttribute('data-xh-scrollbar')).toBe('1')

    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    try {
      const touch = rig({ type: 'always' })
      await settle()
      expect(touch.scrollable.getAttribute('data-xh-scrollbar')).toBeNull()
      touch.setProps({ forceVisible: true })
      await settle()
      expect(touch.scrollable.getAttribute('data-xh-scrollbar')).toBe('1')
      touch.stop()
      rigs.pop()
    }
    finally {
      window.matchMedia = original
    }

    const el = r.scrollable
    r.stop()
    rigs.pop()
    expect(el.getAttribute('data-xh-scrollbar')).toBeNull()
  })
})
