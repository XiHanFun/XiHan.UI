import type { Direction, Orientation } from '@xihan-ui/kernel'
import type { Params, Transition } from '@xihan-ui/machine'
import type { ScrollAxisMetrics } from '../shared/scroll-geometry'
import type { ScrollbarSchema, ScrollbarType } from './scrollbar.types'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { clamp } from '../shared/number'
import {
  maxScrollOffset,
  pointerDelta,
  SCROLL_MIN_THUMB_SIZE,
  scrollFromThumbDrag,
  scrollFromTrackPoint,
  toDomScroll,
  toLogicalScroll,
  trackOffset,
} from '../shared/scroll-geometry'

const { createMachine } = setup<ScrollbarSchema>()

/** 收起前的默认等待毫秒。 */
export const SCROLLBAR_HIDE_DELAY = 600

/** 未指定 type 时的露面时机。 */
export const SCROLLBAR_DEFAULT_TYPE: ScrollbarType = 'scroll-hover'

/** 这一档在指针进入滚动容器或滚动条时露面。 */
function showsOnHover(type: ScrollbarType): boolean {
  return type === 'hover' || type === 'scroll-hover'
}

/** 这一档在滚动时露面。 */
function showsOnScroll(type: ScrollbarType): boolean {
  return type === 'scroll' || type === 'scroll-hover'
}

/** 这一档的显隐不看状态机，由 connect 直接按 type 判。 */
function alwaysDecided(type: ScrollbarType): boolean {
  return type === 'auto' || type === 'always'
}

/** 方向键一步默认滚多少像素。 */
export const SCROLLBAR_STEP = 40

/** 停手多久算这一段滚动结束。取值只影响 onScrollStart / onScrollEnd 的成段粒度。 */
export const SCROLLBAR_SCROLL_END_DELAY = 120

const EMPTY_METRICS: ScrollAxisMetrics = { viewport: 0, content: 0, scroll: 0, track: 0 }

/**
 * 挂了自绘滚动条的容器带这个标记，皮肤据此藏掉原生滚动条的外观。
 * 值是挂在它身上的滚动条数：横竖两条共用一个容器，最后一条拆走才撤标记。
 * 交给了原生滚动的那条（触屏且没开 forceVisible）不打标记——原生滚动条得留着。
 */
export const SCROLLBAR_HOST_ATTR = 'data-xh-scrollbar'

function markHost(el: HTMLElement, delta: 1 | -1): void {
  const next = Number(el.getAttribute(SCROLLBAR_HOST_ATTR) ?? 0) + delta
  if (next > 0)
    el.setAttribute(SCROLLBAR_HOST_ATTR, String(next))
  else
    el.removeAttribute(SCROLLBAR_HOST_ATTR)
}

/**
 * 收起延时。缺省用默认值，负数按立即收起。
 * 非有限值（Infinity 就是「永不收起」的写法）返回 null，由调用方跳过排期——
 * 直接喂给定时器会在 dev 下当场抛。
 */
function resolveHideDelay(ms: number | undefined): number | null {
  if (ms == null)
    return SCROLLBAR_HIDE_DELAY
  if (!Number.isFinite(ms))
    return null
  return Math.max(0, ms)
}

/** 逐字段比：每次量尺寸都产出新对象，默认的 Object.is 恒不相等。 */
function sameMetrics(a: ScrollAxisMetrics, b: ScrollAxisMetrics | undefined): boolean {
  return !!b && a.viewport === b.viewport && a.content === b.content && a.scroll === b.scroll && a.track === b.track
}

/** 量尺寸与写回滚动位置用到的参数子集。 */
type MeasureParams = Pick<Params<ScrollbarSchema>, 'refs' | 'prop' | 'context'>

function axisOf(p: Pick<Params<ScrollbarSchema>, 'prop'>): { axis: Orientation, dir: Direction | undefined } {
  return { axis: p.prop('orientation') ?? 'vertical', dir: p.prop('dir') }
}

function measureAxis(
  scrollable: HTMLElement,
  track: HTMLElement | null,
  axis: Orientation,
  dir: Direction | undefined,
): ScrollAxisMetrics {
  const vertical = axis === 'vertical'
  return {
    viewport: vertical ? scrollable.clientHeight : scrollable.clientWidth,
    content: vertical ? scrollable.scrollHeight : scrollable.scrollWidth,
    scroll: toLogicalScroll(vertical ? scrollable.scrollTop : scrollable.scrollLeft, { axis, dir }),
    track: track ? (vertical ? track.clientHeight : track.clientWidth) : 0,
  }
}

