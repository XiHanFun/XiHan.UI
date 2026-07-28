import type { Direction, Orientation } from '@xihan-ui/core'
import type { Params, Transition } from '@xihan-ui/machine'
import type { ScrollAreaAxisMetrics } from './scroll-area.geometry'
import type { ScrollAreaSchema, ScrollAreaType } from './scroll-area.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import {
  pointerDelta,
  scrollFromThumbDrag,
  scrollFromTrackPoint,
  toDomScroll,
  toLogicalScroll,
  trackOffset,
} from './scroll-area.geometry'

const { createMachine } = setup<ScrollAreaSchema>()

/** 收起前的默认等待毫秒。 */
export const SCROLL_AREA_HIDE_DELAY = 600
/** 未指定 type 时的露面时机：指针进入才露出，与桌面端的常见观感一致。 */
export const SCROLL_AREA_DEFAULT_TYPE: ScrollAreaType = 'hover'

const AXES: readonly Orientation[] = ['vertical', 'horizontal']
const EMPTY_METRICS: ScrollAreaAxisMetrics = { viewport: 0, content: 0, scroll: 0, track: 0 }

/** 逐字段比。默认的 Object.is 在这里不成立：每次量尺寸都产出一个新对象，引用恒不相等。 */
function sameMetrics(a: ScrollAreaAxisMetrics, b: ScrollAreaAxisMetrics | undefined): boolean {
  return !!b && a.viewport === b.viewport && a.content === b.content && a.scroll === b.scroll && a.track === b.track
}

/** 量尺子与写回滚动位置只用得到这三样，单独拎出来给 action 与推迟一拍的那一路共用。 */
type MeasureParams = Pick<Params<ScrollAreaSchema>, 'refs' | 'prop' | 'context'>

function measureAxis(
  viewport: HTMLElement,
  scrollbar: HTMLElement | null,
  axis: Orientation,
  dir: Direction | undefined,
): ScrollAreaAxisMetrics {
  const vertical = axis === 'vertical'
  return {
    viewport: vertical ? viewport.clientHeight : viewport.clientWidth,
    content: vertical ? viewport.scrollHeight : viewport.scrollWidth,
    // 尺寸一律取视口自己的：内容包裹层可能带外边距，量它会与滚动量对不上
    scroll: toLogicalScroll(vertical ? viewport.scrollTop : viewport.scrollLeft, { axis, dir }),
    track: scrollbar ? (vertical ? scrollbar.clientHeight : scrollbar.clientWidth) : 0,
  }
}

/**
 * 两条轴一起量。值没变就不写：滚动一次就换一批新对象的话，
 * 没动的那条轴也会被判成变了，两个适配器每帧都要白重渲一遍。
 */
function runMeasure(p: MeasureParams): void {
  const viewport = p.refs.get('getViewportEl')()
  // 无 DOM 环境（纯逻辑测试 / SSR）：尺寸全留在初值，状态转移不受影响
  if (!viewport)
    return
  const dir = p.prop('dir')
  const getScrollbar = p.refs.get('getScrollbarEl')
  for (const axis of AXES) {
    const next = measureAxis(viewport, getScrollbar(axis), axis, dir)
    if (!sameMetrics(next, p.context.get(axis)))
      p.context.set(axis, next)
  }
}

/** 写回滚动位置。RTL 横轴要翻回负数，否则内容会往反方向跳。 */
function applyScroll(viewport: HTMLElement, axis: Orientation, offset: number, dir: Direction | undefined): void {
  const raw = toDomScroll(offset, { axis, dir })
  if (axis === 'vertical')
    viewport.scrollTop = raw
  else
    viewport.scrollLeft = raw
}

// 指针进出组件在四个状态里的分工不同，逐个写清楚而不是共用一份：
// 收起态收到 POINTER.LEAVE 只该记账（此时若跳去 hiding，滚动条反而会冒出来）。
const ENTER_SHOWS: Array<Transition<ScrollAreaSchema>> = [
  { guard: 'isHoverType', target: 'visible', actions: ['markPointerInside', 'measureSoon'] },
  { actions: ['markPointerInside'] },
]
const SCROLL_KEEPS_ALIVE: Array<Transition<ScrollAreaSchema>> = [
  { guard: 'isScrollType', target: 'hiding', actions: ['measure'] },
  { actions: ['measure'] },
]

