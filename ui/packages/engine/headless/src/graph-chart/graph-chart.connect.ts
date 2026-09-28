/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 graph chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { GraphActive, GraphNavIntent } from './graph-chart.logic'
import type { GraphChartApi, GraphChartSchema } from './graph-chart.schema'
import type { GraphLegendItem, GraphMarkTag, GraphTooltipRow, GraphView } from './graph-chart.types'
import { contains, createPressTracker, dataAttr, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { graphChartAnatomy } from './graph-chart.anatomy'
import {
  graphActive,
  graphDetails,
  graphFirstRef,
  graphHitTest,
  graphMarkKey,
  graphModelOf,
  graphNavTarget,
  graphNodeOf,
  graphNodeRef,
  graphOverlay,
  graphTooltip,
  graphTranslations,
  graphViewOf,
} from './graph-chart.logic'

const parts = graphChartAnatomy.build()

/** 图例项：方向键在活 DOM 上按文档序走，值取 data-value（分组）。 */
const LEGEND_ITEMS = { scope: graphChartAnatomy.name, part: 'legend-item' }

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 按键 → 走法；绘图区不随 RTL 镜像。 */
const NAV_KEYS: Readonly<Record<string, GraphNavIntent>> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Home: 'first',
  End: 'last',
}

/** 缩放的范围与每一步的倍数。 */
const ZOOM_MIN = 1
const ZOOM_MAX = 8
const ZOOM_STEP = 1.25
/** 滚轮缩放：每像素的指数速率；按行、按页滚动时换算成像素。 */
const WHEEL_ZOOM_RATE = 0.002
const WHEEL_LINE = 16
const WHEEL_PAGE = 400

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function graphMarkTag(mark: Mark): GraphMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

