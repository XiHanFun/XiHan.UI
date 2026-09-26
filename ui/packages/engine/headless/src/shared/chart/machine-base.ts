/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表状态机的共同部分：视口量测、度量与文字度量器、悬停与聚焦、图例显隐与悬停、受控的 hiddenSeries 与 activeKey、场景过渡。
// 几何不在机器里算：连接层与机器都从各组件的管线取结果，管线按输入引用记忆，悬停与聚焦不会让它重算。

import type { ActionFn, Bindable, ContextParams, EffectFn, MachineSchema, Params, TransitionMap } from '@xihan-ui/core'
import type { Scene, TextMeasurer } from '@xihan-ui/viz'
import type { ChartFrame, ChartNumbers, ChartShown, ChartTransitionOptions, ChartTransitionRun, ChartTransitionState } from './transition'
import type {
  ChartCommonProps,
  ChartDatumDetails,
  ChartDatumRef,
  ChartHover,
  ChartKey,
  ChartMetrics,
  ChartSize,
  ChartTranslations,
} from './types'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'
import { CHART_ESTIMATING_MEASURER, createCanvasMeasurer } from './measure'
import { CHART_METRICS, readChartMetrics, sameChartMetrics } from './metrics'
import { advanceChartTransition, syncChartTransition } from './transition'

/** 视口相对根的偏移（px）：提示框画在根里，锚点要加上它。 */
export interface ChartOffset {
  readonly x: number
  readonly y: number
}

export interface ChartBaseProps extends ChartCommonProps {
  translations?: Partial<ChartTranslations>
}

export interface ChartBaseContext {
  /** 视口尺寸；null 表示尚未测量（服务端与首帧）。 */
  size: ChartSize | null
  offset: ChartOffset
  metrics: ChartMetrics
  /** 文字度量器换过几次：精确度量器就绪、字体加载完成都会让布局重算。 */
  measurerVersion: number
  /** 指针悬停命中的数据；指针离开即为 null。 */
  hover: ChartHover | null
  /** 键盘锚点：最后一次聚焦的数据，焦点离开绘图区也保留，Tab 回来落回原处。 */
  focused: ChartDatumRef | null
  /** 焦点此刻是否在绘图区里。 */
  focusWithin: boolean
  /** 焦点是不是键盘带来的（:focus-visible）：焦点环只在这时画。 */
  focusVisible: boolean
  /** Escape 收起过提示框：保留到下一次悬停或聚焦到别的数据。 */
  dismissed: boolean
  /** 悬停着的图例项（系列 id）；其余系列淡出。 */
  legendHover: string | null
  /** 图例的 roving 锚点（系列 id）。 */
  legendFocus: string | null
  /** 正被 Space / Enter 或粗指针按住的图例项（系列 id）：投影 data-pressed，与指针 :active 同一副按压面。 */
  legendPressed: string | null
  hiddenSeries: string[]
  /** 激活的自变量键：自己悬停或聚焦时由机器写，受控时由作者给（联动的另一张图）。 */
  activeKey: ChartKey | null
  /** 上一次通知过的激活数据；只用于去重。 */
  notified: string | null
  /** 过渡中正在显示的那一帧；null 表示显示目标场景本身。 */
  frame: ChartFrame | null
}

export interface ChartBaseRefs {
  /** 根节点，由适配器注入；无 DOM 环境返回 null，机器照常跑、只是量不到尺寸。 */
  getRootEl: () => HTMLElement | null
  /** 视口节点：尺寸观测的宿主。 */
  getViewportEl: () => HTMLElement | null
  /** 文字度量器：挂载前是估算器，挂载后换成 Canvas 度量器。 */
  measurer: TextMeasurer
  /** 机器是否还活着：搬焦点的延迟回调撤不回，卸载后仍会跑，据此认账。 */
  alive: boolean
  /** 在跑的过渡。 */
  transition: ChartTransitionRun | null
  /** 最近一次交给过渡的目标场景。 */
  shown: ChartShown | null
}