export const scrollAreaMachine = createMachine({
  name: 'scroll-area',
  context: ({ cell }) => ({
    // 尺寸是量出来的事实，不受控、也不对外通知：宿主没有"正确答案"可以写回来
    vertical: cell<ScrollAreaAxisMetrics>(() => ({ defaultValue: EMPTY_METRICS, isEqual: sameMetrics })),
    horizontal: cell<ScrollAreaAxisMetrics>(() => ({ defaultValue: EMPTY_METRICS, isEqual: sameMetrics })),
    pointerInside: cell<boolean>(() => ({ defaultValue: false })),
    drag: cell<ScrollAreaSchema['context']['drag']>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getViewportEl: () => null,
    getContentEl: () => null,
    getScrollbarEl: () => null,
  }),
  // auto / always 的可见性压根不看状态，起点落在 visible 只是让状态名读起来不自相矛盾
  initialState: ({ prop }) => {
    const type = prop('type') ?? SCROLL_AREA_DEFAULT_TYPE
    return type === 'hover' || type === 'scroll' ? 'hidden' : 'visible'
  },
  // 尺寸监听与首帧测量全程挂着：滚动是原生的，组件只是跟着它重画滑块
  effects: ['trackViewport'],
  on: {
    'MEASURE': { actions: ['measure'] },
    // 点轨道空白处在哪个状态下都是同一件事
    'TRACK.CLICK': { actions: ['scrollToTrackPoint'] },
  },
  states: {
    hidden: {
      on: {
        'POINTER.ENTER': ENTER_SHOWS,
        // 没露过面就谈不上收起：这里只记账，跳去 hiding 会让滚动条凭空冒出来
        'POINTER.LEAVE': { actions: ['clearPointerInside'] },
        'SCROLL': SCROLL_KEEPS_ALIVE,
        'DRAG.START': { target: 'dragging', actions: ['startDrag'] },
      },
    },
    visible: {
      on: {
        'POINTER.ENTER': { actions: ['markPointerInside'] },
        'POINTER.LEAVE': [
          { guard: 'isHoverType', target: 'hiding', actions: ['clearPointerInside'] },
          { actions: ['clearPointerInside'] },
        ],
        'SCROLL': SCROLL_KEEPS_ALIVE,
        'DRAG.START': { target: 'dragging', actions: ['startDrag'] },
      },
    },
    hiding: {
      // 进这个态时滚动条可能是刚露出来的，轨道长度得等它真的布局完才量得到
      entry: ['measureSoon'],
      effects: ['waitForHideDelay'],
      on: {
        'after.scrollHideDelay': { target: 'hidden' },
        'POINTER.ENTER': ENTER_SHOWS,
        'POINTER.LEAVE': { actions: ['clearPointerInside'] },
        // 每滚一下就把倒计时推倒重来：reenter 强制重挂计时器，否则第一次滚动
        // 起的那只计时器会照常走完，手还在滚滚动条就先没了
        'SCROLL': [
          { guard: 'isScrollType', target: 'hiding', reenter: true, actions: ['measure'] },
          { actions: ['measure'] },
        ],
        'DRAG.START': { target: 'dragging', actions: ['startDrag'] },
      },
    },
    dragging: {
      effects: ['trackPointer'],
      on: {
        // 手可以把滑块拖到组件外面，进出的记账照收，但不改状态
        'POINTER.ENTER': { actions: ['markPointerInside'] },
        'POINTER.LEAVE': { actions: ['clearPointerInside'] },
        'SCROLL': { actions: ['measure'] },
        'DRAG.MOVE': { actions: ['dragScroll'] },
        // 松手后指针还在组件里就留着滚动条，不然开始倒计时
        'DRAG.END': [
          { guard: 'staysVisible', target: 'visible', actions: ['endDrag'] },
          { target: 'hiding', actions: ['endDrag'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      isHoverType: ({ prop }) => (prop('type') ?? SCROLL_AREA_DEFAULT_TYPE) === 'hover',
      isScrollType: ({ prop }) => (prop('type') ?? SCROLL_AREA_DEFAULT_TYPE) === 'scroll',
      staysVisible: ({ prop, context }) => {
        const type = prop('type') ?? SCROLL_AREA_DEFAULT_TYPE
        if (type === 'auto' || type === 'always')
          return true
        return type === 'hover' && context.get('pointerInside')
      },
    },
    actions: {
      measure: params => runMeasure(params),

      /**
       * 推迟一拍再量。滚动条收着的时候 clientHeight 是 0，量不到轨道长度；
       * 而"该露出来了"这件事要等适配器把这一帧提交完才在 DOM 上成立。
       */
      measureSoon: params => params.flush(() => runMeasure(params)),

      markPointerInside: ({ context }) => context.set('pointerInside', true),
      clearPointerInside: ({ context }) => context.set('pointerInside', false),

      startDrag: (params) => {
        const e = params.event.current()
        if (e.type !== 'DRAG.START')
          return
        // 轨道长度按下这一刻现量：此前滚动条多半还收着，量到的是 0
        runMeasure(params)
        const metrics = params.context.get(e.axis)
        params.context.set('drag', {
          axis: e.axis,
          origin: e.axis === 'vertical' ? e.point.clientY : e.point.clientX,
          startScroll: metrics.scroll,
        })
      },

      dragScroll: (params) => {
        const e = params.event.current()
        if (e.type !== 'DRAG.MOVE')
          return
        const drag = params.context.get('drag')
        const viewport = params.refs.get('getViewportEl')()
        if (!drag || !viewport)
          return
        const dir = params.prop('dir')
        const current = drag.axis === 'vertical' ? e.point.clientY : e.point.clientX
        const delta = pointerDelta(drag.origin, current, { axis: drag.axis, dir })
        const next = scrollFromThumbDrag(drag.startScroll, delta, params.context.get(drag.axis))
        applyScroll(viewport, drag.axis, next, dir)
        // 立刻回读：原生 scroll 事件要等下一帧才派发，不回读的话滑块整整慢一帧，
        // 而且浏览器可能把值夹过（拖出边界时），以它实际落到的位置为准
        runMeasure(params)
      },

      endDrag: ({ context }) => context.set('drag', null),

      scrollToTrackPoint: (params) => {
        const e = params.event.current()
        if (e.type !== 'TRACK.CLICK')
          return
        const viewport = params.refs.get('getViewportEl')()
        const scrollbar = params.refs.get('getScrollbarEl')(e.axis)
        if (!viewport || !scrollbar)
          return
        runMeasure(params)
        const dir = params.prop('dir')
        const offset = trackOffset(e.point, scrollbar.getBoundingClientRect(), { axis: e.axis, dir })
        applyScroll(viewport, e.axis, scrollFromTrackPoint(offset, params.context.get(e.axis)), dir)
        runMeasure(params)
      },
    },
    effects: {
      /**
       * 视口的 scroll 事件与尺寸变化。两件事都只能在 DOM 上观察，因此整块落在效应里，
       * 连接层一行 DOM 都不碰。
       *
       * 推迟一拍再挂：挂载这一刻角色节点未必都就位（作者的内容还在渲），
       * 此时量到的尺寸全是 0，首帧会闪一下"没有溢出"。disposed 标记兜住
       * "还没挂上就被卸载"那一路——不然监听器会挂到一台已经停掉的机器上。
       */
      trackViewport: ({ refs, send, scope, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined

        flush(() => {
          if (disposed)
            return
          const viewport = refs.get('getViewportEl')()
          if (!viewport)
            return

          const onScroll = (): void => send({ type: 'SCROLL' })
          // 不拦滚动、也不打算 preventDefault：滚动本身全归浏览器，passive 让它不必等我们
          viewport.addEventListener('scroll', onScroll, { passive: true })

          // 无布局环境（SSR / jsdom）里没有 ResizeObserver。缺了照样能用，
          // 只是不再跟随尺寸变化——滚动与显式的 MEASURE 仍会把数字重新量一遍
          const win = scope.getWin()
          const observer = typeof win.ResizeObserver === 'function'
            ? new win.ResizeObserver(() => send({ type: 'MEASURE' }))
            : null
          observer?.observe(viewport)
          const content = refs.get('getContentEl')()
          if (content)
            observer?.observe(content)

          send({ type: 'MEASURE' })

          stop = () => {
            viewport.removeEventListener('scroll', onScroll)
            observer?.disconnect()
          }
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      waitForHideDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.scrollHideDelay' }), prop('scrollHideDelay') ?? SCROLL_AREA_HIDE_DELAY),

      // 监听器挂在文档上而不是滑块上：指针可以拖出滚动条甚至拖出窗口，仍要跟手。
      // pointercancel 也要收：系统手势抢走指针时不收会让状态永远停在 dragging
      trackPointer: ({ refs, send }) => {
        const viewport = refs.get('getViewportEl')()
        const doc = viewport?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
        if (!doc)
          return undefined
        const onMove = (ev: PointerEvent): void => {
          send({ type: 'DRAG.MOVE', point: { clientX: ev.clientX, clientY: ev.clientY } })
        }
        const onUp = (): void => send({ type: 'DRAG.END' })
        doc.addEventListener('pointermove', onMove)
        doc.addEventListener('pointerup', onUp)
        doc.addEventListener('pointercancel', onUp)
        return () => {
          doc.removeEventListener('pointermove', onMove)
          doc.removeEventListener('pointerup', onUp)
          doc.removeEventListener('pointercancel', onUp)
        }
      },
    },
  },
})
