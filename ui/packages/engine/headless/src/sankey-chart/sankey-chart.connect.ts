/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sankey chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { SankeyActive, SankeyNavIntent } from './sankey-chart.logic'
import type { SankeyChartApi, SankeyChartSchema } from './sankey-chart.schema'
import type { SankeyGradient, SankeyLegendItem, SankeyMarkTag, SankeyTooltipRow } from './sankey-chart.types'
import { contains, createPressTracker, dataAttr, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { sankeyChartAnatomy } from './sankey-chart.anatomy'
import {
  sankeyActive,
  sankeyDetails,
  sankeyFirstRef,
  sankeyHitTest,
  sankeyKeyOf,
  sankeyLinkOf,
  sankeyMarkKey,
  sankeyModelOf,
  sankeyNavTarget,
  sankeyNodeOf,
  sankeyNodeRef,
  sankeyOverlay,
  sankeyTooltip,
  sankeyTranslations,
  sankeyVisible,
} from './sankey-chart.logic'

const parts = sankeyChartAnatomy.build()

/** 图例项：方向键在活 DOM 上按文档序走，值取 data-value（分组）。 */
const LEGEND_ITEMS = { scope: sankeyChartAnatomy.name, part: 'legend-item' }

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 按键 → 按列的走法。流向横排时上下键在列内、左右键跨列；竖排时对调。绘图区不随 RTL 镜像。 */
const NAV_HORIZONTAL: Readonly<Record<string, SankeyNavIntent>> = {
  ArrowDown: 'next',
  ArrowUp: 'prev',
  ArrowRight: 'downstream',
  ArrowLeft: 'upstream',
  Home: 'first',
  End: 'last',
}
const NAV_VERTICAL: Readonly<Record<string, SankeyNavIntent>> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  ArrowDown: 'downstream',
  ArrowUp: 'upstream',
  Home: 'first',
  End: 'last',
}

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function sankeyMarkTag(mark: Mark): SankeyMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