/** 各图表共有的派生值。 */
export interface ChartBaseComputed {
  /** 目标场景：管线按输入引用记忆，输入不变就是同一个对象；null 表示此刻不画标记（未测量、规格不合法）。 */
  scene: Scene | null
}

/** 各图表都认的事件。 */
export type ChartBaseEvent
  = | { type: 'RESIZE', size: ChartSize | null, offset: ChartOffset }
    | { type: 'METRICS', metrics: ChartMetrics }
    | { type: 'MEASURER.READY' }
    /** 指针命中了某个数据：连接层用拾取器算好，连同自变量键一起送进来。 */
    | { type: 'HOVER', hover: ChartHover, key: ChartKey }
    | { type: 'HOVER.CLEAR' }
    /** DOM 焦点落到某个数据上（Tab 进来、方向键、点击）；focus 为真时由机器在提交后把焦点搬过去。 */
    | { type: 'DATUM.FOCUS', ref: ChartDatumRef, key: ChartKey, focus?: boolean, visible?: boolean }
    /** 程序化移动锚点：只改锚点，不动 DOM 焦点，不通知。 */
    | { type: 'FOCUS.SET', ref: ChartDatumRef | null }
    | { type: 'PLOT.BLUR', settle?: boolean }
    | { type: 'DISMISS' }
    | { type: 'PRESS', details: ChartDatumDetails }
    | { type: 'LEGEND.TOGGLE', id: string }
    | { type: 'LEGEND.HOVER', id: string | null }
    | { type: 'LEGEND.FOCUS', id: string, focus?: boolean }
    | { type: 'LEGEND.PRESS', id: string | null }
    /** 过渡的逐帧推进。 */
    | { type: 'SCENE.FRAME' }

export type ChartBaseAction
  = | 'setSize'
    | 'setMetrics'
    | 'bumpMeasurer'
    | 'setHover'
    | 'clearHover'
    | 'setFocused'
    | 'setAnchor'
    | 'clearFocusWithin'
    | 'dismiss'
    | 'invokePress'
    | 'toggleSeries'
    | 'setLegendHover'
    | 'setLegendFocus'
    | 'setLegendPressed'
    | 'focusDatum'
    | 'focusLegendItem'
    | 'syncTransition'
    | 'advanceTransition'

/**
 * 各图表机器的公共 schema 下界：只钉住 props / context / refs 三片的最小形状，
 * 事件、action 与状态由具体机器在此之上收窄。
 */
export interface ChartBaseSchema extends MachineSchema {
  props: ChartBaseProps
  context: ChartBaseContext
  computed: ChartBaseComputed
  refs: ChartBaseRefs
}

/** 两个数据引用是否指同一个数据。 */
export function sameChartDatum(a: ChartDatumRef | null, b: ChartDatumRef | null | undefined): boolean {
  return a === b || (a != null && b != null && a.seriesId === b.seriesId && a.index === b.index)
}

function sameHover(a: ChartHover | null, b: ChartHover | null | undefined): boolean {
  return a === b || (a != null && b != null && sameChartDatum(a.ref, b.ref) && a.x === b.x && a.y === b.y)
}

function sameSize(a: ChartSize | null, b: ChartSize | null | undefined): boolean {
  return a === b || (a != null && b != null && a.width === b.width && a.height === b.height)
}

function sameOffset(a: ChartOffset, b: ChartOffset | undefined): boolean {
  return b != null && a.x === b.x && a.y === b.y
}

function sameStrings(a: string[], b: string[] | undefined): boolean {
  return b != null && a.length === b.length && a.every((value, i) => value === b[i])
}

/** 两个自变量键是否相同：日期按时间值比。 */
export function sameChartKey(a: ChartKey | null, b: ChartKey | null | undefined): boolean {
  if (a instanceof Date && b instanceof Date)
    return a.valueOf() === b.valueOf()
  return a === b
}