/** 量一遍，值没变就不写回 context。 */
function runMeasure(p: MeasureParams): void {
  const scrollable = p.refs.get('getScrollableEl')()
  // 无 DOM 环境或作者还没把容器交上来：尺寸留在初值，状态转移不受影响
  if (!scrollable)
    return
  const { axis, dir } = axisOf(p)
  const next = measureAxis(scrollable, p.refs.get('getTrackEl')(), axis, dir)
  if (!sameMetrics(next, p.context.get('metrics')))
    p.context.set('metrics', next)
}

/** 写回滚动位置；RTL 横轴要翻回负数。 */
function applyScroll(p: MeasureParams, offset: number): void {
  const scrollable = p.refs.get('getScrollableEl')()
  if (!scrollable)
    return
  const { axis, dir } = axisOf(p)
  const raw = toDomScroll(clamp(offset, 0, maxScrollOffset(p.context.get('metrics'))), { axis, dir })
  if (axis === 'vertical')
    scrollable.scrollTop = raw
  else
    scrollable.scrollLeft = raw
  // 立刻回读：原生 scroll 事件要等下一帧派发，且浏览器可能把值夹过
  runMeasure(p)
}

function minThumbOf(p: Pick<Params<ScrollbarSchema>, 'prop'>): number {
  const declared = p.prop('minThumbSize')
  return declared != null && Number.isFinite(declared) ? Math.max(0, declared) : SCROLL_MIN_THUMB_SIZE
}

function detailsOf(p: MeasureParams): { offset: number, max: number } {
  const m = p.context.get('metrics')
  return { offset: m.scroll, max: maxScrollOffset(m) }
}

// 指针进出在四个状态里的分工不同，逐个声明。
const ENTER_SHOWS: Array<Transition<ScrollbarSchema>> = [
  { guard: 'showsOnHover', target: 'visible', actions: ['markPointerInside', 'measureSoon'] },
  { actions: ['markPointerInside'] },
]
const SCROLL_KEEPS_ALIVE: Array<Transition<ScrollbarSchema>> = [
  { guard: 'showsOnScroll', target: 'hiding', actions: ['measure', 'markScrolling'] },
  { actions: ['measure', 'markScrolling'] },
]

