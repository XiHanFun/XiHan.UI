/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radar chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { RadarActive } from './radar-chart.logic'
import type { RadarChartApi, RadarChartSchema, RadarLegendItem, RadarMarkTag, RadarTooltipRow } from './radar-chart.types'
import { contains, createPressTracker, dataAttr, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { chartNavIntentFromKey, chartPatternFill, chartPatterns, placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { radarChartAnatomy } from './radar-chart.anatomy'
import {
  radarActive,
  radarDetails,
  radarFirstRef,
  radarHasDatum,
  radarHitTest,
  radarMarkKey,
  radarModelOf,
  radarNavTarget,
  radarOverlay,
  radarTooltip,
  radarTranslations,
} from './radar-chart.logic'

const parts = radarChartAnatomy.build()

/** 图例项：方向键在活 DOM 上按文档序走，值取 data-value（系列 id）。 */
const LEGEND_ITEMS = { scope: radarChartAnatomy.name, part: 'legend-item' }

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function radarMarkTag(mark: Mark): RadarMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

export function connectRadarChart<T extends PropTypes>(
  service: Service<RadarChartSchema>,
  normalize: NormalizeProps<T>,
): RadarChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('radar-chart', 'caption', 'summary', 'plot')
  const model = radarModelOf(service)
  const translations = radarTranslations(prop('translations'))
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && radarFirstRef(model) == null

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = radarHasDatum(model, focused) ? focused : radarFirstRef(model)
  const anchorKey = anchor ? radarMarkKey(model, anchor) : null

  const active: RadarActive | null = radarActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? radarDetails(model, active.ref) : null
  const tooltip = radarTooltip(model, active, translations)
  const overlay = radarOverlay(model, active, focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null)

  // 淡出：悬停图例项或指着一个顶点时，其余系列淡出；被指着的系列保持原样
  const emphasis = context.get('legendHover') ?? (active && active.source !== 'linked' ? active.ref.seriesId : null)

  const seriesById = new Map(model.spec.series.map(s => [s.id, s]))
  const legendItems: RadarLegendItem[] = model.spec.series.map(s => ({ id: s.id, name: s.name, slot: s.slot, hidden: hidden.includes(s.id) }))
  const legendAnchor = legendItems.some(item => item.id === context.get('legendFocus'))
    ? context.get('legendFocus')
    : legendItems[0]?.id ?? null
  const patterns = chartPatterns(
    ids.plot,
    model.spec.series.map(s => ({ pattern: s.slot, slot: s.slot, tone: null })),
    context.get('metrics').pointSize,
  )

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取顶点。 */
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

  const keyOfRef = (ref: ChartDatumRef): string | null => model.spec.indicators[ref.index]?.key ?? null

  const focusTo = (ref: ChartDatumRef, visible: boolean, focus: boolean): void => {
    const key = keyOfRef(ref)
    if (key != null)
      send({ type: 'DATUM.FOCUS', ref, key, focus, visible })
  }

  const legendHandlers = (item: RadarLegendItem): Record<string, unknown> => {
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

  // 纹理模式下系列的面积拿本系列的纹理当填充
  const patternStyle = (slot: number): Record<string, unknown> =>
    ({ 'data-xh-chart-pattern': String(slot), 'style': { '--xh-_chart-pattern': chartPatternFill(ids.plot, slot) } })
  // 取数中、还没有可画的数据：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
    legendItems,
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
    markTag: radarMarkTag,

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
      // 只有一个实体时标题已经说明了它，图例整条收起
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

    // 色标只给眼睛看：名字由项里的文字承担；色标画成面积的样子
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
      // 顶点自己占 Tab 位，绘图区不占
      'tabindex': -1,
      'width': size?.width,
      'height': size?.height,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        const hit = at ? radarHitTest(model, at.x, at.y) : null
        const key = hit ? keyOfRef(hit) : null
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
        const pressed = hover ? radarDetails(model, hover.ref) : null
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
          const own = focused && focusWithin ? radarDetails(model, focused) : null
          if (!own)
            return
          event.preventDefault()
          send({ type: 'PRESS', details: own })
          return
        }
        // 左右键沿顺时针走指标，上下键换实体；绘图区不随 RTL 镜像
        const intent = chartNavIntentFromKey(event, 'vertical')
        // 返回 null 表示该键不归绘图区管：绝不 preventDefault，页面滚动与读屏要用
        if (!intent || !anchor)
          return
        // 键归绘图区管就先拦下：走到头没处可去时也不该让页面跟着滚
        event.preventDefault()
        const next = radarNavTarget(model, focused && focusWithin ? focused : anchor, intent)
        if (next)
          focusTo(next, true, true)
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        const key = target.getAttribute('data-key')
        for (const s of model.derived.visible) {
          const j = model.spec.indicators.findIndex(ind => `${s.id}:${ind.key}` === key)
          if (j >= 0) {
            focusTo({ seriesId: s.id, index: j }, visible, false)
            return
          }
        }
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
    }),

    getPatternLineProps: pattern => normalize.element({
      ...parts['pattern-line'].attrs,
      'data-xh-chart-part': 'pattern-line',
      'd': pattern.path,
    }),

    getMarkProps: (mark) => {
      const part = parts[mark.part as keyof typeof parts]
      // 焦点环由 Chart 家族配方画：投影家族部件名
      const base = part ? { ...part.attrs, 'data-xh-chart-part': mark.part === 'focus-ring' ? mark.part : undefined } : {}
      if (mark.kind === 'text') {
        const text = mark as TextMark
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'opacity': mark.opacity,
          'aria-hidden': true,
        })
      }
      if (mark.part === 'series') {
        // 系列是一个分组：名字是实体名，色槽与纹理挂在分组上，里面的面积、轮廓与顶点从这里取色
        const id = mark.key.slice('series:'.length)
        const s = seriesById.get(id)
        return normalize.element({
          ...base,
          'role': mark.exiting ? undefined : 'graphics-object',
          'aria-roledescription': mark.exiting ? undefined : translations.seriesRoleDescription,
          'aria-label': mark.exiting ? undefined : s?.name,
          'aria-hidden': mark.exiting || undefined,
          'data-series-id': id,
          'data-xh-chart-slot': s ? String(s.slot) : mark.paint?.slot == null ? undefined : String(mark.paint.slot),
          ...(s ? patternStyle(s.slot) : {}),
          'data-dimmed': dataAttr(emphasis != null && emphasis !== id),
          'opacity': mark.opacity,
        })
      }
      const props: Record<string, unknown> = {
        ...base,
        d: pathOf(mark),
        opacity: mark.opacity,
      }
      if (mark.part === 'point' && !mark.exiting && mark.datum) {
        const own = radarDetails(model, mark.datum)
        props.role = 'graphics-symbol'
        props['aria-label'] = own ? translations.datumLabel(own) : undefined
        props['data-key'] = mark.key
        props.tabindex = mark.key === anchorKey ? 0 : -1
      }
      else {
        props['aria-hidden'] = true
      }
      return normalize.element(props)
    },

    // 提示框不进读屏：每个顶点的可及名已经念全了指标、实体与数值，再念一遍是重复
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

    getTooltipRowProps: (row: RadarTooltipRow) => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-xh-chart-part': 'tooltip-row',
      'data-series-id': row.seriesId,
      'data-xh-chart-slot': String(row.slot),
      'data-xh-chart-pattern': String(row.slot),
      // 激活的那个实体在提示框里也要认得出来
      'data-current': dataAttr(active?.ref.seriesId === row.seriesId),
    }),

    getTooltipSwatchProps: () => normalize.element({
      ...parts['tooltip-swatch'].attrs,
      'data-xh-chart-part': 'tooltip-swatch',
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
      // 空态随数据显隐：没有数据、全部隐藏或没有值
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
