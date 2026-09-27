/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { AxisWindow, Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef, ChartFrame } from '../shared/chart'
import type { CartesianActive } from './cartesian-chart.logic'
import type { CartesianScene } from './cartesian-chart.model'
import type {
  CartesianBrushing,
  CartesianBrushSelection,
  CartesianChartApi,
  CartesianChartSchema,
  CartesianLegendItem,
  CartesianMarkTag,
  CartesianTooltipRow,
  CartesianWindow,
  CartesianWindowRatio,
} from './cartesian-chart.types'
import { contains, createPressTracker, dataAttr, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { clampWindow, createScene, domainToWindow, indexRangeToWindow, isFullWindow, markPath, pan, windowToDomain, windowToIndexRange, zoomAt } from '@xihan-ui/viz'
import { chartNavIntentFromKey, chartPatternFill, chartPatterns, placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { cartesianChartAnatomy } from './cartesian-chart.anatomy'
import {
  cartesianActive,
  cartesianAnchor,
  cartesianBrushedData,
  cartesianBrushedRefs,
  cartesianBrushRect,
  cartesianBrushSelectionOf,
  cartesianDatumLabel,
  cartesianDetails,
  cartesianHitTest,
  cartesianKeyIndexOf,
  cartesianLegendScale,
  cartesianMarkKey,
  cartesianModelOf,
  cartesianNavTarget,
  cartesianOverlay,
  cartesianPositionOf,
  cartesianTooltip,
  cartesianTranslations,
  cartesianTrigger,
  FULL_CARTESIAN_RATIO,
  sameWindow,
} from './cartesian-chart.logic'

const parts = cartesianChartAnatomy.build()

/** 图例项：方向键在活 DOM 上按文档序走，值取 data-value（系列 id）。 */
const LEGEND_ITEMS = { scope: cartesianChartAnatomy.name, part: 'legend-item' }

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 色标画成什么：柱与面积是方块，折线是一段短线，散点与棒棒糖是点（形状另由 data-symbol 给出）。 */
function swatchMark(item: { mark: CartesianLegendItem['mark'], area: boolean, symbol: CartesianLegendItem['symbol'] }): 'bar' | 'line' | 'point' {
  return item.symbol != null ? 'point' : item.mark === 'line' && !item.area ? 'line' : 'bar'
}

/** 色阶位置 0–1 换成段号与段内百分比：低段在起点与中点之间，高段在中点与终点之间。 */
function sequentialStop(t: number): { seg: 'low' | 'high', p: string } {
  return t <= 0.5 ? { seg: 'low', p: `${(t * 200).toFixed(1)}%` } : { seg: 'high', p: `${((t - 0.5) * 200).toFixed(1)}%` }
}

/** Ctrl（⌘）滚轮的缩放速率：每个像素的滚动量缩放 e^0.002 倍。 */
const WHEEL_ZOOM_RATE = 0.002

/** 滚轮按行、按页报告滚动量时换算成像素。 */
const WHEEL_LINE = 16
const WHEEL_PAGE = 400

/** 键盘 + / − 一次缩放的倍数。 */
const KEY_ZOOM_STEP = 1.5
/** 拖出刷选框的最短距离（px）：更短的算点击，清掉刷选。 */
const BRUSH_MIN_DRAG = 3
/** 刷选时按框里框外淡出的数据标记。 */
const BRUSHED_PARTS = new Set(['bar', 'point', 'candle', 'wick', 'box', 'whisker', 'median', 'outlier', 'stem'])

/** 缩放条手柄的键盘步长：方向键 1%，Shift 与翻页键 10%。 */
const SLIDE_STEP = 0.01
const SLIDE_PAGE = 0.1

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function cartesianMarkTag(mark: Mark): CartesianMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

const ROLLED = new WeakMap<ChartFrame, Scene>()

/**
 * 更新过渡里标签上的数随标记从旧值滚到新值：按内核给的这一帧的数、用标签自己的写法重写文字。
 * 首次出现的标签等标记长完才淡入，直接写终值；删掉的标签没有目标值，保持原文字收场。
 */
function rolledScene(frame: ChartFrame, target: CartesianScene | null): Scene {
  if (frame.entry || !target)
    return frame.scene
  let scene = ROLLED.get(frame)
  if (!scene) {
    let changed = false
    const front = frame.scene.layers.front.map((mark) => {
      const label = mark.kind === 'text' ? target.labelValues.get(mark.key) : undefined
      const value = frame.numbers[mark.key]
      if (!label || value == null || value === label.value)
        return mark
      changed = true
      return { ...mark, text: label.format(value) }
    })
    scene = changed ? { ...frame.scene, layers: { ...frame.scene.layers, front } } : frame.scene
    ROLLED.set(frame, scene)
  }
  return scene
}

export function connectCartesianChart<T extends PropTypes>(
  service: Service<CartesianChartSchema>,
  normalize: NormalizeProps<T>,
): CartesianChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('cartesian-chart', 'caption', 'summary', 'plot')
  const model = cartesianModelOf(service)
  const translations = cartesianTranslations(prop('translations'))
  const trigger = cartesianTrigger(prop('trigger'), model)
  const orientation = model.spec.orientation
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame ? rolledScene(frame, model.scene) : model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.visible.every(s => s.values.every(v => v == null))
  // 取数中、还没有可画的数据：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = cartesianAnchor(model, focused)
  const anchorKey = anchor ? cartesianMarkKey(model, anchor) : null
  // 锚点落在柱或散点上时标记自己占 Tab 位；落在折线上时绘图区占，聚焦时再转投给焦点代理
  const anchorMark = anchor == null ? undefined : model.derived.visible.find(s => s.spec.id === anchor.seriesId)?.spec.mark
  const anchorIsBar = anchorMark === 'bar' || anchorMark === 'scatter' || anchorMark === 'candlestick' || anchorMark === 'boxplot'

  const active: CartesianActive | null = cartesianActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? cartesianDetails(model, active.ref, trigger) : null
  const tooltip = details ? cartesianTooltip(model, details, translations, prop('tooltipOrder')) : null
  // —— 刷选 ——
  const brushMode = prop('brush') ?? 'none'
  const brushX = brushMode === 'x' || brushMode === 'xy'
  const brushY = brushMode === 'y' || brushMode === 'xy'
  const brushable = brushX || brushY
  const brushing = context.get('brushing')
  const selection = brushable ? context.get('brushSelection') : null
  /** 拖出的框换成范围：拖得太短（点一下）算清掉。 */
  const brushedFrom = (b: CartesianBrushing): CartesianBrushSelection | null =>
    Math.hypot(b.to.x - b.from.x, b.to.y - b.from.y) < BRUSH_MIN_DRAG
      ? null
      : cartesianBrushSelectionOf(model, { x0: b.from.x, y0: b.from.y, x1: b.to.x, y1: b.to.y }, { x: brushX, y: brushY })
  // 拖着时画拖出的框（类目取整到整条带），松手后画落定的范围
  const shownSelection = brushing ? brushedFrom(brushing) : selection
  const brushRect = cartesianBrushRect(model, shownSelection)
  // 框外的数据标记淡出：系列 id → 框里的行号
  const brushed = new Map<string, Set<number>>()
  if (shownSelection) {
    for (const ref of cartesianBrushedRefs(model, shownSelection)) {
      const rows = brushed.get(ref.seriesId) ?? new Set<number>()
      rows.add(ref.index)
      brushed.set(ref.seriesId, rows)
    }
  }
  const setBrushSelection = (next: CartesianBrushSelection | null): void =>
    send({ type: 'BRUSH.SET', selection: next, data: next ? cartesianBrushedData(model, next) : [] })
  /** Shift + 方向键从锚点起沿自变量刷到焦点所在的键；不按 Shift 移动焦点时放下锚点，范围留着。 */
  const brushByKey = (extend: boolean, from: ChartDatumRef | null, to: ChartDatumRef): void => {
    const anchorIndex = context.get('brushAnchor')
    if (!extend) {
      if (anchorIndex != null)
        send({ type: 'BRUSH.ANCHOR', index: null })
      return
    }
    const a = anchorIndex ?? cartesianKeyIndexOf(model, from)
    const b = cartesianKeyIndexOf(model, to)
    if (a < 0 || b < 0)
      return
    if (anchorIndex == null)
      send({ type: 'BRUSH.ANCHOR', index: a })
    const { keys } = model.spec
    setBrushSelection({ x: [keys[Math.min(a, b)]!, keys[Math.max(a, b)]!], y: null })
  }

  const overlay = cartesianOverlay(
    model,
    active,
    trigger,
    focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null,
    brushRect,
  )

  // 淡出：悬停图例项时其余系列淡出；item 模式下激活一个数据时其余系列淡出
  const emphasis = context.get('legendHover') ?? (trigger === 'item' && active && active.source !== 'linked' ? active.ref.seriesId : null)

  const legendItems: CartesianLegendItem[] = model.spec.series.map(s => ({
    id: s.id,
    name: s.name,
    slot: s.slot,
    tone: s.tone,
    mark: s.mark,
    area: s.area,
    symbol: s.symbol,
    sequential: s.color != null,
    hidden: hidden.includes(s.id),
  }))
  const legendScale = cartesianLegendScale(model, translations)
  const legendAnchor = legendItems.some(item => item.id === context.get('legendFocus'))
    ? context.get('legendFocus')
    : legendItems[0]?.id ?? null
  // 含隐藏的系列：图例刚隐藏的系列还在收场，颜色与标记形态照样要取
  const seriesById = new Map(model.spec.series.map(s => [s.id, s]))
  const patterns = chartPatterns(ids.plot, model.spec.series, context.get('metrics').pointSize)
  const patternOf = (id: string): string | undefined => {
    const index = seriesById.get(id)?.pattern
    return index == null ? undefined : String(index)
  }

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取数据的锚点。 */
  const tip = ((): ReturnType<typeof placeChartTooltip> | null => {
    if (!details || !size)
      return null
    const hover = context.get('hover')
    const point = active?.source === 'pointer' && hover ? { x: hover.x, y: hover.y } : details.point
    return placeChartTooltip(point, size, context.get('offset'))
  })()

  /** 指针在绘图区里的坐标：按绘图区的实际显示尺寸换算，祖先有缩放时也对得上。 */
  const pointerAt = (event: PointerEvent | MouseEvent): { x: number, y: number } | null => {
    const el = event.currentTarget as Element | null
    if (!el || !size)
      return null
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0)
      return null
    return {
      x: (event.clientX - rect.left) * (size.width / rect.width),
      y: (event.clientY - rect.top) * (size.height / rect.height),
    }
  }

  // —— 缩放 ——
  const zoom = prop('zoom') ?? 'none'
  const zoomX = zoom === 'x' || zoom === 'xy'
  const zoomY = zoom === 'y' || zoom === 'xy'
  const zoomable = zoomX || zoomY
  const screenZoom = orientation === 'vertical' ? { horizontal: zoomX, vertical: zoomY } : { horizontal: zoomY, vertical: zoomX }
  const screenBrush = orientation === 'vertical' ? { horizontal: brushX, vertical: brushY } : { horizontal: brushY, vertical: brushX }
  const touchH = screenZoom.horizontal || screenBrush.horizontal
  const touchV = screenZoom.vertical || screenBrush.vertical
  const touchAxis = touchH && touchV ? 'both' : touchH ? 'horizontal' : touchV ? 'vertical' : undefined
  const win = context.get('window')
  const drag = context.get('drag')
  const layout = model.scene?.layout ?? null
  const shown = layout?.window ?? FULL_CARTESIAN_RATIO
  const zoomed = !isFullWindow(shown.x) || !isFullWindow(shown.y)
  const category = model.spec.keyScale === 'band' || model.spec.keyScale === 'point'
  const keyCount = model.spec.keys.length
  const keyKind = model.spec.keyScale === 'log' ? 'log' : 'linear'
  const valueKind = model.spec.valueScale === 'log' ? 'log' : 'linear'
  // 窗口最窄：类目轴至少露出一个类目，连续轴放大到 100 倍为止
  const limits = { minSpan: category && keyCount > 0 ? Math.min(1, 1 / keyCount) : 0.01 }
  // 手势从上一次算出的比例接着算：类目轴的窗口取整到类目，细小的几次滚轮若都从取整后的窗口起算会原地不动
  const lastRatio = service.refs.get('zoomRatio')
  const base: CartesianWindowRatio = lastRatio && sameWindow(lastRatio.window, win) ? lastRatio.ratio : shown
  /** 比例换回定义域里的值：类目轴取窗口盖到的首尾类目，连续轴与数值轴按取整后的整条轴换算；整条轴写 null。 */
  const windowOf = (ratio: CartesianWindowRatio): CartesianWindow => {
    let x: CartesianWindow['x'] = null
    if (zoomX && layout && keyCount > 0 && !isFullWindow(ratio.x)) {
      if (category) {
        const [first, last] = windowToIndexRange(ratio.x, keyCount)
        x = first === 0 && last === keyCount - 1 ? null : [model.spec.keys[first]!, model.spec.keys[last]!]
      }
      else if (layout.keyExtent) {
        const [a, b] = windowToDomain(ratio.x, layout.keyExtent, keyKind)
        x = model.spec.keyScale === 'time' || model.spec.keyScale === 'utc' ? [new Date(a), new Date(b)] : [a, b]
      }
    }
    const y = zoomY && layout && !isFullWindow(ratio.y) ? windowToDomain(ratio.y, layout.valueExtent, valueKind) : null
    return { x, y }
  }
  const setRatio = (ratio: CartesianWindowRatio): void => {
    const next = windowOf(ratio)
    service.refs.set('zoomRatio', { ratio, window: next })
    if (!sameWindow(next, win))
      send({ type: 'WINDOW.SET', window: next })
  }
  const setWindow = (next: CartesianWindow): void => {
    if (!sameWindow(next, win))
      send({ type: 'WINDOW.SET', window: next })
  }
  /** 绘图区里的一点换成两根轴在窗口里的相对位置 0–1：key 沿自变量轴，value 沿数值轴（自下而上、自左而右）。 */
  const ratioAt = (at: { x: number, y: number }): { key: number, value: number } | null => {
    if (!layout)
      return null
    const { plot } = layout
    const fx = (at.x - plot.x) / plot.width
    const fy = (at.y - plot.y) / plot.height
    const key = orientation === 'vertical' ? fx : fy
    const value = orientation === 'vertical' ? 1 - fy : fx
    return {
      key: Math.min(1, Math.max(0, prop('xAxis')?.reverse ? 1 - key : key)),
      value: Math.min(1, Math.max(0, prop('yAxis')?.reverse ? 1 - value : value)),
    }
  }
  /** 以画面上的一点为中心缩放：锚点是它在露出的窗口里的位置，换成接着算的那份比例里的位置再缩。 */
  const zoomAxis = (from: AxisWindow, view: AxisWindow, at: number, factor: number, bounds?: { minSpan: number }): AxisWindow => {
    const pivot = view.start + (view.end - view.start) * at
    const span = from.end - from.start
    return zoomAt(from, span > 0 ? (pivot - from.start) / span : 0.5, factor, bounds)
  }
  const zoomAround = (anchor: { key: number, value: number }, factor: number): void => setRatio({
    x: zoomX ? zoomAxis(base.x, shown.x, anchor.key, factor, limits) : base.x,
    y: zoomY ? zoomAxis(base.y, shown.y, anchor.value, factor) : base.y,
  })
  /**
   * 键盘在类目轴上缩放：按整个类目增减，每按一次至少多露或少露一个类目；按比例缩的话，
   * 类目少时一次缩放盖不过一整格，露出的类目不变，这一下就白按了。焦点所在的类目在窗口里的相对位置不变。
   */
  const zoomKeys = (focus: number, factor: number, at: { key: number, value: number }): void => {
    const [first, last] = layout!.keyRange
    const count = last - first + 1
    const next = factor > 1
      ? Math.max(1, Math.min(count - 1, Math.floor(count / factor)))
      : Math.min(keyCount, Math.max(count + 1, Math.ceil(count / factor)))
    const pivot = focus >= first && focus <= last ? focus : first + Math.floor(count / 2)
    const start = Math.min(keyCount - next, Math.max(0, Math.round(pivot + 0.5 - ((pivot + 0.5 - first) / count) * next)))
    setRatio({
      x: indexRangeToWindow(start, start + next - 1, keyCount),
      y: zoomY ? zoomAxis(base.y, shown.y, at.value, factor) : base.y,
    })
  }
  /** 拖着绘图区平移：内容跟着指针走，窗口朝反方向挪。 */
  const panTo = (at: { x: number, y: number }): void => {
    if (!drag || drag.target !== 'plot')
      return
    const dx = (at.x - drag.from.x) / drag.size.x
    const dy = (at.y - drag.from.y) / drag.size.y
    const keyDelta = (orientation === 'vertical' ? -dx : -dy) * (prop('xAxis')?.reverse ? -1 : 1)
    const valueDelta = (orientation === 'vertical' ? dy : -dx) * (prop('yAxis')?.reverse ? -1 : 1)
    setRatio({
      x: zoomX ? pan(drag.window.x, keyDelta) : base.x,
      y: zoomY ? pan(drag.window.y, valueDelta) : base.y,
    })
  }
  /** 一个数据在整条自变量轴上的位置 0–1：类目取类目的中心，连续轴按取整后的整条轴换算。 */
  const keyRatio = (ref: ChartDatumRef): number | null => {
    const j = cartesianKeyIndexOf(model, ref)
    if (j < 0)
      return null
    if (category)
      return (j + 0.5) / keyCount
    const extent = layout?.keyExtent
    const key = model.spec.keys[j]!
    const v = key instanceof Date ? key.valueOf() : Number(key)
    return extent ? domainToWindow([v, v], extent, keyKind).start : null
  }
  /** 键盘把焦点移出了窗口：窗口平移过去，让焦点落在窗口正中。 */
  const follow = (ref: ChartDatumRef): void => {
    if (!zoomX || isFullWindow(shown.x))
      return
    const r = keyRatio(ref)
    if (r == null || (r >= shown.x.start && r <= shown.x.end))
      return
    const span = base.x.end - base.x.start
    setRatio({ ...base, x: clampWindow({ start: r - span / 2, end: r + span / 2 }) })
  }
  /** 缩放条手柄报给读屏的值：窗口那一端对着的键。 */
  const edgeText = (r: number, edge: 'start' | 'end'): string => {
    if (keyCount === 0)
      return ''
    if (category) {
      const j = edge === 'start' ? Math.floor(r * keyCount + 1e-9) : Math.ceil(r * keyCount - 1e-9) - 1
      return model.formats.key(model.spec.keys[Math.min(keyCount - 1, Math.max(0, j))]!)
    }
    const extent = layout?.keyExtent
    if (!extent)
      return ''
    const [v] = windowToDomain({ start: r, end: r }, extent, keyKind)
    return model.formats.key(model.spec.keyScale === 'time' || model.spec.keyScale === 'utc' ? new Date(v) : v)
  }
  const touches = service.refs.get('touches')
  const endPointer = (event: PointerEvent): void => {
    touches.delete(event.pointerId)
    if (drag?.pointerId === event.pointerId)
      send({ type: 'DRAG.END' })
  }
  /** 缩放条上拖一端或整个窗口：按轨道宽度把指针的横向位移换成比例。 */
  const slide = (event: PointerEvent): void => {
    if (!drag || drag.pointerId !== event.pointerId || drag.target === 'plot')
      return
    const d = (event.clientX - drag.from.x) / drag.size.x
    const { start, end } = drag.window.x
    const x = drag.target === 'start'
      ? { start: Math.min(end - limits.minSpan, Math.max(0, start + d)), end }
      : drag.target === 'end'
        ? { start, end: Math.max(start + limits.minSpan, Math.min(1, end + d)) }
        : pan(drag.window.x, d / (end - start))
    setRatio({ ...base, x })
  }
  const slideStart = (target: 'start' | 'end' | 'window') => (event: PointerEvent): void => {
    if (event.button !== 0)
      return
    const el = event.currentTarget as Element
    const track = el.closest(`[data-scope='cartesian-chart'][data-part='zoom-track']`) ?? el
    const width = track.getBoundingClientRect().width
    if (width <= 0)
      return
    event.preventDefault()
    event.stopPropagation()
    el.setPointerCapture?.(event.pointerId)
    send({ type: 'DRAG.START', drag: { target, pointerId: event.pointerId, from: { x: event.clientX, y: 0 }, size: { x: width, y: 1 }, window: base } })
  }
  const clipId = `${ids.plot}-clip`
  const clip = model.scene?.clip ?? null

  const focusTo = (ref: ChartDatumRef, visible: boolean, focus: boolean): void => {
    const j = cartesianKeyIndexOf(model, ref)
    if (j < 0)
      return
    send({ type: 'DATUM.FOCUS', ref, key: model.spec.keys[j]!, focus, visible })
  }

  const legendHandlers = (item: CartesianLegendItem): Record<string, unknown> => {
    const press = createPressTracker({
      isPressed: () => context.get('legendPressed') === item.id,
      onChange: down => send({ type: 'LEGEND.PRESS', id: down ? item.id : null }),
    })
    return {
      'data-pressed': dataAttr(context.get('legendPressed') === item.id),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }
  }

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
    legendItems,
    legendScale,
    patterns,
    active: details,
    tooltip,
    summary: model.summary,
    table: model.table,
    emptyText: loading ? translations.loadingText : translations.emptyText,
    tableCaption: translations.tableCaption,
    activeKey: context.get('activeKey'),
    hiddenSeries: hidden,
    toggleSeries: id => send({ type: 'LEGEND.TOGGLE', id }),
    setFocusedDatum: ref => send({ type: 'FOCUS.SET', ref }),
    markTag: cartesianMarkTag,
    zoom: { x: zoomX, y: zoomY, window: win, ratio: shown },
    brush: { x: brushX, y: brushY, selection, rect: brushRect },
    setBrushSelection,
    clip: clip ? { id: clipId, ...clip } : null,
    setWindow,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-xh-chart-part': 'root',
      'data-orientation': orientation,
      // 顺序色阶的色相：按值着色的点与色阶图例换到这个色相上
      'data-palette': prop('palette'),
      // 规格不合法时不画标记：诊断通道报出原因，根上留一个可观察的状态
      'data-state': invalid ? 'error' : undefined,
      'data-loading': dataAttr(prop('pending') === true),
      'aria-busy': prop('pending') === true ? 'true' : undefined,
    }),

    getCaptionProps: () => normalize.element({
      ...parts.caption.attrs,
      'data-xh-chart-part': 'caption',
      'id': ids.caption,
    }),

    // 图例是工具条：整体一个 Tab 位，左右键在项之间走；图例随文字方向镜像，左右跟随视觉次序
    getLegendProps: () => normalize.element({
      ...parts.legend.attrs,
      'data-xh-chart-part': 'legend',
      'role': 'toolbar',
      'aria-label': translations.legendLabel,
      // 只有一个系列时标题已经说明了它，图例整条收起；按值着色时色阶要读，图例留着
      'hidden': (legendItems.length < 2 && legendScale == null) || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        const container = event.currentTarget as HTMLElement
        const intent = navIntentFromKey(event, { axis: 'horizontal', dir: readDirection(container) })
        if (!intent)
          return
        event.preventDefault()
        const next = itemValue(navigateItems(queryItems(container, LEGEND_ITEMS), legendAnchor, intent))
        if (next != null && next !== legendAnchor)
          send({ type: 'LEGEND.FOCUS', id: next, focus: true })
      },
    }),

    // 图例项是开关：开是常态，按下切换显隐；按 Action Control 的 text profile、ghost、xs 档接家族
    getLegendItemProps: item => normalize.button({
      ...parts['legend-item'].attrs,
      'data-xh-chart-part': 'legend-item',
      'type': 'button',
      'aria-pressed': item.hidden ? 'false' : 'true',
      'tabindex': item.id === legendAnchor ? 0 : -1,
      'data-value': item.id,
      'data-xh-chart-slot': item.slot == null ? undefined : String(item.slot),
      'data-tone': item.tone ?? undefined,
      'data-xh-chart-pattern': patternOf(item.id),
      'data-xh-chart-scale': item.sequential ? 'sequential' : undefined,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-size': 'xs',
      ...legendHandlers(item),
      'onClick': () => send({ type: 'LEGEND.TOGGLE', id: item.id }),
      'onPointerEnter': () => send({ type: 'LEGEND.HOVER', id: item.id }),
      'onPointerLeave': () => send({ type: 'LEGEND.HOVER', id: null }),
      'onFocus': () => send({ type: 'LEGEND.FOCUS', id: item.id }),
    }),

    // 色标只给眼睛看：名字由项里的文字承担
    // 色标随标记：柱与面积是方块，折线是一段短线，散点是它的形状
    getLegendSwatchProps: item => normalize.element({
      ...parts['legend-swatch'].attrs,
      'data-xh-chart-part': 'legend-swatch',
      'aria-hidden': true,
      'data-mark': swatchMark(item),
      'data-symbol': item.symbol ?? undefined,
    }),

    getLegendLabelProps: () => normalize.element({
      ...parts['legend-label'].attrs,
    }),

    // 色阶只给眼睛看：每个点的可及名与数据表里都有它对应的值
    getLegendScaleProps: () => normalize.element({
      ...parts['legend-scale'].attrs,
      'aria-hidden': true,
      'hidden': legendScale == null || undefined,
    }),

    getLegendScaleNameProps: () => normalize.element({
      ...parts['legend-scale-name'].attrs,
    }),

    getLegendScaleBarProps: () => normalize.element({
      ...parts['legend-scale-bar'].attrs,
    }),

    getLegendScaleValueProps: edge => normalize.element({
      ...parts['legend-scale-value'].attrs,
      'data-edge': edge,
    }),

    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-xh-chart-part': 'viewport',
    }),

    getPlotProps: () => normalize.element({
      ...parts.plot.attrs,
      'data-xh-chart-part': 'plot',
      'id': ids.plot,
      'role': 'graphics-document',
      'aria-roledescription': translations.chartRoleDescription,
      'aria-labelledby': ids.caption,
      'aria-describedby': ids.summary,
      // 柱自己占 Tab 位；锚点在折线上时绘图区占，聚焦后转投焦点代理。没有数据时不占
      'tabindex': anchor == null ? undefined : anchorIsBar ? -1 : 0,
      'width': size?.width,
      'height': size?.height,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
      // 能缩放或刷选的屏幕方向：触屏在这个方向上的拖动与捏合归绘图区，另一个方向照常滚动页面
      'data-touch-axis': touchAxis,
      'data-zoomed': dataAttr(zoomed),
      'data-selectable': dataAttr(brushable),
      'data-dragging': dataAttr(drag?.target === 'plot' || brushing != null),
      'onWheel': (event: WheelEvent) => {
        // 滚轮只在按住 Ctrl（⌘）时缩放：不按时让页面照常滚动
        if (!zoomable || !(event.ctrlKey || event.metaKey))
          return
        const at = pointerAt(event)
        const r = at ? ratioAt(at) : null
        if (!r)
          return
        event.preventDefault()
        const delta = event.deltaMode === 1 ? event.deltaY * WHEEL_LINE : event.deltaMode === 2 ? event.deltaY * WHEEL_PAGE : event.deltaY
        zoomAround(r, Math.exp(-delta * WHEEL_ZOOM_RATE))
      },
      'onPointerDown': (event: PointerEvent) => {
        if (!(zoomable || brushable) || event.button !== 0 || !layout)
          return
        const at = pointerAt(event)
        if (!at)
          return
        if (event.pointerType === 'touch') {
          touches.set(event.pointerId, at)
          // 第二根手指按下：改为捏合，停掉单指的平移与刷选
          if (touches.size >= 2) {
            if (drag)
              send({ type: 'DRAG.END' })
            if (brushing)
              send({ type: 'BRUSH.END' })
            return
          }
        }
        const target = event.currentTarget as Element
        // 开了刷选时拖动即刷选，平移改用缩放条或键盘；从绘图区里起刷，坐标轴上按下不算
        if (brushable) {
          const { plot } = layout
          if (at.x < plot.x || at.x > plot.x + plot.width || at.y < plot.y || at.y > plot.y + plot.height)
            return
          // 拦下按下：鼠标按下的缺省动作会把焦点给绘图区、转投到锚点上弹出提示框，拖动时还会选中页面文字
          event.preventDefault()
          target.setPointerCapture?.(event.pointerId)
          // 收起提示框：松手后浏览器补派的 click 不该把悬停的数据当成按下
          send({ type: 'HOVER.CLEAR' })
          send({ type: 'BRUSH.START', brushing: { pointerId: event.pointerId, from: at, to: at } })
          return
        }
        if (!zoomed)
          return
        target.setPointerCapture?.(event.pointerId)
        send({ type: 'DRAG.START', drag: { target: 'plot', pointerId: event.pointerId, from: at, size: { x: layout.plot.width, y: layout.plot.height }, window: base } })
      },
      'onPointerUp': (event: PointerEvent) => {
        // 松手才落定：派发一次范围变化
        if (brushing && brushing.pointerId === event.pointerId) {
          setBrushSelection(brushedFrom({ ...brushing, to: pointerAt(event) ?? brushing.to }))
          send({ type: 'BRUSH.END' })
        }
        endPointer(event)
      },
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        // 两根手指：按两指间距的变化缩放，锚点在两指中间
        if (at && event.pointerType === 'touch' && touches.has(event.pointerId) && touches.size === 2) {
          const [a, b] = [...touches.values()]
          const before = Math.hypot(a!.x - b!.x, a!.y - b!.y)
          touches.set(event.pointerId, at)
          const [c, d] = [...touches.values()]
          const after = Math.hypot(c!.x - d!.x, c!.y - d!.y)
          const mid = ratioAt({ x: (c!.x + d!.x) / 2, y: (c!.y + d!.y) / 2 })
          if (before > 0 && after > 0 && mid)
            zoomAround(mid, after / before)
          return
        }
        if (at && event.pointerType === 'touch' && touches.has(event.pointerId))
          touches.set(event.pointerId, at)
        if (brushing && brushing.pointerId === event.pointerId) {
          if (at)
            send({ type: 'BRUSH.MOVE', to: at })
          return
        }
        // 拖着平移时不命中数据：提示框跟着指针乱跳没有意义
        if (drag?.target === 'plot' && drag.pointerId === event.pointerId) {
          if (at)
            panTo(at)
          return
        }
        const hit = at ? cartesianHitTest(model, at.x, at.y, trigger, event.pointerType) : null
        if (!hit || !at) {
          if (context.get('hover') != null)
            send({ type: 'HOVER.CLEAR' })
          return
        }
        send({ type: 'HOVER', hover: { ref: hit.ref, x: at.x, y: at.y }, key: hit.key })
      },
      'onPointerLeave': () => send({ type: 'HOVER.CLEAR' }),
      // 指针被系统收走（拖拽、右键菜单）时也要收起，否则提示框会一直挂着
      'onPointerCancel': (event: PointerEvent) => {
        endPointer(event)
        if (brushing?.pointerId === event.pointerId)
          send({ type: 'BRUSH.END' })
        send({ type: 'HOVER.CLEAR' })
      },
      'onClick': () => {
        const hover = context.get('hover')
        const pressed = hover ? cartesianDetails(model, hover.ref, trigger) : null
        if (pressed)
          send({ type: 'PRESS', details: pressed })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          // 不 preventDefault：外层浮层的关闭仍归它自己
          if (details)
            send({ type: 'DISMISS' })
          if (selection)
            setBrushSelection(null)
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          const own = focused && focusWithin ? cartesianDetails(model, focused, trigger) : null
          if (!own)
            return
          event.preventDefault()
          send({ type: 'PRESS', details: own })
          return
        }
        // + / − 以焦点所在的数据为中心缩放
        if (zoomable && (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '_')) {
          event.preventDefault()
          const from = focused && focusWithin ? focused : anchor
          const p = from ? model.scene?.anchors.get(from.seriesId)?.[cartesianPositionOf(model, from)] : null
          const factor = event.key === '+' || event.key === '=' ? KEY_ZOOM_STEP : 1 / KEY_ZOOM_STEP
          const at = (p ? ratioAt(p) : null) ?? { key: 0.5, value: 0.5 }
          if (category && zoomX && layout) {
            zoomKeys(from ? cartesianKeyIndexOf(model, from) : -1, factor, at)
            return
          }
          zoomAround(at, factor)
          return
        }
        const intent = chartNavIntentFromKey(event, orientation)
        // 返回 null 表示该键不归绘图区管：绝不 preventDefault，页面滚动与读屏要用
        if (!intent || !anchor)
          return
        // 键归绘图区管就先拦下：走到头没处可去时也不该让页面跟着滚
        event.preventDefault()
        const current = focused && focusWithin ? focused : anchor
        const next = cartesianNavTarget(model, current, intent)
        if (next) {
          follow(next)
          focusTo(next, true, true)
          if (brushX && intent !== 'series-next' && intent !== 'series-prev')
            brushByKey(event.shiftKey, current, next)
        }
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const plot = event.currentTarget as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        // 焦点落在绘图区自己身上（Tab 进来而锚点在折线上）：转投给锚点的焦点代理
        if (target === plot) {
          if (anchor)
            focusTo(anchor, visible, true)
          return
        }
        const key = target.getAttribute('data-key')
        const info = key == null ? undefined : model.scene?.info.get(key)
        if (!info || info.position < 0)
          return
        const s = model.derived.visible.find(v => v.spec.id === info.seriesId)
        if (s)
          focusTo({ seriesId: s.spec.id, index: s.rows[info.position]! }, visible, false)
      },
      'onFocusOut': (event: FocusEvent) => {
        // 绘图区内部换焦点不算离场，提示框要跟着焦点继续显示
        if (contains(event.currentTarget as Element, event.relatedTarget as Node | null))
          return
        // 焦点没有去处时交给机器稍后核实：换掉聚焦的焦点代理也会走到这里
        send({ type: 'PLOT.BLUR', settle: event.relatedTarget == null })
      },
    }),

    getDefsProps: () => normalize.element({
      ...parts.defs.attrs,
      'data-xh-chart-part': 'defs',
    }),

    getPatternProps: pattern => normalize.element({
      ...parts.pattern.attrs,
      'data-xh-chart-part': 'pattern',
      'id': pattern.id,
      'patternUnits': 'userSpaceOnUse',
      'width': pattern.size,
      'height': pattern.size,
      'patternTransform': pattern.angle === 0 ? undefined : `rotate(${pattern.angle})`,
      'data-xh-chart-slot': pattern.slot == null ? undefined : String(pattern.slot),
      'data-tone': pattern.tone ?? undefined,
    }),

    getPatternLineProps: pattern => normalize.element({
      ...parts['pattern-line'].attrs,
      'data-xh-chart-part': 'pattern-line',
      'd': pattern.path,
    }),

    getMarkProps: (mark) => {
      const part = parts[mark.part as keyof typeof parts]
      // 焦点环与引导线由 Chart 家族配方画：投影家族部件名
      const base = part ? { ...part.attrs, 'data-xh-chart-part': mark.part === 'focus-ring' || mark.part === 'leader-line' ? mark.part : undefined } : {}
      if (mark.kind === 'group') {
        if (mark.part === 'series') {
          const id = mark.key.slice('series:'.length)
          // 退出中的系列（图例刚隐藏它）不进可访问树
          const spec = seriesById.get(id)
          return normalize.element({
            ...base,
            'role': mark.exiting ? undefined : 'graphics-object',
            'aria-roledescription': mark.exiting ? undefined : translations.seriesRoleDescription,
            'aria-label': mark.exiting ? undefined : spec?.name ?? id,
            'aria-hidden': mark.exiting || undefined,
            'data-series-id': id,
            'data-xh-chart-slot': spec?.slot == null ? undefined : String(spec.slot),
            'data-tone': spec?.tone ?? undefined,
            // 纹理模式下柱与面积拿这一格纹理当填充，折线按序号换线型
            'data-xh-chart-pattern': patternOf(id),
            ...(spec?.pattern == null ? {} : { style: { '--xh-_chart-pattern': chartPatternFill(ids.plot, spec.pattern) } }),
            'data-mark': spec?.mark,
            // 按值着色的系列不取分类色：系列色换成色阶中点，点各自按值取色
            'data-xh-chart-scale': spec?.color != null ? 'sequential' : undefined,
            'data-dimmed': dataAttr(emphasis != null && emphasis !== id),
            // 缩放后窗外的标记裁掉：只露出绘图区里的那一段
            'clip-path': clip ? `url(#${clipId})` : undefined,
          })
        }
        return normalize.element({
          ...base,
          // 网格与坐标轴只给眼睛看：信息由摘要与数据表承担
          'aria-hidden': true,
          'data-axis': mark.part === 'axis' ? mark.key.slice('axis:'.length) : undefined,
        })
      }
      if (mark.kind === 'text') {
        const text = mark as TextMark
        // 数据标签、合计与线尾标签只给眼睛看：数值已在每个数据的可及名里。压在色块上的标签带色槽，
        // 字取配对的前景色；所属系列被淡出时一起淡出；首次出现等柱长到、笔尖扫到才淡入
        const label = mark.part === 'data-label' || mark.part === 'total-label' || mark.part === 'end-label'
        const placement = label ? model.scene?.placements.get(mark.key) : undefined
        const owner = mark.datum ? seriesById.get(mark.datum.seriesId) : undefined
        const inside = placement === 'inside'
        // 注释的标签：只给眼睛看，名字与值由摘要承担；跟着系列的注释随系列淡出
        const note = model.scene?.annotations.get(mark.key)
        const at = frame?.revealAt.get(mark.key)
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'transform': text.rotate ? `rotate(${text.rotate} ${text.x} ${text.y})` : undefined,
          'opacity': mark.opacity,
          'aria-hidden': label || note != null || undefined,
          'data-kind': note?.kind,
          'data-placement': mark.part === 'data-label' ? placement : undefined,
          'data-xh-chart-slot': inside && owner?.slot != null ? String(owner.slot) : undefined,
          'data-tone': inside ? owner?.tone ?? undefined : undefined,
          'data-dimmed': label
            ? dataAttr(emphasis != null && owner != null && emphasis !== owner.id)
            : note ? dataAttr(emphasis != null && note.seriesId != null && emphasis !== note.seriesId) : undefined,
          'data-drawing': dataAttr(at != null),
          ...(at == null ? {} : { style: { '--xh-_chart-reveal-at': at.toFixed(3) } }),
        })
      }
      // 新出现的折线由描线关键帧从头描到尾：路径长度归一，虚线偏移从 1 走到 0；
      // 数据点等笔尖扫到才淡入：内核按描线的曲线换算出它占入场时长的比例，样式乘上时长得到延迟
      const stroke = mark.part === 'line' && frame?.entering.has(mark.key) === true
      const at = frame?.revealAt.get(mark.key)
      const props: Record<string, unknown> = {
        ...base,
        'd': pathOf(mark),
        'opacity': mark.opacity,
        'pathLength': stroke ? 1 : undefined,
        'data-drawing': dataAttr(stroke || at != null),
        ...(at == null ? {} : { style: { '--xh-_chart-reveal-at': at.toFixed(3) } }),
      }
      // 退出中的标记只剩收场的样子：不可聚焦、不进可访问树
      if (mark.exiting) {
        props['aria-hidden'] = true
      }
      else if (mark.part === 'bar' || mark.part === 'candle' || mark.part === 'box' || (mark.part === 'point' && mark.a11y?.focusable)) {
        // 散点的点、棒棒糖的点与柱一样本身就是数据标记，roving 取 Tab 位；折线上的点是焦点代理，出现即占
        const proxy = mark.part === 'point' && mark.datum != null && seriesById.get(mark.datum.seriesId)?.mark === 'line'
        const ref = mark.datum ?? null
        const own = ref ? cartesianDetails(model, ref, 'item') : null
        props.role = 'graphics-symbol'
        props['aria-label'] = own ? cartesianDatumLabel(own, translations) : undefined
        props['data-key'] = mark.key
        props.tabindex = proxy ? 0 : mark.key === anchorKey ? 0 : -1
      }
      else {
        props['aria-hidden'] = true
      }
      if (mark.part === 'point') {
        const spec = mark.datum ? seriesById.get(mark.datum.seriesId) : undefined
        props['data-xh-chart-slot'] = spec?.slot == null ? undefined : String(spec.slot)
        props['data-tone'] = spec?.tone ?? undefined
        // 按值着色：色阶位置换成段号与段内百分比，皮肤用一层 color-mix 在相邻两个锚点之间插值
        const stop = mark.paint?.t == null ? null : sequentialStop(mark.paint.t)
        if (stop) {
          props['data-seg'] = stop.seg
          props.style = { ...(props.style as Record<string, string> | undefined), '--xh-_chart-p': stop.p }
        }
      }
      // 瀑布的一步、K 线按涨跌取色：涨跌写在标记上，瀑布的小计不写、保持系列色；美国线是描边画的一条路径
      if (mark.part === 'bar' || mark.part === 'candle' || mark.part === 'wick')
        props['data-trend'] = mark.paint?.trend
      if (mark.part === 'candle')
        props['data-style'] = mark.kind === 'rect' ? 'candle' : 'ohlc'
      // 箱线的箱是矩形，小提琴是密度轮廓
      if (mark.part === 'box')
        props['data-style'] = mark.kind === 'rect' ? 'box' : 'violin'
      if (mark.part === 'crosshair')
        props['data-kind'] = mark.kind === 'rect' ? 'band' : 'line'
      // 刷选时框外的数据标记淡出；折线与面积是整条路径，不分框里框外
      if (shownSelection && mark.datum && BRUSHED_PARTS.has(mark.part))
        props['data-dimmed'] = dataAttr(brushed.get(mark.datum.seriesId)?.has(mark.datum.index) !== true)
      // 注释：参考线与参考带是结构色，跟着系列的（标出的点、平均线、趋势线）取系列色、随系列淡出
      if (mark.part === 'annotation') {
        const note = model.scene?.annotations.get(mark.key)
        const owner = note?.seriesId == null ? undefined : seriesById.get(note.seriesId)
        props['data-kind'] = note?.kind
        props['data-method'] = note?.method
        props['data-xh-chart-slot'] = owner?.slot == null ? undefined : String(owner.slot)
        props['data-tone'] = owner?.tone ?? undefined
        props['data-xh-chart-scale'] = owner?.color != null ? 'sequential' : undefined
        props['data-dimmed'] = dataAttr(emphasis != null && note?.seriesId != null && emphasis !== note.seriesId)
        props['clip-path'] = clip ? `url(#${clipId})` : undefined
      }
      // 线尾标签的引导线随所属系列淡出
      if (mark.part === 'leader-line')
        props['data-dimmed'] = dataAttr(emphasis != null && mark.datum != null && emphasis !== mark.datum.seriesId)
      return normalize.element(props)
    },

    // 裁剪区画在绘图区的 defs 里：缩放后窗外的系列与注释按它裁掉
    getClipPathProps: () => normalize.element({
      ...parts['clip-path'].attrs,
      id: clipId,
    }),

    getClipRectProps: () => normalize.element({
      ...parts['clip-rect'].attrs,
      x: clip?.x,
      y: clip?.y,
      width: clip?.width,
      height: clip?.height,
    }),

    // 缩放条：一条轨道上的窗口与两端的手柄，对着自变量轴的整条轴；绘图区不随 RTL 镜像，缩放条也不镜像
    getZoomSliderProps: () => normalize.element({
      ...parts['zoom-slider'].attrs,
      'role': 'group',
      'aria-label': translations.zoomLabel,
      // 缩放条是横的，只对着横向的自变量轴
      'hidden': !zoomX || orientation !== 'vertical' || undefined,
      'data-dragging': dataAttr(drag != null && drag.target !== 'plot'),
      // 缩放条与视口同宽：左右各内缩到绘图区的两边，轨道正对着自变量轴
      'style': {
        '--xh-_chart-zoom-start': `${(shown.x.start * 100).toFixed(3)}%`,
        '--xh-_chart-zoom-end': `${(shown.x.end * 100).toFixed(3)}%`,
        ...(layout && size && {
          '--xh-_chart-zoom-left': `${layout.plot.x}px`,
          '--xh-_chart-zoom-right': `${Math.max(0, size.width - layout.plot.x - layout.plot.width)}px`,
        }),
      },
    }),

    getZoomTrackProps: () => normalize.element({
      ...parts['zoom-track'].attrs,
      // 按在轨道空处：窗口移过去，以按下的位置为中心
      onPointerDown: (event: PointerEvent) => {
        if (event.button !== 0 || event.target !== event.currentTarget)
          return
        const rect = (event.currentTarget as Element).getBoundingClientRect()
        if (rect.width <= 0)
          return
        const r = (event.clientX - rect.left) / rect.width
        const span = base.x.end - base.x.start
        setRatio({ ...base, x: clampWindow({ start: r - span / 2, end: r + span / 2 }) })
      },
    }),

    getZoomWindowProps: () => normalize.element({
      ...parts['zoom-window'].attrs,
      onPointerDown: slideStart('window'),
      onPointerMove: slide,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
    }),

    getZoomHandleProps: edge => normalize.element({
      ...parts['zoom-handle'].attrs,
      'role': 'slider',
      'tabindex': 0,
      'data-placement': edge,
      'aria-label': edge === 'start' ? translations.zoomStartLabel : translations.zoomEndLabel,
      'aria-orientation': 'horizontal',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': Math.round(shown.x[edge] * 100),
      'aria-valuetext': edgeText(shown.x[edge], edge),
      'onPointerDown': slideStart(edge),
      'onPointerMove': slide,
      'onPointerUp': endPointer,
      'onPointerCancel': endPointer,
      'onKeyDown': (event: KeyboardEvent) => {
        // 从露出的窗口起算：类目轴一步正好一个类目
        const { start, end } = shown.x
        const unit = category && keyCount > 0 ? 1 / keyCount : SLIDE_STEP
        const page = Math.max(unit, SLIDE_PAGE)
        const big = event.shiftKey ? page : unit
        const delta = event.key === 'ArrowRight' || event.key === 'ArrowUp'
          ? big
          : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
            ? -big
            : event.key === 'PageUp' ? page : event.key === 'PageDown' ? -page : null
        let x: { start: number, end: number } | null = null
        if (delta != null)
          x = edge === 'start' ? { start: Math.min(end - limits.minSpan, Math.max(0, start + delta)), end } : { start, end: Math.max(start + limits.minSpan, Math.min(1, end + delta)) }
        else if (event.key === 'Home')
          x = edge === 'start' ? { start: 0, end } : { start, end: start + limits.minSpan }
        else if (event.key === 'End')
          x = edge === 'start' ? { start: end - limits.minSpan, end } : { start, end: 1 }
        if (!x)
          return
        event.preventDefault()
        setRatio({ ...shown, x })
      },
    }),

    // 提示框不进读屏：每个标记的可及名已经念全了键与数值，再念一遍是重复
    getTooltipProps: () => normalize.element({
      ...parts.tooltip.attrs,
      'data-xh-chart-part': 'tooltip',
      'aria-hidden': true,
      'data-state': tooltip ? 'visible' : 'hidden',
      // 落在锚点的哪个角：绘图区不随 RTL 镜像，左右是物理方向
      'data-placement': tip ? `${tip.block === 'above' ? 'top' : 'bottom'}-${tip.side === 'end' ? 'right' : 'left'}` : undefined,
      // 量过才给这个键：给 undefined 会把作者写在提示框上的整条内联样式删掉
      ...(tip == null
        ? {}
        : { style: { '--xh-_chart-tip-x': `${tip.x}px`, '--xh-_chart-tip-y': `${tip.y}px` } }),
    }),

    getTooltipHeaderProps: () => normalize.element({
      ...parts['tooltip-header'].attrs,
      'data-xh-chart-part': 'tooltip-header',
    }),

    getTooltipRowProps: (row: CartesianTooltipRow) => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-xh-chart-part': 'tooltip-row',
      'data-series-id': row.seriesId,
      'data-xh-chart-slot': row.slot == null ? undefined : String(row.slot),
      'data-tone': row.tone ?? undefined,
      'data-xh-chart-pattern': patternOf(row.seriesId),
      'data-xh-chart-scale': seriesById.get(row.seriesId)?.color != null ? 'sequential' : undefined,
      'data-current': dataAttr(active != null && trigger === 'axis' && row.seriesId === active.ref.seriesId),
    }),

    getTooltipSwatchProps: row => normalize.element({
      ...parts['tooltip-swatch'].attrs,
      'data-xh-chart-part': 'tooltip-swatch',
      'data-mark': swatchMark(row),
      'data-symbol': row.symbol ?? undefined,
      // 按值着色的数据：色标画成这个数据自己的颜色
      'data-seg': row.t == null ? undefined : sequentialStop(row.t).seg,
      ...(row.t == null ? {} : { style: { '--xh-_chart-p': sequentialStop(row.t).p } }),
    }),

    getTooltipValueProps: () => normalize.element({
      ...parts['tooltip-value'].attrs,
      'data-xh-chart-part': 'tooltip-value',
    }),

    getTooltipNameProps: () => normalize.element({
      ...parts['tooltip-name'].attrs,
      'data-xh-chart-part': 'tooltip-name',
    }),

    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      'data-xh-chart-part': 'empty',
      // 空态随数据显隐；全部系列被隐藏时坐标轴保留，空态叠在视口上
      'hidden': !empty || undefined,
      'data-state': loading ? 'loading' : undefined,
    }),

    getSummaryProps: () => normalize.element({
      ...parts.summary.attrs,
      id: ids.summary,
      style: VISUALLY_HIDDEN_STYLE,
    }),

    getTableProps: () => normalize.element({
      ...parts.table.attrs,
      style: VISUALLY_HIDDEN_STYLE,
    }),
  }
}