/** 激活的数据取自哪一路：指针压过键盘，Escape 收起后两路都不取。 */
export function chartActiveSource(context: Pick<ChartBaseContext, 'hover' | 'focused' | 'focusWithin' | 'dismissed'>): 'pointer' | 'keyboard' | null {
  if (context.dismissed)
    return null
  if (context.hover != null)
    return 'pointer'
  return context.focusWithin && context.focused != null ? 'keyboard' : null
}

/**
 * 通知激活的数据：身份与数值拼成去重键，同一个数据、同一个数只通知一次。
 * 悬停与聚焦落在同一个数据时两处 context 各变一次，合成结果没变就不再派回调。
 */
export function notifyChartActive<S extends ChartBaseSchema>(
  { context, prop }: Pick<Params<S>, 'context' | 'prop'>,
  details: ChartDatumDetails | null,
): void {
  const key = details == null
    ? null
    : `${details.seriesId}|${details.index}|${Object.values(details.formatted).join('|')}|${details.items?.length ?? 0}`
  // 缺省值为 null 的 cell 首读是 undefined，两者都当作「没报过」
  if ((context.get('notified') ?? null) === key)
    return
  context.set('notified', key)
  prop('onDatumActive')?.(details)
}

/** 各图表共用的 cell。hiddenSeries 与 activeKey 由 prop 给定即受控。 */
export function chartBaseContext<S extends ChartBaseSchema>(
  { prop, cell }: ContextParams<S>,
): { [K in keyof ChartBaseContext]: Bindable<ChartBaseContext[K]> } {
  return {
    size: cell<ChartSize | null>(() => ({ defaultValue: null, isEqual: sameSize })),
    offset: cell<ChartOffset>(() => ({ defaultValue: { x: 0, y: 0 }, isEqual: sameOffset })),
    metrics: cell<ChartMetrics>(() => ({ defaultValue: CHART_METRICS, isEqual: sameChartMetrics })),
    measurerVersion: cell<number>(() => ({ defaultValue: 0 })),
    hover: cell<ChartHover | null>(() => ({ defaultValue: null, isEqual: sameHover })),
    focused: cell<ChartDatumRef | null>(() => ({ defaultValue: null, isEqual: sameChartDatum })),
    focusWithin: cell<boolean>(() => ({ defaultValue: false })),
    focusVisible: cell<boolean>(() => ({ defaultValue: false })),
    dismissed: cell<boolean>(() => ({ defaultValue: false })),
    legendHover: cell<string | null>(() => ({ defaultValue: null })),
    legendFocus: cell<string | null>(() => ({ defaultValue: null })),
    legendPressed: cell<string | null>(() => ({ defaultValue: null })),
    hiddenSeries: cell<string[]>(() => ({
      value: prop('hiddenSeries'),
      defaultValue: prop('defaultHiddenSeries') ?? [],
      isEqual: sameStrings,
      onChange: hiddenSeries => prop('onHiddenSeriesChange')?.({ hiddenSeries }),
    })),
    activeKey: cell<ChartKey | null>(() => ({
      value: prop('activeKey'),
      defaultValue: null,
      isEqual: sameChartKey,
      onChange: activeKey => prop('onActiveKeyChange')?.({ activeKey }),
    })),
    notified: cell<string | null>(() => ({ defaultValue: null })),
    frame: cell<ChartFrame | null>(() => ({ defaultValue: null })),
  }
}

/** 共用的 refs 初值。 */
export function chartBaseRefs(): ChartBaseRefs {
  return {
    getRootEl: () => null,
    getViewportEl: () => null,
    measurer: CHART_ESTIMATING_MEASURER,
    alive: false,
    transition: null,
    shown: null,
  }
}

