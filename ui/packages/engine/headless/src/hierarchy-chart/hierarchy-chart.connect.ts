/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hierarchy chart 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark, TextMark } from '@xihan-ui/viz'
import type { ChartDatumRef } from '../shared/chart'
import type { HierarchyActive } from './hierarchy-chart.logic'
import type { HierarchyTreeNode } from './hierarchy-chart.model'
import type { HierarchyChartApi, HierarchyChartSchema } from './hierarchy-chart.schema'
import type { HierarchyMarkTag, HierarchyPathItem, HierarchyTooltipRow } from './hierarchy-chart.types'
import { contains, createPressTracker, dataAttr } from '@xihan-ui/core'
import { createScene, markPath } from '@xihan-ui/viz'
import { placeChartTooltip } from '../shared/chart'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { hierarchyChartAnatomy } from './hierarchy-chart.anatomy'
import {
  hierarchyActive,
  hierarchyDetails,
  hierarchyFirstRef,
  hierarchyHitTest,
  hierarchyInHole,
  hierarchyMarkKey,
  hierarchyModelOf,
  hierarchyNavTarget,
  hierarchyOverlay,
  hierarchyPath,
  hierarchyRefOf,
  hierarchyTooltip,
  hierarchyTranslations,
  hierarchyVisible,
} from './hierarchy-chart.logic'

const parts = hierarchyChartAnatomy.build()

/** 尚未测量时的空场景：绘图区只输出空的 svg。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

/** 文字基线的写法：场景里是 top / middle / bottom，SVG 的 dominant-baseline 各有对应。 */
const BASELINE = { top: 'hanging', middle: 'central', bottom: 'text-after-edge', alphabetic: 'alphabetic' } as const

/** 按键 → 树上的走法；带修饰键的按键不归绘图区。 */
const NAV_KEYS: Readonly<Record<string, 'next' | 'prev' | 'child' | 'parent' | 'first' | 'last'>> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  ArrowDown: 'child',
  ArrowUp: 'parent',
  Home: 'first',
  End: 'last',
}

