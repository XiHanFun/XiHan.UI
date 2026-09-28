/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 funnel chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { FunnelActive } from './funnel-chart.logic'
import type { FunnelChartApi, FunnelChartSchema } from './funnel-chart.schema'
import type { FunnelMarkTag, FunnelTooltipRow } from './funnel-chart.types'
import { contains, dataAttr } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { chartNavIntentFromKey, placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { funnelChartAnatomy } from './funnel-chart.anatomy'
import {
  funnelActive,
  funnelDetails,
  funnelFirstRef,
  funnelHitTest,
  funnelMarkKey,
  funnelModelOf,
  funnelNavTarget,
  funnelOverlay,
  funnelStageIndex,
  funnelTooltip,
  funnelTranslations,
} from './funnel-chart.logic'

const parts = funnelChartAnatomy.build()

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function funnelMarkTag(mark: Mark): FunnelMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

/** 顺序色阶上的位置换成段号与段内百分比：Chart 家族配方用一层 color-mix 在相邻两个锚点之间兑出颜色。 */
function sequentialStop(t: number): { seg: 'low' | 'high', p: string } {
  return t <= 0.5 ? { seg: 'low', p: `${(t * 200).toFixed(1)}%` } : { seg: 'high', p: `${((t - 0.5) * 200).toFixed(1)}%` }
}

export function connectFunnelChart<T extends PropTypes>(
  service: Service<FunnelChartSchema>,
  normalize: NormalizeProps<T>,
): FunnelChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('funnel-chart', 'caption', 'summary', 'plot')
  const model = funnelModelOf(service)
  const translations = funnelTranslations(prop('translations'))
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.visible.length === 0
  const direction = model.options.direction

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = funnelStageIndex(model, focused) >= 0 ? focused : funnelFirstRef(model)
  const anchorKey = anchor ? funnelMarkKey(model, anchor) : null

  const active: FunnelActive | null = funnelActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? funnelDetails(model, active.ref) : null
  const tooltip = funnelTooltip(model, active, translations)
  const overlay = funnelOverlay(model, focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null)
  const activeStage = active ? model.derived.visible[funnelStageIndex(model, active.ref)] : undefined

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取阶段的中心。 */
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
    send({ type: 'DATUM.FOCUS', ref, key: ref.seriesId, focus, visible })
  }

  // 取数中、还没有可画的阶段：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty
  const stageT = (id: string): number | undefined => model.derived.visible.find(s => s.spec.id === id)?.t

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
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
    markTag: funnelMarkTag,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-xh-chart-part': 'root',
      // 规格不合法时不画：诊断通道报出原因，根上留一个可观察的状态
      'data-state': invalid ? 'error' : undefined,
      'data-loading': dataAttr(prop('pending') === true),
      'aria-busy': prop('pending') === true ? 'true' : undefined,
      // 阶段由深入浅取这个色相；不写时取顺序色阶令牌
      'data-palette': prop('palette'),
    }),

    getCaptionProps: () => normalize.element({
      ...parts.caption.attrs,
      'data-xh-chart-part': 'caption',
      'id': ids.caption,
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
      // 阶段自己占 Tab 位，绘图区不占
      'tabindex': -1,
      'width': size?.width,
      'height': size?.height,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        const hit = at ? funnelHitTest(model, at.x, at.y) : null
        if (!hit || !at) {
          if (context.get('hover') != null)
            send({ type: 'HOVER.CLEAR' })
          return
        }
        send({ type: 'HOVER', hover: { ref: hit, x: at.x, y: at.y }, key: hit.seriesId })
      },
      'onPointerLeave': () => send({ type: 'HOVER.CLEAR' }),
      // 指针被系统收走（拖拽、右键菜单）时也要收起，否则提示框会一直挂着
      'onPointerCancel': () => send({ type: 'HOVER.CLEAR' }),
      'onClick': () => {
        const hover = context.get('hover')
        const pressed = hover ? funnelDetails(model, hover.ref) : null
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
          const own = focused && focusWithin ? funnelDetails(model, focused) : null
          if (!own)
            return
          event.preventDefault()
          send({ type: 'PRESS', details: own })
          return
        }
        // 右键与下键是下一阶段、左键与上键是上一阶段；金字塔往上排，上下两个键跟着画面对调
        let intent = chartNavIntentFromKey(event, 'radial')
        if (direction === 'up' && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
          intent = intent === 'next' ? 'prev' : intent === 'prev' ? 'next' : intent
        // 返回 null 表示该键不归绘图区管：绝不 preventDefault，页面滚动与读屏要用
        if (!intent || !anchor)
          return
        // 键归绘图区管就先拦下：走到头没处可去时也不该让页面跟着滚
        event.preventDefault()
        const next = funnelNavTarget(model, focused && focusWithin ? focused : anchor, intent)
        if (next)
          focusTo(next, true, true)
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        const key = target.getAttribute('data-key')
        const stage = model.derived.visible.find(s => `stage:${s.spec.id}` === key)
        if (stage)
          focusTo({ seriesId: stage.spec.id, index: stage.spec.row }, visible, false)
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
        const id = mark.key.slice(mark.key.indexOf(':') + 1)
        const inside = mark.part === 'stage-label' && model.scene?.layout.labels.find(l => l.id === id)?.inside === true
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'opacity': mark.opacity,
          'aria-hidden': true,
          // 写在阶段里的标签压在色阶色上，描一圈承载面色；写在外面的是普通标注色
          'data-placement': mark.part === 'stage-label' ? (inside ? 'inside' : 'outside') : undefined,
          'data-dimmed': dataAttr(activeStage != null && activeStage.spec.id !== id),
        })
      }
      const props: Record<string, unknown> = {
        ...base,
        d: pathOf(mark),
        opacity: mark.opacity,
      }
      if (mark.part === 'stage') {
        const id = mark.datum?.seriesId
        // 顺序色阶：第一阶段最深，逐级变浅；退场中的阶段按场景里记的位置取色
        const t = (id == null ? undefined : stageT(id)) ?? mark.paint?.t
        if (t != null) {
          const stop = sequentialStop(t)
          props['data-seg'] = stop.seg
          props.style = { '--xh-_chart-p': stop.p }
        }
        if (mark.exiting) {
          props['aria-hidden'] = true
        }
        else if (mark.datum) {
          const own = funnelDetails(model, mark.datum)
          props.role = 'graphics-symbol'
          props['aria-label'] = own ? translations.datumLabel(own) : undefined
          props['data-key'] = mark.key
          props['data-series-id'] = id
          props.tabindex = mark.key === anchorKey ? 0 : -1
          // 指着一个阶段时其余阶段淡出，被指着的不位移
          props['data-dimmed'] = dataAttr(activeStage != null && activeStage.spec.id !== id)
        }
      }
      else {
        props['aria-hidden'] = true
      }
      return normalize.element(props)
    },

    // 提示框不进读屏：每个阶段的可及名已经念全了名字、数值与转化率，再念一遍是重复
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

    getTooltipRowProps: () => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-xh-chart-part': 'tooltip-row',
    }),

    // 数值那一行的色标画成阶段自己的颜色；转化率的两行不画色标
    getTooltipSwatchProps: (row: FunnelTooltipRow) => {
      const stop = row.key === 'value' && activeStage ? sequentialStop(activeStage.t) : null
      return normalize.element({
        ...parts['tooltip-swatch'].attrs,
        'data-xh-chart-part': 'tooltip-swatch',
        'hidden': stop == null || undefined,
        'data-seg': stop?.seg,
        ...(stop == null ? {} : { style: { '--xh-_chart-p': stop.p } }),
      })
    },

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
      // 空态随数据显隐：没有数据或全部隐藏
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

    getTableProps: () => normalize.element({
      ...parts.table.attrs,
      style: VISUALLY_HIDDEN_STYLE,
    }),
  }
}