/** 在 DOM 里找某个数据的标记：标记与焦点代理都把数据身份写在 data-key 上。 */
function markElement(root: HTMLElement, key: string): HTMLElement | null {
  const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(key) : key.replace(/["\\]/g, '\\$&')
  return root.querySelector<HTMLElement>(`[data-key="${escaped}"][tabindex]`)
}

/** 各图表交给内核的过渡设定；numbers 是随过渡滚动的数，按当前数据算出。 */
export type ChartBaseTransition<S extends ChartBaseSchema> = ChartTransitionOptions & {
  readonly numbers?: (params: Params<S>) => ChartNumbers
}

/** 把机器的几片状态交给过渡。 */
function transitionState<S extends ChartBaseSchema>(params: Params<S>, transition: ChartBaseTransition<S>): ChartTransitionState {
  const { context, refs, prop, scope, computed, send } = params
  const root = refs.get('getRootEl')()
  return {
    animated: prop('animated') !== false,
    target: computed('scene'),
    numbers: transition.numbers?.(params) ?? {},
    size: context.get('size'),
    metrics: context.get('metrics'),
    measurerVersion: context.get('measurerVersion'),
    // 绘图区缺席（作者没写）时退到根：时长与减弱动效按同一条祖先链读
    plot: refs.get('getViewportEl')()?.querySelector('[data-part="plot"]') ?? root,
    win: scope.getWin(),
    shown: refs.get('shown'),
    run: refs.get('transition'),
    frame: context.get('frame'),
    setShown: shown => refs.set('shown', shown),
    setRun: run => refs.set('transition', run),
    setFrame: frame => context.set('frame', frame),
    requestFrame: () => send({ type: 'SCENE.FRAME' } as S['event']),
  }
}

/**
 * 各图表共用的 action。
 * markKeyOf 把数据引用换成标记的 data-key，由各图表按自己的场景给出；transition 是各图表的过渡设定。
 */
export function chartBaseActions<S extends ChartBaseSchema>(options: {
  markKeyOf: (params: Params<S>, ref: ChartDatumRef) => string | null
  transition: ChartBaseTransition<S>
}): Record<ChartBaseAction, ActionFn<S>> {
  return {
    setSize: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'RESIZE')
        return
      context.set('size', e.size)
      context.set('offset', e.offset)
    },

    setMetrics: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type === 'METRICS')
        context.set('metrics', e.metrics)
    },

    bumpMeasurer: ({ context }) => context.set('measurerVersion', v => v + 1),

    setHover: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'HOVER')
        return
      context.set('hover', e.hover)
      context.set('dismissed', false)
      context.set('activeKey', e.key)
    },

    clearHover: ({ context }) => {
      context.set('hover', null)
      // 键盘还在绘图区里时，激活键退回聚焦的那个数据，由连接层按锚点重算
      if (!context.get('focusWithin'))
        context.set('activeKey', null)
    },

    setFocused: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'DATUM.FOCUS')
        return
      context.set('focused', e.ref)
      context.set('focusWithin', true)
      context.set('dismissed', false)
      // 方向键搬过去的焦点一定是键盘带来的；落地那一刻 focusin 再按 :focus-visible 核一次
      context.set('focusVisible', e.focus === true || e.visible === true)
      if (context.get('hover') == null)
        context.set('activeKey', e.key)
    },

    setAnchor: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type === 'FOCUS.SET')
        context.set('focused', e.ref)
    },

    clearFocusWithin: ({ context, refs, event, flush }) => {
      // 锚点留着：清掉就意味着 Tab 回来永远落回第一个数据
      const clear = (): void => {
        context.set('focusWithin', false)
        context.set('focusVisible', false)
        if (context.get('hover') == null)
          context.set('activeKey', null)
      }
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'PLOT.BLUR' || !e.settle) {
        clear()
        return
      }
      // 焦点没有去处：可能是聚焦的焦点代理在重绘中被换掉了（浏览器在摘掉它之前派发 focusout），
      // 等排在前面的转投焦点跑完再看焦点还在不在绘图区里
      flush(() => {
        const root = refs.get('getRootEl')()
        const active = root?.ownerDocument.activeElement
        const plot = active?.closest('[data-part="plot"]')
        if (refs.get('alive') && root && plot && root.contains(plot))
          return
        clear()
      })
    },

    dismiss: ({ context }) => context.set('dismissed', true),

    invokePress: ({ prop, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type === 'PRESS')
        prop('onDatumPress')?.(e.details)
    },

    toggleSeries: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'LEGEND.TOGGLE')
        return
      const hidden = context.get('hiddenSeries')
      context.set('hiddenSeries', hidden.includes(e.id) ? hidden.filter(id => id !== e.id) : [...hidden, e.id])
    },

    setLegendHover: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type === 'LEGEND.HOVER')
        context.set('legendHover', e.id)
    },

    setLegendPressed: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type === 'LEGEND.PRESS')
        context.set('legendPressed', e.id)
    },

    setLegendFocus: ({ context, event }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type === 'LEGEND.FOCUS')
        context.set('legendFocus', e.id)
    },

    /**
     * 把 DOM 焦点搬到锚点那个数据的标记上，只认方向键发来的那一路。
     * 推迟到宿主提交之后再搬：折线的焦点代理这一刻才刚生成。
     */
    focusDatum: (params) => {
      const { refs, context, event, flush } = params
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'DATUM.FOCUS' || !e.focus)
        return
      flush(() => {
        const root = refs.get('getRootEl')()
        const ref = context.get('focused')
        if (!refs.get('alive') || !root || !ref)
          return
        const key = options.markKeyOf(params, ref)
        const el = key == null ? null : markElement(root, key)
        el?.focus({ preventScroll: true })
      })
    },

    focusLegendItem: ({ refs, event, flush }) => {
      const e = event.current() as ChartBaseEvent
      if (e.type !== 'LEGEND.FOCUS' || !e.focus)
        return
      flush(() => {
        const root = refs.get('getRootEl')()
        if (!refs.get('alive') || !root)
          return
        const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(e.id) : e.id.replace(/["\\]/g, '\\$&')
        root.querySelector<HTMLElement>(`[data-value="${escaped}"][aria-pressed]`)?.focus()
      })
    },

    syncTransition: params => syncChartTransition(transitionState(params, options.transition), options.transition),

    advanceTransition: params => advanceChartTransition(transitionState(params, options.transition)),
  }
}

