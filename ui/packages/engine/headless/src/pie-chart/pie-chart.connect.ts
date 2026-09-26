/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pie chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { PieActive } from './pie-chart.logic'
import type { PieChartApi, PieChartSchema, PieLegendItem, PieMarkTag, PieTooltipRow } from './pie-chart.types'
import { contains, createPressTracker, dataAttr, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { chartNavIntentFromKey, placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { pieChartAnatomy } from './pie-chart.anatomy'
import {
  pieActive,
  pieDetails,
  pieFirstRef,
  pieHitTest,
  pieKeyOf,
  pieMarkKey,
  pieModelOf,
  pieNameOf,
  pieNavTarget,
  pieOverlay,
  pieSliceIndex,
  pieTooltip,
  pieTranslations,
} from './pie-chart.logic'
import { PIE_OTHER_ID } from './pie-chart.model'

const parts = pieChartAnatomy.build()

/** 图例项：方向键在活 DOM 上按文档序走，值取 data-value（扇区 id）。 */
const LEGEND_ITEMS = { scope: pieChartAnatomy.name, part: 'legend-item' }

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function pieMarkTag(mark: Mark): PieMarkTag {
  return mark.kind === 'group' ? 'g' : mark.kind === 'text' ? 'text' : 'path'
}

function pathOf(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

/** 色槽写成字面量：分类扇区取 1–8，「其他」取 other。 */
function slotAttr(slot: number | null, other: boolean): string | undefined {
  return other ? 'other' : slot == null ? undefined : String(slot)
}

export function connectPieChart<T extends PropTypes>(
  service: Service<PieChartSchema>,
  normalize: NormalizeProps<T>,
): PieChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('pie-chart', 'caption', 'summary', 'plot')
  const model = pieModelOf(service)
  const translations = pieTranslations(prop('translations'))
  const size = context.get('size')
  const hidden = context.get('hiddenSeries')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.visible.length === 0
  const donut = (prop('variant') ?? 'donut') === 'donut'

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = pieSliceIndex(model, focused) >= 0 ? focused : pieFirstRef(model)
  const anchorKey = anchor ? pieMarkKey(model, anchor) : null

  const active: PieActive | null = pieActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? pieDetails(model, active.ref, translations) : null
  const tooltip = pieTooltip(model, active, translations)
  const overlay = pieOverlay(model, focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null)

  // 淡出：悬停图例项或指着一个扇区时，其余扇区淡出；被指着的扇区不位移，位移会改变面积感知
  const emphasis = context.get('legendHover') ?? (active && active.source !== 'linked' ? active.ref.seriesId : null)

  const legendItems: PieLegendItem[] = model.spec.slices.map(s => ({
    id: s.id,
    name: pieNameOf(s, translations),
    slot: s.slot,
    other: s.other,
    hidden: hidden.includes(s.id),
  }))
  const legendAnchor = legendItems.some(item => item.id === context.get('legendFocus'))
    ? context.get('legendFocus')
    : legendItems[0]?.id ?? null
  const sliceById = new Map(model.spec.slices.map(s => [s.id, s]))

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取扇区的锚点。 */
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

  const keyOfRef = (ref: ChartDatumRef): string | null => {
    const slice = sliceById.get(ref.seriesId)
    return slice ? String(pieKeyOf(slice)) : null
  }

  const focusTo = (ref: ChartDatumRef, visible: boolean, focus: boolean): void => {
    const key = keyOfRef(ref)
    if (key != null)
      send({ type: 'DATUM.FOCUS', ref, key, focus, visible })
  }

  const legendHandlers = (item: PieLegendItem): Record<string, unknown> => {
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

  // 悬停、聚焦或联动到一个扇区时，中心换成它的占比与名字，离开后回到合计；
  // 合计随过渡滚动：首次出现从 0 数上去，数据变了从旧值滚到新值
  const center = details
    ? { value: details.formatted.share ?? '', label: details.seriesName }
    : { value: model.formats.value(frame?.numbers.total ?? model.derived.total), label: translations.centerLabel }
  // 取数中、还没有可画的扇区：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty
  const layout = model.scene?.layout

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
    legendItems,
    active: details,
    tooltip,
    center,
    summary: model.summary,
    table: model.table,
    emptyText: loading ? translations.loadingText : translations.emptyText,
    tableCaption: translations.tableCaption,
    activeKey: context.get('activeKey'),
    hiddenSeries: hidden,
    toggleSeries: id => send({ type: 'LEGEND.TOGGLE', id }),
    setFocusedDatum: ref => send({ type: 'FOCUS.SET', ref }),
    markTag: pieMarkTag,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-xh-chart-part': 'root',
      // 规格不合法时不画扇区：诊断通道报出原因，根上留一个可观察的状态
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
      // 只有一个扇区时标题已经说明了它，图例整条收起
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
      'data-xh-chart-slot': slotAttr(item.slot, item.other),
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
      // 扇区自己占 Tab 位，绘图区不占
      'tabindex': -1,
      'width': size?.width,
      'height': size?.height,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        const hit = at ? pieHitTest(model, at.x, at.y) : null
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
        const pressed = hover ? pieDetails(model, hover.ref, translations) : null
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
          const own = focused && focusWithin ? pieDetails(model, focused, translations) : null
          if (!own)
            return
          event.preventDefault()
          send({ type: 'PRESS', details: own })
          return
        }
        const intent = chartNavIntentFromKey(event, 'radial')
        // 返回 null 表示该键不归绘图区管：绝不 preventDefault，页面滚动与读屏要用
        if (!intent || !anchor)
          return
        // 键归绘图区管就先拦下：走到头没处可去时也不该让页面跟着滚
        event.preventDefault()
        const next = pieNavTarget(model, focused && focusWithin ? focused : anchor, intent)
        if (next)
          focusTo(next, true, true)
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        const key = target.getAttribute('data-key')
        const slice = model.derived.visible.find(s => `slice:${s.id}` === key)
        if (slice)
          focusTo({ seriesId: slice.id, index: slice.other ? -1 : slice.rows[0]! }, visible, false)
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
      // 焦点环与引导线由 Chart 家族配方画：投影家族部件名
      const base = part ? { ...part.attrs, 'data-xh-chart-part': mark.part === 'focus-ring' || mark.part === 'leader-line' ? mark.part : undefined } : {}
      // 标签与引导线等扫开的边缘到了才淡入：内核按扫开的曲线换算出它占入场时长的比例，样式乘上时长得到延迟
      const at = frame?.revealAt.get(mark.key)
      const reveal = at == null
        ? {}
        : { 'data-drawing': '', 'style': { '--xh-_chart-reveal-at': at.toFixed(3) } }
      if (mark.kind === 'text') {
        const text = mark as TextMark
        const id = mark.key.slice('label:'.length)
        const slice = sliceById.get(id)
        const inside = layout?.labels.find(label => label.id === id)?.inside === true
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'opacity': mark.opacity,
          'aria-hidden': true,
          // 内侧标签压在扇区色上，带色槽取配对的前景色；外侧标签不带，是普通标注色
          'data-xh-chart-slot': inside && slice ? slotAttr(slice.slot, slice.other) : undefined,
          'data-dimmed': dataAttr(emphasis != null && emphasis !== id),
          ...reveal,
        })
      }
      const props: Record<string, unknown> = {
        ...base,
        d: pathOf(mark),
        opacity: mark.opacity,
      }
      if (mark.part === 'slice' && mark.exiting) {
        // 退出中的扇区只剩收场的样子：颜色留着（数据里已删掉的行按场景里记的色槽），不可聚焦、不进可访问树
        const id = mark.datum?.seriesId
        const slice = id == null ? undefined : sliceById.get(id)
        props['aria-hidden'] = true
        props['data-xh-chart-slot'] = slice ? slotAttr(slice.slot, slice.other) : slotAttr(mark.paint?.slot ?? null, id === PIE_OTHER_ID)
      }
      else if (mark.part === 'slice') {
        const ref = mark.datum ?? null
        const own = ref ? pieDetails(model, ref, translations) : null
        const slice = ref ? sliceById.get(ref.seriesId) : undefined
        props.role = 'graphics-symbol'
        props['aria-label'] = own ? translations.datumLabel(own) : undefined
        props['data-key'] = mark.key
        props['data-series-id'] = ref?.seriesId
        props['data-xh-chart-slot'] = slice ? slotAttr(slice.slot, slice.other) : undefined
        props['data-dimmed'] = dataAttr(emphasis != null && ref != null && emphasis !== ref.seriesId)
        props.tabindex = mark.key === anchorKey ? 0 : -1
      }
      else {
        props['aria-hidden'] = true
        if (mark.part === 'leader-line') {
          const id = mark.key.slice('leader:'.length)
          props['data-dimmed'] = dataAttr(emphasis != null && emphasis !== id)
          Object.assign(props, reveal)
        }
      }
      return normalize.element(props)
    },

    // 环形中心：HTML 叠在视口上，圆心与内径由几何给出；实心饼没有中心
    getCenterProps: () => normalize.element({
      ...parts.center.attrs,
      'hidden': !donut || !measured || empty || !layout || undefined,
      // 首次出现时等整圈扫完再淡入
      'data-drawing': dataAttr(frame?.entry === true),
      // 半环的圆心在弦上：中心内容整块放到弦的上方，落在内圈里
      'data-placement': (prop('sweep') ?? 'full') === 'half' ? 'top' : undefined,
      // 量过才给这个键：给 undefined 会把作者写在中心上的整条内联样式删掉
      ...(layout == null
        ? {}
        : {
            style: {
              '--xh-_chart-center-x': `${layout.cx}px`,
              '--xh-_chart-center-y': `${layout.cy}px`,
              '--xh-_chart-center-size': `${layout.innerRadius * 2}px`,
            },
          }),
    }),

    getCenterValueProps: () => normalize.element({
      ...parts['center-value'].attrs,
    }),

    getCenterLabelProps: () => normalize.element({
      ...parts['center-label'].attrs,
    }),

    // 提示框不进读屏：每个扇区的可及名已经念全了名字、数值与占比，再念一遍是重复
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

    getTooltipRowProps: (row: PieTooltipRow) => normalize.element({
      ...parts['tooltip-row'].attrs,
      'data-xh-chart-part': 'tooltip-row',
      'data-series-id': row.key,
      'data-xh-chart-slot': slotAttr(row.slot, row.other),
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
      // 空态随数据显隐：全部为 0、没有数据或全部隐藏
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