export const scrollbarMachine = createMachine({
  name: 'scrollbar',
  context: ({ cell }) => ({
    // 尺寸是量出来的，不受控、不对外通知
    metrics: cell<ScrollAxisMetrics>(() => ({ defaultValue: EMPTY_METRICS, isEqual: sameMetrics })),
    pointerInside: cell<boolean>(() => ({ defaultValue: false })),
    drag: cell<ScrollbarSchema['context']['drag']>(() => ({ defaultValue: null })),
    scrolling: cell<boolean>(() => ({ defaultValue: false })),
    coarse: cell<boolean>(() => ({ defaultValue: false })),
    scrollableId: cell<string | null>(() => ({ defaultValue: null })),
    rootMounted: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    getScrollableEl: () => null,
    getTrackEl: () => null,
    getRootEl: () => null,
  }),
  // auto / always 的可见性不看状态，起点落在 visible；其余几档从收着起步，不然挂载那一帧会闪一下
  initialState: ({ prop }) => (alwaysDecided(prop('type') ?? SCROLLBAR_DEFAULT_TYPE) ? 'visible' : 'hidden'),
  // 尺寸监听、首帧测量与指针类型探测全程挂着
  effects: ['trackScrollable', 'trackPointerType'],
  on: {
    'MEASURE': { actions: ['measure'] },
    // 这几件在哪个状态下都是同一件事
    'SCROLL.IDLE': { actions: ['clearScrolling'] },
    'TRACK.CLICK': { guard: 'canInteract', actions: ['scrollToTrackPoint'] },
    'STEP': { guard: 'canInteract', actions: ['stepScroll'] },
    'SCROLL.TO': { actions: ['scrollToOffset'] },
  },
  states: {
    hidden: {
      on: {
        'POINTER.ENTER': ENTER_SHOWS,
        // 收起态只记账，跳去 hiding 会让滚动条凭空冒出来
        'POINTER.LEAVE': { actions: ['clearPointerInside'] },
        'SCROLL': SCROLL_KEEPS_ALIVE,
        'DRAG.START': { guard: 'canInteract', target: 'dragging', actions: ['startDrag'] },
      },
    },
    visible: {
      on: {
        'POINTER.ENTER': { actions: ['markPointerInside'] },
        'POINTER.LEAVE': [
          { guard: 'showsOnHover', target: 'hiding', actions: ['clearPointerInside'] },
          { actions: ['clearPointerInside'] },
        ],
        // 指针占着这块地方时滚动只记账，留在 visible：起了倒计时会当着指针的面收起
        'SCROLL': [
          { guard: 'staysVisible', actions: ['measure', 'markScrolling'] },
          ...SCROLL_KEEPS_ALIVE,
        ],
        'DRAG.START': { guard: 'canInteract', target: 'dragging', actions: ['startDrag'] },
      },
    },
    hiding: {
      // 进这个态时滚动条可能是刚露出来的，轨道长度得等它真的布局完才量得到
      entry: ['measureSoon'],
      effects: ['waitForHideDelay'],
      on: {
        'after.hideDelay': { target: 'hidden' },
        'POINTER.ENTER': ENTER_SHOWS,
        'POINTER.LEAVE': { actions: ['clearPointerInside'] },
        // reenter 强制重挂计时器，把倒计时推倒重来
        'SCROLL': [
          { guard: 'showsOnScroll', target: 'hiding', reenter: true, actions: ['measure', 'markScrolling'] },
          { actions: ['measure', 'markScrolling'] },
        ],
        'DRAG.START': { guard: 'canInteract', target: 'dragging', actions: ['startDrag'] },
      },
    },
    dragging: {
      effects: ['trackPointer'],
      on: {
        // 手可以把滑块拖到组件外面，进出的记账照收，但不改状态
        'POINTER.ENTER': { actions: ['markPointerInside'] },
        'POINTER.LEAVE': { actions: ['clearPointerInside'] },
        'SCROLL': { actions: ['measure', 'markScrolling'] },
        'DRAG.MOVE': { actions: ['dragScroll'] },
        // 松手后指针还在容器里就留着滚动条，不然开始倒计时
        'DRAG.END': [
          { guard: 'staysVisible', target: 'visible', actions: ['endDrag'] },
          { target: 'hiding', actions: ['endDrag'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      showsOnHover: ({ prop }) => showsOnHover(prop('type') ?? SCROLLBAR_DEFAULT_TYPE),
      showsOnScroll: ({ prop }) => showsOnScroll(prop('type') ?? SCROLLBAR_DEFAULT_TYPE),
      canInteract: ({ prop }) => !prop('disabled'),
      staysVisible: ({ prop, context }) => {
        const type = prop('type') ?? SCROLLBAR_DEFAULT_TYPE
        if (alwaysDecided(type))
          return true
        return showsOnHover(type) && context.get('pointerInside')
      },
    },
    actions: {
      measure: params => runMeasure(params),

      /** 推迟一拍再量：滚动条收着时 clientHeight 是 0，要等这一帧提交后才量得到轨道长度。 */
      measureSoon: params => params.flush(() => runMeasure(params)),

      markPointerInside: ({ context }) => context.set('pointerInside', true),
      clearPointerInside: ({ context }) => context.set('pointerInside', false),

      /** 一段滚动的起点：只有从「没在滚」翻成「在滚」那一下才通知。 */
      markScrolling: (params) => {
        if (params.context.get('scrolling'))
          return
        params.context.set('scrolling', true)
        params.prop('onScrollStart')?.(detailsOf(params))
      },

      clearScrolling: (params) => {
        if (!params.context.get('scrolling'))
          return
        params.context.set('scrolling', false)
        params.prop('onScrollEnd')?.(detailsOf(params))
      },

      startDrag: (params) => {
        const e = params.event.current()
        if (e.type !== 'DRAG.START')
          return
        // 轨道长度按下这一刻现量：此前滚动条多半还收着，量到的是 0
        runMeasure(params)
        const { axis } = axisOf(params)
        params.context.set('drag', {
          origin: axis === 'vertical' ? e.point.clientY : e.point.clientX,
          startScroll: params.context.get('metrics').scroll,
        })
        params.prop('onDragStart')?.(detailsOf(params))
      },

      dragScroll: (params) => {
        const e = params.event.current()
        if (e.type !== 'DRAG.MOVE')
          return
        const drag = params.context.get('drag')
        if (!drag)
          return
        const { axis, dir } = axisOf(params)
        const current = axis === 'vertical' ? e.point.clientY : e.point.clientX
        const delta = pointerDelta(drag.origin, current, { axis, dir })
        applyScroll(params, scrollFromThumbDrag(drag.startScroll, delta, params.context.get('metrics'), minThumbOf(params)))
      },

      endDrag: (params) => {
        params.context.set('drag', null)
        params.prop('onDragEnd')?.(detailsOf(params))
      },

      scrollToTrackPoint: (params) => {
        const e = params.event.current()
        if (e.type !== 'TRACK.CLICK')
          return
        const track = params.refs.get('getTrackEl')()
        if (!track)
          return
        runMeasure(params)
        const { axis, dir } = axisOf(params)
        const offset = trackOffset(e.point, track.getBoundingClientRect(), { axis, dir })
        applyScroll(params, scrollFromTrackPoint(offset, params.context.get('metrics'), minThumbOf(params)))
      },

      stepScroll: (params) => {
        const e = params.event.current()
        if (e.type !== 'STEP')
          return
        runMeasure(params)
        applyScroll(params, params.context.get('metrics').scroll + e.delta)
      },

      scrollToOffset: (params) => {
        const e = params.event.current()
        if (e.type !== 'SCROLL.TO')
          return
        runMeasure(params)
        applyScroll(params, e.offset)
      },
    },
    effects: {
      /**
       * 滚动容器的 scroll 事件与尺寸变化，只能在 DOM 上观察，因此落在效应里。
       * 容器归作者，它可能条件渲染、可能换成另一个盒子：这里盯着「此刻解析到的节点」，
       * 变了就把监听从旧节点挪到新节点；解析不到时投一条诊断，不静默。
       * 推迟一拍首次挂：挂载这一刻作者未必已经把容器交上来。
       *
       * 指针进出同时挂在滚动容器与滚动条根上：hover 档要的是「手还在这一片」，
       * 只听滚动条的话，那条 10px 宽的窄条几乎碰不到。根节点也可能条件渲染，监听跟着它走。
       */
      trackScrollable: ({ refs, send, scope, flush, track, context, prop }) => {
        let disposed = false
        // undefined 是还没对过；null 是对过但没有容器
        let attached: HTMLElement | null | undefined
        let detach: (() => void) | undefined
        /** 此刻打了标记的容器；容器换了或交给原生滚动时撤掉 */
        let marked: HTMLElement | null = null

        const onEnter = (): void => send({ type: 'POINTER.ENTER' })
        const onLeave = (): void => send({ type: 'POINTER.LEAVE' })
        /** 此刻挂着指针监听的根节点；作者换了节点（条件渲染出另一条）就挪过去 */
        let attachedRoot: HTMLElement | null = null

        const syncRoot = (): void => {
          const next = refs.get('getRootEl')()
          context.set('rootMounted', next != null)
          if (next === attachedRoot)
            return
          attachedRoot?.removeEventListener('pointerenter', onEnter)
          attachedRoot?.removeEventListener('pointerleave', onLeave)
          next?.addEventListener('pointerenter', onEnter)
          next?.addEventListener('pointerleave', onLeave)
          attachedRoot = next
        }

        const syncMark = (): void => {
          // 交给原生滚动的、禁用的（恒不显形）都不藏原生滚动条，容器得留着滚动指示
          const native = context.get('coarse') && !prop('forceVisible')
          const want = !native && !prop('disabled') && attached ? attached : null
          if (want === marked)
            return
          if (marked)
            markHost(marked, -1)
          if (want)
            markHost(want, 1)
          marked = want
        }

        const attach = (scrollable: HTMLElement): (() => void) => {
          const win = scope.getWin()
          let idle: ReturnType<typeof setTimeout> | undefined
          const onScroll = (): void => {
            send({ type: 'SCROLL' })
            if (idle !== undefined)
              win.clearTimeout(idle)
            // 成段判定不进状态机：它与显隐那四个状态正交，塞进去要给每个状态各写一条
            idle = win.setTimeout(() => {
              idle = undefined
              send({ type: 'SCROLL.IDLE' })
            }, SCROLLBAR_SCROLL_END_DELAY)
          }
          // 不拦滚动、不 preventDefault，用 passive 监听
          scrollable.addEventListener('scroll', onScroll, { passive: true })

          // 这两个事件不冒泡，只在指针进出各自边界时来一次
          scrollable.addEventListener('pointerenter', onEnter)
          scrollable.addEventListener('pointerleave', onLeave)

          // 无布局环境没有 ResizeObserver：不再跟随尺寸变化，滚动与显式 measure() 仍会重量
          const resize = typeof win.ResizeObserver === 'function'
            ? new win.ResizeObserver(() => send({ type: 'MEASURE' }))
            : null
          resize?.observe(scrollable)

          /**
           * 内容长短变了也要重量，而 ResizeObserver 看不见这件事：容器是定高的，
           * 往里塞十行还是一百行，它自己的盒子一动不动，只有 scrollHeight 在变。
           * 一拍里的连续改动并成一次：读 scrollHeight 会强制布局，不合并会把它按帧摊开。
           */
          let queued = false
          const mutate = typeof win.MutationObserver === 'function'
            ? new win.MutationObserver(() => {
                if (queued)
                  return
                queued = true
                queueMicrotask(() => {
                  queued = false
                  send({ type: 'MEASURE' })
                })
              })
            : null
          mutate?.observe(scrollable, { childList: true, subtree: true, characterData: true })

          return () => {
            if (idle !== undefined)
              win.clearTimeout(idle)
            scrollable.removeEventListener('scroll', onScroll)
            scrollable.removeEventListener('pointerenter', onEnter)
            scrollable.removeEventListener('pointerleave', onLeave)
            resize?.disconnect()
            mutate?.disconnect()
          }
        }

        /** 对一眼此刻的容器：同一个就不动；换了先拆旧的再挂新的；没有就投诊断。 */
        const sync = (): void => {
          if (disposed)
            return
          syncRoot()
          const next = refs.get('getScrollableEl')()
          if (next === attached) {
            syncMark()
            return
          }
          detach?.()
          detach = undefined
          attached = next
          if (!next) {
            syncMark()
            context.set('scrollableId', null)
            reportDiagnostic({
              code: DIAGNOSTIC_CODES.scrollbarMissingScrollable,
              level: 'warn',
              scope: 'scrollbar',
              message: '滚动条找不到它要管的滚动容器：给 scrollable 一个节点，或给 controls 一个能查到节点的 id；容器后到时调一次 measure()',
            })
            return
          }
          detach = attach(next)
          context.set('scrollableId', next.id || null)
          syncMark()
          send({ type: 'MEASURE' })
        }

        flush(sync)
        // 容器节点是谁由作者的 props 决定，变了就挪监听；尺寸一变也顺手对一眼，
        // 这样容器后到时作者调 measure() 就能接上；指针类型或 forceVisible 变了要重打标记
        track([
          () => refs.get('getScrollableEl')(),
          () => refs.get('getRootEl')(),
          context.dep('metrics'),
          context.dep('coarse'),
          () => prop('forceVisible'),
          () => prop('disabled'),
        ], sync)

        return () => {
          disposed = true
          detach?.()
          detach = undefined
          attachedRoot?.removeEventListener('pointerenter', onEnter)
          attachedRoot?.removeEventListener('pointerleave', onLeave)
          attachedRoot = null
          if (marked)
            markHost(marked, -1)
          marked = null
        }
      },

      /** 触屏（粗指针）上默认交给原生滚动；外接鼠标等设备切换时跟着变。 */
      trackPointerType: ({ scope, context }) => {
        const win = scope.getWin()
        if (typeof win.matchMedia !== 'function')
          return undefined
        const query = win.matchMedia('(pointer: coarse)')
        const sync = (): void => context.set('coarse', query.matches)
        sync()
        query.addEventListener('change', sync)
        return () => query.removeEventListener('change', sync)
      },

      waitForHideDelay: ({ prop, send }) => {
        const delay = resolveHideDelay(prop('hideDelay'))
        if (delay == null)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.hideDelay' }), delay)
      },

      // 跟手交给指针会话：监听挂在文档上，指针拖出滚动条仍要跟手，系统收走指针也会收尾
      trackPointer: ({ refs, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getScrollableEl')()),
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        return () => session.dispose()
      },
    },
  },
})
