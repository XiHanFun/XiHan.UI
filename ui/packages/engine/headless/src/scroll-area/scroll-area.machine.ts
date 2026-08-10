import type { Direction, Orientation } from '@xihan-ui/kernel'
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

/**
 * 收起延时。缺省用默认值，负数按立即收起。
 * 非有限值（Infinity 就是"永不收起"的写法）返回 null，由调用方跳过排期——
 * 直接喂给定时器会在 dev 下当场抛。
 */
function resolveHideDelay(ms: number | undefined): number | null {
  if (ms == null)
    return SCROLL_AREA_HIDE_DELAY
  if (!Number.isFinite(ms))
    return null
  return Math.max(0, ms)
}
/** 未指定 type 时的露面时机。 */
export const SCROLL_AREA_DEFAULT_TYPE: ScrollAreaType = 'hover'

const AXES: readonly Orientation[] = ['vertical', 'horizontal']
const EMPTY_METRICS: ScrollAreaAxisMetrics = { viewport: 0, content: 0, scroll: 0, track: 0 }

/** 逐字段比：每次量尺寸都产出新对象，默认的 Object.is 恒不相等。 */
function sameMetrics(a: ScrollAreaAxisMetrics, b: ScrollAreaAxisMetrics | undefined): boolean {
  return !!b && a.viewport === b.viewport && a.content === b.content && a.scroll === b.scroll && a.track === b.track
}

/** 量尺寸与写回滚动位置用到的参数子集。 */
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

/** 两条轴一起量，值没变就不写回 context。 */
function runMeasure(p: MeasureParams): void {
  const viewport = p.refs.get('getViewportEl')()
  // 无 DOM 环境：尺寸留在初值，状态转移不受影响
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

/** 写回滚动位置；RTL 横轴要翻回负数。 */
function applyScroll(viewport: HTMLElement, axis: Orientation, offset: number, dir: Direction | undefined): void {
  const raw = toDomScroll(offset, { axis, dir })
  if (axis === 'vertical')
    viewport.scrollTop = raw
  else
    viewport.scrollLeft = raw
}

// 指针进出在四个状态里的分工不同，逐个声明。
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
    // 尺寸是量出来的，不受控、不对外通知
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
  // auto / always 的可见性不看状态，起点落在 visible
  initialState: ({ prop }) => {
    const type = prop('type') ?? SCROLL_AREA_DEFAULT_TYPE
    return type === 'hover' || type === 'scroll' ? 'hidden' : 'visible'
  },
  // 尺寸监听与首帧测量全程挂着
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
        // 收起态只记账，跳去 hiding 会让滚动条凭空冒出来
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
        // reenter 强制重挂计时器，把倒计时推倒重来
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

      /** 推迟一拍再量：滚动条收着时 clientHeight 是 0，要等这一帧提交后才量得到轨道长度。 */
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
        // 立刻回读：原生 scroll 事件要等下一帧派发，且浏览器可能把值夹过
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
       * 视口的 scroll 事件与尺寸变化，只能在 DOM 上观察，因此落在效应里。
       * 推迟一拍再挂：挂载这一刻角色节点未必就位，量到的尺寸会全是 0；
       * disposed 兜住还没挂上就被卸载那一路，否则监听器会挂到已停掉的机器上。
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
          // 不拦滚动、不 preventDefault，用 passive 监听
          viewport.addEventListener('scroll', onScroll, { passive: true })

          // 无布局环境没有 ResizeObserver：不再跟随尺寸变化，滚动与显式 MEASURE 仍会重量
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

      waitForHideDelay: ({ prop, send }) => {
        const delay = resolveHideDelay(prop('scrollHideDelay'))
        if (delay == null)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.scrollHideDelay' }), delay)
      },

      // 监听器挂在文档上，指针拖出滚动条仍要跟手；pointercancel 不收会让状态永远停在 dragging
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