/** 标记画成什么元素：分组是 g，文字是 text，其余几何一律是 path。 */
export function hierarchyMarkTag(mark: Mark): HierarchyMarkTag {
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

export function connectHierarchyChart<T extends PropTypes>(
  service: Service<HierarchyChartSchema>,
  normalize: NormalizeProps<T>,
): HierarchyChartApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('hierarchy-chart', 'caption', 'summary', 'plot')
  const model = hierarchyModelOf(service)
  const translations = hierarchyTranslations(prop('translations'))
  const size = context.get('size')
  const measured = size != null && model.scene != null
  // 过渡中画正在显示的那一帧；拾取、焦点与提示框仍按目标场景算
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.derived.visible.length === 0
  const current = model.derived.current
  const rootKey = context.get('rootKey') ?? null

  const focused = context.get('focused')
  const focusWithin = context.get('focusWithin')
  const anchor = hierarchyVisible(model, focused) ? focused : hierarchyFirstRef(model)
  const anchorKey = anchor ? hierarchyMarkKey(model, anchor) : null

  const active: HierarchyActive | null = hierarchyActive(model, {
    hover: context.get('hover'),
    focused,
    focusWithin,
    dismissed: context.get('dismissed'),
    activeKey: context.get('activeKey'),
  })
  const details = active ? hierarchyDetails(model, active.ref) : null
  const tooltip = hierarchyTooltip(model, active, translations)
  const overlay = hierarchyOverlay(model, focusWithin && focused != null ? { ref: focused, ring: context.get('focusVisible') } : null)
  const path = hierarchyPath(model)
  const activeNode = active ? model.spec.byKey.get(active.ref.seriesId) : undefined
  // 指着一个节点时，与它不在同一条祖孙链上的节点淡出
  const related = new Set<HierarchyTreeNode>()
  if (activeNode) {
    activeNode.ancestors().forEach(n => related.add(n))
    activeNode.descendants().forEach(n => related.add(n))
  }
  // 按值着色：同一层里按最大值归一，色阶只用从 30% 起的一段
  const levelMax = new Map<number, number>()
  if (model.colorBy === 'value') {
    for (const node of model.derived.visible)
      levelMax.set(node.depth, Math.max(levelMax.get(node.depth) ?? 0, node.value ?? 0))
  }
  const toneOf = (node: HierarchyTreeNode): Record<string, unknown> => {
    if (model.colorBy === 'value') {
      const max = levelMax.get(node.depth) ?? 0
      const stop = sequentialStop(0.3 + 0.7 * (max > 0 ? (node.value ?? 0) / max : 0))
      return { 'data-seg': stop.seg, 'style': { '--xh-_chart-p': stop.p } }
    }
    const slot = model.colorBy === 'uniform' ? 1 : model.spec.meta.get(node)?.slot
    return { 'data-xh-chart-slot': slot == null ? undefined : String(slot) }
  }

  /** 提示框的落点：指针触发时取指针位置，键盘与联动取节点的锚点。 */
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

  /** 下钻到一个有子节点的节点：键盘带过来时焦点落到它的第一个子节点上。 */
  const drillInto = (node: HierarchyTreeNode, moveFocus: boolean): void => {
    if (!node.children)
      return
    send({ type: 'ROOT.SET', key: model.spec.meta.get(node)!.key })
    if (moveFocus)
      focusTo(hierarchyRefOf(model, node.children[0]!), true, true)
  }
  /** 上钻一层：键盘带过来时焦点落回刚才的根上。 */
  const drillUp = (moveFocus: boolean): void => {
    if (!current?.parent)
      return
    const parent = current.parent
    send({ type: 'ROOT.SET', key: parent.parent ? model.spec.meta.get(parent)!.key : null })
    if (moveFocus)
      focusTo(hierarchyRefOf(model, current), true, true)
  }

  // 下钻路径的按下态借用图例按下的那一格：层级图没有图例，两者不会同时在场
  const pathHandlers = (item: HierarchyPathItem): Record<string, unknown> => {
    const press = createPressTracker({
      isPressed: () => context.get('legendPressed') === (item.key ?? ''),
      onChange: down => send({ type: 'LEGEND.PRESS', id: down ? item.key ?? '' : null }),
    })
    return {
      'data-pressed': dataAttr(context.get('legendPressed') === (item.key ?? '') && !item.current),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }
  }

  // 取数中、还没有可画的节点：空态写「加载中」并转圈，不先报「没有数据」
  const loading = prop('pending') === true && empty

  return {
    model,
    scene,
    overlay,
    measured,
    empty,
    path,
    rootKey,
    active: details,
    tooltip,
    summary: model.summary,
    table: model.table,
    emptyText: loading ? translations.loadingText : translations.emptyText,
    tableCaption: translations.tableCaption,
    activeKey: context.get('activeKey'),
    drillTo: key => send({ type: 'ROOT.SET', key }),
    drillUp: () => drillUp(false),
    setFocusedDatum: ref => send({ type: 'FOCUS.SET', ref }),
    markTag: hierarchyMarkTag,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-xh-chart-part': 'root',
      // 规格不合法时不画：诊断通道报出原因，根上留一个可观察的状态
      'data-state': invalid ? 'error' : undefined,
      'data-loading': dataAttr(prop('pending') === true),
      'aria-busy': prop('pending') === true ? 'true' : undefined,
      'data-palette': model.colorBy === 'value' ? prop('palette') : undefined,
    }),

    getCaptionProps: () => normalize.element({
      ...parts.caption.attrs,
      'data-xh-chart-part': 'caption',
      'id': ids.caption,
    }),

    // 下钻路径：还在最顶层时收起；项归 Collection Item 的导航语境，与面包屑的链接同一身份
    getPathProps: () => normalize.element({
      ...parts.path.attrs,
      'aria-label': translations.pathLabel,
      'hidden': path.length < 2 || undefined,
    }),

    getPathItemProps: item => normalize.button({
      ...parts['path-item'].attrs,
      'type': 'button',
      'aria-current': item.current ? 'location' : undefined,
      'aria-disabled': item.current ? 'true' : undefined,
      'data-current': dataAttr(item.current),
      'data-xh-collection-item': '',
      'data-xh-collection-size': 'sm',
      'data-xh-collection-context': 'nav',
      'data-xh-collection-terminal': dataAttr(item.current),
      ...pathHandlers(item),
      'onClick': () => {
        if (!item.current)
          send({ type: 'ROOT.SET', key: item.key })
      },
    }),

    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-xh-chart-part': 'viewport',
    }),

    getPlotProps: () => normalize.element({
      ...parts.plot.attrs,
      'data-xh-chart-part': 'plot',
      'id': ids.plot,
      'role': 'tree',
      'aria-labelledby': ids.caption,
      'aria-describedby': ids.summary,
      // 节点自己占 Tab 位，绘图区不占
      'tabindex': -1,
      'width': size?.width,
      'height': size?.height,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
      'onPointerMove': (event: PointerEvent) => {
        const at = pointerAt(event)
        const hit = at ? hierarchyHitTest(model, at.x, at.y) : null
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
      // 点有子节点的节点下钻、点叶子报告按下；旭日图点空洞上钻
      'onClick': (event: MouseEvent) => {
        const at = pointerAt(event)
        if (at && hierarchyInHole(model, at.x, at.y)) {
          drillUp(false)
          return
        }
        const hover = context.get('hover')
        const node = hover ? model.spec.byKey.get(hover.ref.seriesId) : undefined
        if (!node)
          return
        if (node.children) {
          drillInto(node, false)
          return
        }
        const pressed = hierarchyDetails(model, hover!.ref)
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
        const from = focused && focusWithin ? focused : anchor
        const node = from ? model.spec.byKey.get(from.seriesId) : undefined
        // Enter 下钻，叶子上报告按下；Space 总是报告按下
        if (event.key === 'Enter' || event.key === ' ') {
          if (!node || !from)
            return
          event.preventDefault()
          if (event.key === 'Enter' && node.children) {
            drillInto(node, true)
            return
          }
          const own = hierarchyDetails(model, from)
          if (own)
            send({ type: 'PRESS', details: own })
          return
        }
        if (event.key === 'Backspace') {
          if (!current?.parent)
            return
          event.preventDefault()
          drillUp(true)
          return
        }
        const intent = NAV_KEYS[event.key]
        // 不归绘图区管的键绝不 preventDefault：页面滚动与读屏要用
        if (!intent || !from)
          return
        event.preventDefault()
        const next = hierarchyNavTarget(model, from, intent)
        if (next)
          focusTo(next, true, true)
      },
      'onFocusIn': (event: FocusEvent) => {
        const target = event.target as Element
        const visible = typeof target.matches === 'function' && target.matches(':focus-visible')
        const key = target.getAttribute('data-key')
        const node = key?.startsWith('node:') ? model.spec.byKey.get(key.slice('node:'.length)) : undefined
        if (node && model.derived.visibleSet.has(node))
          focusTo(hierarchyRefOf(model, node), visible, false)
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
        const node = model.spec.byKey.get(mark.key.slice('label:'.length))
        const geometry = node ? model.scene?.layout.byKey.get(model.spec.meta.get(node)!.key) : undefined
        return normalize.element({
          ...base,
          'x': text.x,
          'y': text.y,
          'text-anchor': text.anchor,
          'dominant-baseline': BASELINE[text.baseline],
          'opacity': mark.opacity,
          'aria-hidden': true,
          // 名字压在节点的颜色上：按层与着色方式取前景色
          'data-level': geometry ? String(Math.min(geometry.level, 4)) : undefined,
          ...(node ? toneOf(node) : {}),
          'data-dimmed': dataAttr(activeNode != null && node != null && !related.has(node)),
        })
      }
      const props: Record<string, unknown> = {
        ...base,
        d: pathOf(mark),
        opacity: mark.opacity,
      }
      if (mark.part === 'node') {
        const key = mark.datum?.seriesId
        const node = key == null ? undefined : model.spec.byKey.get(key)
        const geometry = key == null ? undefined : model.scene?.layout.byKey.get(key)
        if (node) {
          Object.assign(props, toneOf(node))
          // 层按当前的根数：下钻之后看得见的第一层照样是满色
          props['data-level'] = String(Math.min(geometry?.level ?? node.depth, 4))
        }
        else if (mark.paint?.slot != null) {
          props['data-xh-chart-slot'] = String(mark.paint.slot)
        }
        if (mark.exiting || !node || !geometry) {
          props['aria-hidden'] = true
        }
        else {
          const siblings = (node.parent?.children ?? [node]).filter(n => model.derived.visibleSet.has(n))
          const own = hierarchyDetails(model, mark.datum!)
          props.role = 'treeitem'
          props['aria-label'] = own ? translations.datumLabel(own) : undefined
          props['aria-level'] = geometry.level
          props['aria-setsize'] = siblings.length
          props['aria-posinset'] = siblings.indexOf(node) + 1
          // 有子节点：容器（子节点看得见）是展开的，到了可见层数的底是收起的，下钻才看得到
          props['aria-expanded'] = node.children ? (geometry.group ? 'true' : 'false') : undefined
          props['data-key'] = mark.key
          props.tabindex = mark.key === anchorKey ? 0 : -1
          props['data-dimmed'] = dataAttr(activeNode != null && !related.has(node))
        }
      }
      else {
        props['aria-hidden'] = true
      }
      return normalize.element(props)
    },

    // 提示框不进读屏：每个节点的可及名已经念全了名字、数值与占比，再念一遍是重复
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

    // 数值那一行的色标画成节点自己的颜色；两种占比不画色标
    getTooltipSwatchProps: (row: HierarchyTooltipRow) => normalize.element({
      ...parts['tooltip-swatch'].attrs,
      'data-xh-chart-part': 'tooltip-swatch',
      'hidden': row.key !== 'value' || !activeNode || undefined,
      ...(row.key === 'value' && activeNode ? toneOf(activeNode) : {}),
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
