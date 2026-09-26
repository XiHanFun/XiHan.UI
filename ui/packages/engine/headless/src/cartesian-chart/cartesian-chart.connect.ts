/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { CartesianActive } from './cartesian-chart.logic'
import type {
  CartesianChartApi,
  CartesianChartSchema,
  CartesianLegendItem,
  CartesianMarkTag,
  CartesianTooltipRow,
} from './cartesian-chart.types'
import { contains, createPressTracker, dataAttr, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { chartNavIntentFromKey, placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { cartesianChartAnatomy } from './cartesian-chart.anatomy'
import {
  cartesianActive,
  cartesianAnchor,
  cartesianDetails,
  cartesianHitTest,
  cartesianKeyIndexOf,
  cartesianMarkKey,
  cartesianModelOf,
  cartesianNavTarget,
  cartesianOverlay,
  cartesianTooltip,
  cartesianTranslations,
  cartesianTrigger,
} from './cartesian-chart.logic'

const parts = cartesianChartAnatomy.build()

/** 图例项：方向键在活 DOM 上按文档序走，值取 data-value（系列 id）。 */
const LEGEND_ITEMS = { scope: cartesianChartAnatomy.name, part: 'legend-item' }

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function cartesianMarkTag(mark: Mark): CartesianMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

export function connectCartesianChart<T extends PropTypes>(
  service: Service<CartesianChartSchema>,
  normalize: NormalizeProps<T>,
): CartesianChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('cartesian-chart', 'caption', 'summary', 'plot')
  const model = cartesianModelOf(service)
  const translations = cartesianTranslations(prop('translations'))
  const trigger = cartesianTrigger(prop('trigger'))
  const orientation = model.spec.orientation
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.visible.every(s => s.values.every(v => v == null))
  // 取数中、还没有可画的数据：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = cartesianAnchor(model, focused)
  const anchorKey = anchor ? cartesianMarkKey(model, anchor) : null
  // 锚点落在柱上时柱自己占 Tab 位；落在折线上时绘图区占，聚焦时再转投给焦点代理
  const anchorIsBar = anchor != null && model.derived.visible.find(s => s.spec.id === anchor.seriesId)?.spec.mark === 'bar'

  const active: CartesianActive | null = cartesianActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? cartesianDetails(model, active.ref, trigger) : null
  const tooltip = details ? cartesianTooltip(model, details, translations, prop('tooltipOrder')) : null
  const overlay = cartesianOverlay(
    model,
    active,
    trigger,
    focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null,
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
    hidden: hidden.includes(s.id),
  }))
  const legendAnchor = legendItems.some(item => item.id === context.get('legendFocus'))
    ? context.get('legendFocus')
    : legendItems[0]?.id ?? null
  // 含隐藏的系列：图例刚隐藏的系列还在收场，颜色与标记形态照样要取
  const seriesById = new Map(model.spec.series.map(s => [s.id, s]))

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

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      // 规格不合法时不画标记：诊断通道报出原因，根上留一个可观察的状态
      'data-state': invalid ? 'error' : undefined,
      'data-loading': dataAttr(prop('pending') === true),
      'aria-busy': prop('pending') === true ? 'true' : undefined,
    }),

    getCaptionProps: () => normalize.element({
      ...parts.caption.attrs,
      id: ids.caption,
    }),

    // 图例是工具条：整体一个 Tab 位，左右键在项之间走；图例随文字方向镜像，左右跟随视觉次序
    getLegendProps: () => normalize.element({
      ...parts.legend.attrs,
      'role': 'toolbar',
      'aria-label': translations.legendLabel,
      // 只有一个系列时标题已经说明了它，图例整条收起
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

    // 图例项是开关：开是常态，按下切换显隐；按 Action Control 的 text profile、ghost、xs 档接家族
    getLegendItemProps: item => normalize.button({
      ...parts['legend-item'].attrs,
      'type': 'button',
      'aria-pressed': item.hidden ? 'false' : 'true',
      'tabindex': item.id === legendAnchor ? 0 : -1,
      'data-value': item.id,
      'data-xh-chart-slot': item.slot == null ? undefined : String(item.slot),
      'data-tone': item.tone ?? undefined,
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
    // 色标随标记：柱与面积是方块，折线是一段短线
    getLegendSwatchProps: item => normalize.element({
      ...parts['legend-swatch'].attrs,
      'aria-hidden': true,
      'data-mark': item.mark === 'line' && !item.area ? 'line' : 'bar',
    }),

    getLegendLabelProps: () => normalize.element({
      ...parts['legend-label'].attrs,
    }),

    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
    }),

    getPlotProps: () => normalize.element({
      ...parts.plot.attrs,
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
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
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
      'onPointerCancel': () => send({ type: 'HOVER.CLEAR' }),
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
        const intent = chartNavIntentFromKey(event, orientation)
        // 返回 null 表示该键不归绘图区管：绝不 preventDefault，页面滚动与读屏要用
        if (!intent || !anchor)
          return
        // 键归绘图区管就先拦下：走到头没处可去时也不该让页面跟着滚
        event.preventDefault()
        const next = cartesianNavTarget(model, focused && focusWithin ? focused : anchor, intent)
        if (next)
          focusTo(next, true, true)
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
        if (!info || info.keyIndex < 0)
          return
        const s = model.derived.visible.find(v => v.spec.id === info.seriesId)
        if (s)
          focusTo({ seriesId: s.spec.id, index: s.rows[info.keyIndex]! }, visible, false)
      },
      'onFocusOut': (event: FocusEvent) => {
        // 绘图区内部换焦点不算离场，提示框要跟着焦点继续显示
        if (contains(event.currentTarget as Element, event.relatedTarget as Node | null))
          return
        // 焦点没有去处时交给机器稍后核实：换掉聚焦的焦点代理也会走到这里
        send({ type: 'PLOT.BLUR', settle: event.relatedTarget == null })
      },
    }),

    getMarkProps: (mark) => {
      const part = parts[mark.part as keyof typeof parts]
      const base = part ? part.attrs : {}
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
            'data-mark': spec?.mark,
            'data-dimmed': dataAttr(emphasis != null && emphasis !== id),
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
        const at = frame?.revealAt.get(mark.key)
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'transform': text.rotate ? `rotate(${text.rotate} ${text.x} ${text.y})` : undefined,
          'opacity': mark.opacity,
          'aria-hidden': label || undefined,
          'data-placement': mark.part === 'data-label' ? placement : undefined,
          'data-xh-chart-slot': inside && owner?.slot != null ? String(owner.slot) : undefined,
          'data-tone': inside ? owner?.tone ?? undefined : undefined,
          'data-dimmed': label ? dataAttr(emphasis != null && owner != null && emphasis !== owner.id) : undefined,
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
      else if (mark.part === 'bar' || (mark.part === 'point' && mark.a11y?.focusable)) {
        const ref = mark.datum ?? null
        const own = ref ? cartesianDetails(model, ref, 'item') : null
        props.role = 'graphics-symbol'
        props['aria-label'] = own ? translations.datumLabel(own) : undefined
        props['data-key'] = mark.key
        props.tabindex = mark.part === 'point' ? 0 : mark.key === anchorKey ? 0 : -1
      }
      else {
        props['aria-hidden'] = true
      }
      if (mark.part === 'point') {
        const spec = mark.datum ? seriesById.get(mark.datum.seriesId) : undefined
        props['data-xh-chart-slot'] = spec?.slot == null ? undefined : String(spec.slot)
        props['data-tone'] = spec?.tone ?? undefined
      }
      if (mark.part === 'crosshair')
        props['data-kind'] = mark.kind === 'rect' ? 'band' : 'line'
      // 线尾标签的引导线随所属系列淡出
      if (mark.part === 'leader-line')
        props['data-dimmed'] = dataAttr(emphasis != null && mark.datum != null && emphasis !== mark.datum.seriesId)
      return normalize.element(props)
    },

    // 提示框不进读屏：每个标记的可及名已经念全了键与数值，再念一遍是重复
    getTooltipProps: () => normalize.element({
      ...parts.tooltip.attrs,
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
    }),

    getTooltipRowProps: (row: CartesianTooltipRow) => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-series-id': row.seriesId,
      'data-xh-chart-slot': row.slot == null ? undefined : String(row.slot),
      'data-tone': row.tone ?? undefined,
      'data-current': dataAttr(active != null && trigger === 'axis' && row.seriesId === active.ref.seriesId),
    }),

    getTooltipSwatchProps: row => normalize.element({
      ...parts['tooltip-swatch'].attrs,
      'data-mark': row.mark === 'line' && !row.area ? 'line' : 'bar',
    }),

    getTooltipValueProps: () => normalize.element({
      ...parts['tooltip-value'].attrs,
    }),

    getTooltipNameProps: () => normalize.element({
      ...parts['tooltip-name'].attrs,
    }),

    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
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