export function connectSankeyChart<T extends PropTypes>(
  service: Service<SankeyChartSchema>,
  normalize: NormalizeProps<T>,
): SankeyChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('sankey-chart', 'caption', 'summary', 'plot')
  const model = sankeyModelOf(service)
  const translations = sankeyTranslations(prop('translations'))
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.links.length === 0
  const layout = model.scene?.layout
  const vertical = model.options.orientation === 'vertical'

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = sankeyNodeOf(model, focused) ? focused : sankeyFirstRef(model)
  const anchorKey = anchor ? sankeyMarkKey(model, anchor) : null

  const active: SankeyActive | null = sankeyActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? sankeyDetails(model, active.ref) : null
  const tooltip = sankeyTooltip(model, active, translations)
  const overlay = sankeyOverlay(model, focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null)

  // 强调：指着一个节点时它和它的流带、两端的节点留着，流带换成它的颜色；指着一条流带时它和两端留着；
  // 悬停图例项时那一组的节点和连着它们的流带留着。其余淡出
  const legendHover = context.get('legendHover')
  const activeNode = active ? sankeyNodeOf(model, active.ref) : undefined
  const activeLink = active ? sankeyLinkOf(model, active.ref) : undefined
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
  else if (activeLink) {
    keptLinks.add(activeLink.link.index)
    keptNodes.add(activeLink.link.source)
    keptNodes.add(activeLink.link.target)
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
  const emphasis = activeNode != null || activeLink != null || legendHover != null

  const legendItems: SankeyLegendItem[] = model.spec.groups.map(g => ({ id: g.id, name: g.id, slot: g.slot, hidden: hidden.includes(g.id) }))
  const legendAnchor = legendItems.some(item => item.id === context.get('legendFocus'))
    ? context.get('legendFocus')
    : legendItems[0]?.id ?? null

  // 渐变：每条流带一个，从源节点的色槽过渡到目标节点的色槽，沿流向铺开
  const linkColor = prop('linkColor') ?? 'neutral'
  const gradients: SankeyGradient[] = linkColor === 'gradient' && layout
    ? layout.links.map(g => ({
        id: `${ids.plot}-flow-${g.link.index}`,
        x1: g.from.x,
        y1: g.from.y,
        x2: vertical ? g.from.x : g.to.x,
        y2: vertical ? g.to.y : g.from.y,
        from: model.spec.byId.get(g.link.source)!.slot,
        to: model.spec.byId.get(g.link.target)!.slot,
      }))
    : []
  const gradientOf = new Map(gradients.map(g => [g.id, g]))

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取节点中心或流带中点。 */
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

  const focusTo = (ref: ChartDatumRef, visible: boolean, focus: boolean): void => {
    const key = sankeyKeyOf(model, ref)
    if (key != null)
      send({ type: 'DATUM.FOCUS', ref, key, focus, visible })
  }

  const legendHandlers = (item: SankeyLegendItem): Record<string, unknown> => {
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

  // 取数中、还没有可画的数据：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
    legendItems,
    gradients,
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
    markTag: sankeyMarkTag,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-xh-chart-part': 'root',
      // 规格不合法时不画：诊断通道报出原因，根上留一个可观察的状态
      'data-state': invalid ? 'error' : undefined,
      'data-loading': dataAttr(prop('pending') === true),
      // 首次出现在等读者看得见：入场停在第一帧，样式里由 data-drawing 起播的关键帧一并停在起点
      'data-deferred': dataAttr(frame?.pending === true),
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
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        const hit = at ? sankeyHitTest(model, at.x, at.y) : null
        const key = hit ? sankeyKeyOf(model, hit) : null
        if (!hit || !at || key == null) {
          if (context.get('hover') != null)
            send({ type: 'HOVER.CLEAR' })
          return
        }
        send({ type: 'HOVER', hover: { ref: hit, x: at.x, y: at.y }, key })
      },
      'onPointerLeave': () => send({ type: 'HOVER.CLEAR' }),
      // 指针被系统收走（拖拽、右键菜单）时也要收起，否则提示框会一直挂着
      'onPointerCancel': () => send({ type: 'HOVER.CLEAR' }),
      'onClick': () => {
        const hover = context.get('hover')
        const pressed = hover ? sankeyDetails(model, hover.ref) : null
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
        const from = focused && focusWithin && sankeyVisible(model, focused) ? focused : anchor
        if (event.key === 'Enter' || event.key === ' ') {
          const own = from ? sankeyDetails(model, from) : null
          if (!own)
            return
          event.preventDefault()
          send({ type: 'PRESS', details: own })
          return
        }
        const intent = (vertical ? NAV_VERTICAL : NAV_HORIZONTAL)[event.key]
        // 不归绘图区管的键绝不 preventDefault：页面滚动与读屏要用
        if (!intent || !from)
          return
        event.preventDefault()
        const next = sankeyNavTarget(model, from, intent)
        if (next)
          focusTo(next, true, true)
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        const key = target.getAttribute('data-key')
        const g = key?.startsWith('node:') ? layout?.byId.get(key.slice('node:'.length)) : undefined
        if (g)
          focusTo(sankeyNodeRef(g), visible, false)
      },
      'onFocusOut': (event: FocusEvent) => {
        // 绘图区内部换焦点不算离场，提示框要跟着焦点继续显示
        if (contains(event.currentTarget as Element, event.relatedTarget as Node | null))
          return
        send({ type: 'PLOT.BLUR', settle: event.relatedTarget == null })
      },
    }),

    getDefsProps: () => normalize.element({
      ...parts.defs.attrs,
    }),

    getGradientProps: gradient => normalize.element({
      ...parts.gradient.attrs,
      id: gradient.id,
      gradientUnits: 'userSpaceOnUse',
      x1: gradient.x1,
      y1: gradient.y1,
      x2: gradient.x2,
      y2: gradient.y2,
    }),

    // 两个色标：起点取源节点的色槽，终点取目标节点的色槽
    getGradientStopProps: (gradient, at) => normalize.element({
      ...parts['gradient-stop'].attrs,
      'offset': at === 'from' ? '0' : '1',
      'data-xh-chart-slot': String(at === 'from' ? gradient.from : gradient.to),
    }),

    getMarkProps: (mark) => {
      const part = parts[mark.part as keyof typeof parts]
      // 焦点环由 Chart 家族配方画：投影家族部件名
      const base = part ? { ...part.attrs, 'data-xh-chart-part': mark.part === 'focus-ring' ? mark.part : undefined } : {}
      if (mark.kind === 'text') {
        const text = mark as TextMark
        const id = mark.key.slice('label:'.length)
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'opacity': mark.opacity,
          'aria-hidden': true,
          'data-dimmed': dataAttr(emphasis && !keptNodes.has(id)),
        })
      }
      const props: Record<string, unknown> = {
        ...base,
        d: pathOf(mark),
        opacity: mark.opacity,
      }
      if (mark.part === 'link') {
        const g = mark.datum ? layout?.byLink.get(mark.datum.index) : undefined
        props['aria-hidden'] = true
        if (g) {
          const source = model.spec.byId.get(g.link.source)!
          const target = model.spec.byId.get(g.link.target)!
          const kept = keptLinks.has(g.link.index)
          // 指着一个节点时连着它的流带换成它的颜色，指着流带时换成源节点的颜色；平时按 linkColor
          const slot = kept && activeNode
            ? activeNode.node.slot
            : kept && activeLink
              ? source.slot
              : linkColor === 'source' ? source.slot : linkColor === 'target' ? target.slot : null
          const gradient = gradientOf.get(`${ids.plot}-flow-${g.link.index}`)
          props['data-xh-chart-slot'] = slot == null ? undefined : String(slot)
          props['data-highlighted'] = dataAttr(kept)
          props['data-dimmed'] = dataAttr(emphasis && !kept)
          if (gradient && !kept)
            props.style = { '--xh-_sankey-gradient': `url(#${gradient.id})` }
          props['data-gradient'] = dataAttr(gradient != null && !kept)
        }
        return normalize.element(props)
      }
      if (mark.part === 'node') {
        const g = sankeyNodeOf(model, mark.datum)
        if (mark.exiting || !g) {
          props['aria-hidden'] = true
          props['data-xh-chart-slot'] = mark.paint?.slot == null ? undefined : String(mark.paint.slot)
          return normalize.element(props)
        }
        const own = sankeyDetails(model, sankeyNodeRef(g))
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

    // 提示框不进读屏：节点的可及名已经念全了名字与数值，流入流出的明细在数据表里
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

    getTooltipRowProps: (row: SankeyTooltipRow) => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-xh-chart-part': 'tooltip-row',
      'data-xh-chart-slot': row.slot == null ? undefined : String(row.slot),
      'data-xh-chart-pattern': row.slot == null ? undefined : String(row.slot),
    }),

    // 没有色槽的行（占比、合并的「其他」）不画色标
    getTooltipSwatchProps: (row: SankeyTooltipRow) => normalize.element({
      ...parts['tooltip-swatch'].attrs,
      'data-xh-chart-part': 'tooltip-swatch',
      'hidden': row.slot == null || undefined,
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
      // 取数中那枚环由加载环配方画，随 data-loading 淡入淡出
      'data-xh-loading-ring': '',
      'data-loading': dataAttr(loading),
    }),

    getSummaryProps: () => normalize.element({
      ...parts.summary.attrs,
      id: ids.summary,
      style: VISUALLY_HIDDEN_STYLE,
    }),

    getTableRegionProps: () => normalize.element({
      ...parts['table-region'].attrs,
      style: VISUALLY_HIDDEN_STYLE,
    }),

    getTableProps: () => normalize.element(parts.table.attrs),
  }
}