export function connectGraphChart<T extends PropTypes>(
  service: Service<GraphChartSchema>,
  normalize: NormalizeProps<T>,
): GraphChartApi<T> {
  const { context, prop, send, scope, refs } = service
  const ids = scope.ids('graph-chart', 'caption', 'summary', 'plot')
  const model = graphModelOf(service)
  const translations = graphTranslations(prop('translations'))
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.nodes.length === 0
  const layout = model.scene?.layout
  const view: GraphView = graphViewOf(prop, context)
  const drag = context.get('drag')
  const zoomable = prop('zoom') === true
  const draggable = model.layout === 'force' && prop('draggableNodes') !== false

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = graphNodeOf(model, focused) ? focused : graphFirstRef(model)
  const anchorKey = anchor ? graphMarkKey(model, anchor) : null

  const active: GraphActive | null = graphActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? graphDetails(model, active.ref) : null
  const tooltip = graphTooltip(model, active, translations)
  const overlay = graphOverlay(model, focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null)

  // 强调：指着一个节点时它、它的邻居与连着它的线留着，线换成它的颜色；悬停图例项时那一组的节点与连着它们的线留着。其余淡出
  const legendHover = context.get('legendHover')
  const activeNode = active ? graphNodeOf(model, active.ref) : undefined
  const keptNodes = new Set<string>()
  const keptLinks = new Set<number>()
  if (activeNode) {
    keptNodes.add(activeNode.node.id)
    for (const l of model.derived.links) {
      if (l.source === activeNode.node.id || l.target === activeNode.node.id) {
        keptLinks.add(l.index)
        keptNodes.add(l.source)
        keptNodes.add(l.target)
      }
    }
  }
  else if (legendHover != null) {
    for (const n of model.derived.nodes) {
      if (n.group === legendHover)
        keptNodes.add(n.id)
    }
    for (const l of model.derived.links) {
      if (keptNodes.has(l.source) || keptNodes.has(l.target))
        keptLinks.add(l.index)
    }
  }
  const emphasis = activeNode != null || legendHover != null

  const legendItems: GraphLegendItem[] = model.spec.groups.map(g => ({ id: g.id, name: g.id, slot: g.slot, hidden: hidden.includes(g.id) }))
  const legendAnchor = legendItems.some(item => item.id === context.get('legendFocus'))
    ? context.get('legendFocus')
    : legendItems[0]?.id ?? null

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取节点中心。 */
  const tip = ((): ReturnType<typeof placeChartTooltip> | null => {
    if (!details || !size || drag)
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

  const focusTo = (ref: ChartDatumRef, visible: boolean, focus: boolean): void => {
    const g = graphNodeOf(model, ref)
    if (g)
      send({ type: 'DATUM.FOCUS', ref, key: g.node.id, focus, visible })
  }

  /** 以 at 为锚点缩放：锚点下的内容不动。回到 1 倍时平移归零。 */
  const zoomBy = (factor: number, at?: { x: number, y: number }): void => {
    if (!zoomable || !size)
      return
    const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, view.k * factor))
    if (k === view.k)
      return
    const p = at ?? { x: size.width / 2, y: size.height / 2 }
    const next = k === ZOOM_MIN ? { k, x: 0, y: 0 } : { k, x: p.x - (p.x - view.x) * (k / view.k), y: p.y - (p.y - view.y) * (k / view.k) }
    send({ type: 'VIEW.SET', view: next })
  }

  const legendHandlers = (item: GraphLegendItem): Record<string, unknown> => {
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

  const endPointer = (event: PointerEvent): void => {
    if (drag && drag.pointerId === event.pointerId)
      send({ type: 'DRAG.END' })
  }

  // 取数中、还没有可画的数据：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
    legendItems,
    active: details,
    tooltip,
    summary: model.summary,
    table: model.table,
    emptyText: loading ? translations.loadingText : translations.emptyText,
    tableCaption: translations.tableCaption,
    activeKey: context.get('activeKey'),
    hiddenSeries: hidden,
    view,
    toggleSeries: id => send({ type: 'LEGEND.TOGGLE', id }),
    zoomBy,
    resetView: () => send({ type: 'VIEW.SET', view: { k: 1, x: 0, y: 0 } }),
    setFocusedDatum: ref => send({ type: 'FOCUS.SET', ref }),
    markTag: graphMarkTag,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-xh-chart-part': 'root',
      // 规格不合法时不画：诊断通道报出原因，根上留一个可观察的状态
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
      // 没有分组或只有一组时颜色不区分任何东西，图例整条收起
      'hidden': legendItems.length < 2 || undefined,
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

    // 图例项是开关：开是常态，按下切换这一组的显隐；按 Action Control 的 text profile、ghost、xs 档接家族
    getLegendItemProps: item => normalize.button({
      ...parts['legend-item'].attrs,
      'data-xh-chart-part': 'legend-item',
      'type': 'button',
      'aria-pressed': item.hidden ? 'false' : 'true',
      'tabindex': item.id === legendAnchor ? 0 : -1,
      'data-value': item.id,
      'data-xh-chart-slot': String(item.slot),
      'data-xh-chart-pattern': String(item.slot),
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
    getLegendSwatchProps: () => normalize.element({
      ...parts['legend-swatch'].attrs,
      'data-xh-chart-part': 'legend-swatch',
      'aria-hidden': true,
    }),

    getLegendLabelProps: () => normalize.element({
      ...parts['legend-label'].attrs,
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
      // 节点自己占 Tab 位，绘图区不占
      'tabindex': -1,
      'width': size?.width,
      'height': size?.height,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
      'data-draggable': dataAttr(draggable),
      'data-dragging': dataAttr(drag != null),
      'data-zoomed': dataAttr(view.k > 1),
      'onWheel': (event: WheelEvent) => {
        // 滚轮只在按住 Ctrl（⌘）时缩放：不按时让页面照常滚动
        if (!zoomable || !(event.ctrlKey || event.metaKey))
          return
        const at = pointerAt(event)
        if (!at)
          return
        event.preventDefault()
        const delta = event.deltaMode === 1 ? event.deltaY * WHEEL_LINE : event.deltaMode === 2 ? event.deltaY * WHEEL_PAGE : event.deltaY
        zoomBy(Math.exp(-delta * WHEEL_ZOOM_RATE), at)
      },
      'onPointerDown': (event: PointerEvent) => {
        if (event.button !== 0 || !layout)
          return
        const at = pointerAt(event)
        if (!at)
          return
        const hit = graphHitTest(model, at.x, at.y)
        const node = hit ? graphNodeOf(model, hit) : undefined
        const target = event.currentTarget as Element
        if (node && draggable) {
          target.setPointerCapture?.(event.pointerId)
          send({ type: 'DRAG.START', drag: { pointerId: event.pointerId, id: node.node.id, from: at, view }, at })
          return
        }
        // 空白处按下：放大过才能平移
        if (!node && zoomable && view.k > 1) {
          // 拦下按下：拖动时不选中页面文字
          event.preventDefault()
          target.setPointerCapture?.(event.pointerId)
          send({ type: 'DRAG.START', drag: { pointerId: event.pointerId, id: null, from: at, view }, at })
        }
      },
      'onPointerUp': endPointer,
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        if (drag && drag.pointerId === event.pointerId) {
          if (!at)
            return
          if (drag.id != null)
            send({ type: 'DRAG.MOVE', at })
          else
            send({ type: 'VIEW.SET', view: { k: drag.view.k, x: drag.view.x + at.x - drag.from.x, y: drag.view.y + at.y - drag.from.y } })
          return
        }
        const hit = at ? graphHitTest(model, at.x, at.y) : null
        const node = hit ? graphNodeOf(model, hit) : undefined
        if (!hit || !at || !node) {
          if (context.get('hover') != null)
            send({ type: 'HOVER.CLEAR' })
          return
        }
        send({ type: 'HOVER', hover: { ref: hit, x: at.x, y: at.y }, key: node.node.id })
      },
      'onPointerLeave': () => send({ type: 'HOVER.CLEAR' }),
      // 指针被系统收走（拖拽、右键菜单）时也要收起，否则提示框会一直挂着
      'onPointerCancel': (event: PointerEvent) => {
        endPointer(event)
        send({ type: 'HOVER.CLEAR' })
      },
      'onClick': () => {
        // 拖动过节点或画布：松手后浏览器补派的 click 不算按下
        if (refs.get('dragMoved'))
          return
        const hover = context.get('hover')
        const pressed = hover ? graphDetails(model, hover.ref) : null
        if (pressed)
          send({ type: 'PRESS', details: pressed })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          // 不 preventDefault：外层浮层的关闭仍归它自己
          if (details)
            send({ type: 'DISMISS' })
          return
        }
        if (event.altKey || event.ctrlKey || event.metaKey)
          return
        if (zoomable && (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '_' || event.key === '0')) {
          event.preventDefault()
          if (event.key === '0')
            send({ type: 'VIEW.SET', view: { k: 1, x: 0, y: 0 } })
          else
            zoomBy(event.key === '-' || event.key === '_' ? 1 / ZOOM_STEP : ZOOM_STEP)
          return
        }
        const from = focused && focusWithin && graphNodeOf(model, focused) ? focused : anchor
        if (event.key === 'Enter' || event.key === ' ') {
          const own = from ? graphDetails(model, from) : null
          if (!own)
            return
          event.preventDefault()
          send({ type: 'PRESS', details: own })
          return
        }
        const intent = NAV_KEYS[event.key]
        // 不归绘图区管的键绝不 preventDefault：页面滚动与读屏要用
        if (!intent || !from)
          return
        event.preventDefault()
        const next = graphNavTarget(model, from, intent)
        if (next)
          focusTo(next, true, true)
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        const key = target.getAttribute('data-key')
        const g = key?.startsWith('node:') ? layout?.byId.get(key.slice('node:'.length)) : undefined
        if (g)
          focusTo(graphNodeRef(g), visible, false)
      },
      'onFocusOut': (event: FocusEvent) => {
        // 绘图区内部换焦点不算离场，提示框要跟着焦点继续显示
        if (contains(event.currentTarget as Element, event.relatedTarget as Node | null))
          return
        send({ type: 'PLOT.BLUR', settle: event.relatedTarget == null })
      },
    }),

    getMarkProps: (mark) => {
      const part = parts[mark.part as keyof typeof parts]
      // 焦点环由 Chart 家族配方画：投影家族部件名
      const base = part ? { ...part.attrs, 'data-xh-chart-part': mark.part === 'focus-ring' ? mark.part : undefined } : {}
      if (mark.kind === 'text') {
        const text = mark as TextMark
        // 连线上的字随它那条线淡出，节点名字随它的节点淡出
        const dimmed = mark.part === 'link-label'
          ? !keptLinks.has(Number(mark.key.slice('link-label:'.length)))
          : !keptNodes.has(mark.key.slice('label:'.length))
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'opacity': mark.opacity,
          'aria-hidden': true,
          'data-dimmed': dataAttr(emphasis && dimmed),
        })
      }
      const props: Record<string, unknown> = {
        ...base,
        d: pathOf(mark),
        opacity: mark.opacity,
      }
      if (mark.part === 'link' || mark.part === 'arrow') {
        const index = mark.datum?.index ?? -1
        const g = layout?.links.find(l => l.link.index === index)
        const kept = keptLinks.has(index)
        props['aria-hidden'] = true
        // 指着一个节点时连着它的线换成它的颜色
        props['data-xh-chart-slot'] = kept && activeNode ? String(activeNode.node.slot) : undefined
        props['data-highlighted'] = dataAttr(kept)
        props['data-dimmed'] = dataAttr(emphasis && !kept)
        // 有权重时线宽按权重：写进私有槽，皮肤取它当描边宽
        if (mark.part === 'link' && g?.width != null)
          props.style = { '--xh-_graph-link-width': `${g.width}px` }
        return normalize.element(props)
      }
      if (mark.part === 'node') {
        const g = graphNodeOf(model, mark.datum)
        if (mark.exiting || !g) {
          props['aria-hidden'] = true
          props['data-xh-chart-slot'] = mark.paint?.slot == null ? undefined : String(mark.paint.slot)
          return normalize.element(props)
        }
        const own = graphDetails(model, graphNodeRef(g))
        props.role = 'graphics-symbol'
        props['aria-label'] = own ? translations.datumLabel(own) : undefined
        props['data-key'] = mark.key
        props.tabindex = mark.key === anchorKey ? 0 : -1
        props['data-xh-chart-slot'] = String(g.node.slot)
        props['data-dimmed'] = dataAttr(emphasis && !keptNodes.has(g.node.id))
        return normalize.element(props)
      }
      props['aria-hidden'] = true
      return normalize.element(props)
    },

    // 提示框不进读屏：节点的可及名已经念全了名字、数值与连线数
    getTooltipProps: () => normalize.element({
      ...parts.tooltip.attrs,
      'data-xh-chart-part': 'tooltip',
      'aria-hidden': true,
      'data-state': tooltip && tip ? 'visible' : 'hidden',
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

    getTooltipRowProps: (_row: GraphTooltipRow) => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-xh-chart-part': 'tooltip-row',
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