/**
 * 视口量测：尺寸、相对根的偏移、度量与文字度量器。
 *
 * 推迟一拍再挂：挂载这一刻角色节点未必就位。根与视口都观察：图例折行会推着视口往下走而视口本身不变尺寸，
 * 提示框的锚点要跟着偏移。按帧合并，小于 0.5px 的变化不算。祖先链上的 data-density 换档会改度量，也盯着；
 * 字体加载完成会改文字宽度，度量器刷新后重排。
 */
export function trackChartViewport<S extends ChartBaseSchema>(): EffectFn<S> {
  return ({ refs, scope, send, flush }) => {
    let disposed = false
    let stop: VoidFunction | undefined
    refs.set('alive', true)

    flush(() => {
      if (disposed)
        return
      const root = refs.get('getRootEl')()
      const viewport = refs.get('getViewportEl')()
      if (!root || !viewport)
        return
      const win = scope.getWin()
      // 可及名依次取自标题部件、根上的 aria-label / aria-labelledby；都没有时读屏只能念出「图」
      const scopeName = root.getAttribute('data-scope')
      if (!root.querySelector(':scope > [data-part="caption"]') && !root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) {
        reportDiagnostic({
          code: DIAGNOSTIC_CODES.chartMissingName,
          level: 'warn',
          scope: scopeName ?? undefined,
          node: root,
          message: '图表没有可及名：放一个 caption 部件，或在根上写 aria-label / aria-labelledby',
        })
      }
      let last: { width: number, height: number, x: number, y: number } | null = null
      let frame = 0

      const measure = (): void => {
        frame = 0
        if (disposed)
          return
        const width = viewport.clientWidth
        const height = viewport.clientHeight
        // 视口是根的包含块内的普通流节点，offset* 不受祖先的缩放进场影响
        const x = viewport.offsetParent === root ? viewport.offsetLeft : 0
        const y = viewport.offsetParent === root ? viewport.offsetTop : 0
        const changed = !last
          || Math.abs(last.width - width) >= 0.5
          || Math.abs(last.height - height) >= 0.5
          || Math.abs(last.x - x) >= 0.5
          || Math.abs(last.y - y) >= 0.5
        if (!changed)
          return
        last = { width, height, x, y }
        send({ type: 'METRICS', metrics: readChartMetrics(root) })
        send({ type: 'RESIZE', size: width > 0 && height > 0 ? { width, height } : null, offset: { x, y } })
      }
      const schedule = (): void => {
        if (frame !== 0 || disposed)
          return
        frame = typeof win.requestAnimationFrame === 'function' ? win.requestAnimationFrame(measure) : 0
        if (frame === 0)
          measure()
      }

      const resize = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(schedule) : null
      resize?.observe(viewport)
      resize?.observe(root)

      // 密度换档改的是度量令牌，不一定改尺寸
      const remeasureMetrics = (): void => {
        if (!disposed)
          send({ type: 'METRICS', metrics: readChartMetrics(root) })
      }
      const density = typeof win.MutationObserver === 'function' ? new win.MutationObserver(remeasureMetrics) : null
      for (let el: Element | null = root; el; el = el.parentElement)
        density?.observe(el, { attributes: true, attributeFilter: ['data-density'] })

      const measurer = createCanvasMeasurer(root.ownerDocument)
      if (measurer) {
        refs.set('measurer', measurer)
        send({ type: 'MEASURER.READY' })
      }
      const fonts = root.ownerDocument.fonts
      const onFonts = (): void => {
        if (disposed || !measurer)
          return
        measurer.refresh()
        send({ type: 'MEASURER.READY' })
      }
      fonts?.addEventListener('loadingdone', onFonts)
      void fonts?.ready.then(onFonts)

      measure()

      stop = () => {
        resize?.disconnect()
        density?.disconnect()
        fonts?.removeEventListener('loadingdone', onFonts)
        if (frame !== 0 && typeof win.cancelAnimationFrame === 'function')
          win.cancelAnimationFrame(frame)
      }
    })

    return () => {
      disposed = true
      refs.set('alive', false)
      stop?.()
      // 卸载时停掉在跑的过渡：帧循环撤不回就会一直往死机器里送帧
      refs.get('transition')?.stop()
      refs.set('transition', null)
    }
  }
}

/** 共用的事件表：各图表机器把它摊进 on，再补自己的。 */
export function chartBaseTransitions<S extends ChartBaseSchema>(): TransitionMap<S, undefined> {
  return {
    'RESIZE': { actions: ['setSize'] },
    'METRICS': { actions: ['setMetrics'] },
    'MEASURER.READY': { actions: ['bumpMeasurer'] },
    'HOVER': { actions: ['setHover'] },
    'HOVER.CLEAR': { actions: ['clearHover'] },
    'DATUM.FOCUS': { actions: ['setFocused', 'focusDatum'] },
    'FOCUS.SET': { actions: ['setAnchor'] },
    'PLOT.BLUR': { actions: ['clearFocusWithin'] },
    'DISMISS': { actions: ['dismiss'] },
    'PRESS': { actions: ['invokePress'] },
    'LEGEND.TOGGLE': { actions: ['toggleSeries'] },
    'LEGEND.HOVER': { actions: ['setLegendHover'] },
    'LEGEND.FOCUS': { actions: ['setLegendFocus', 'focusLegendItem'] },
    'LEGEND.PRESS': { actions: ['setLegendPressed'] },
    'SCENE.FRAME': { actions: ['advanceTransition'] },
  } as TransitionMap<S, undefined>
}
