/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer 相关实现。

import type { ControlVariant, Direction, Size } from '@xihan-ui/core'
import type { HighlightSegment, JsonViewerApi, JsonViewerNode, JsonViewerSchema, JsonViewerTranslations, JsonViewerView } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { groupJsonViewerNodesByParent } from '@xihan-ui/headless'
import { defineComponent, Fragment, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { useJsonViewer } from './use-json-viewer'

type JsonViewerProps = JsonViewerSchema['props']

/**
 * 工具条插槽的载荷：搜索命中与在命中之间逐个走的两个动作。
 * 搜索框、上一条 / 下一条与计数由作者摆在这里，搜索词经 search 交给根。
 */
export type JsonViewerToolbarSlotProps = Pick<JsonViewerApi, 'searchMatches' | 'activeMatch' | 'nextMatch' | 'prevMatch'>

/** 按片段铺文字：命中搜索词的那一段包进 mark 部件，其余原样是文本。 */
function renderSegments(api: JsonViewerApi, segments: readonly HighlightSegment[]): Array<VNode | string> {
  return segments.map(segment => (segment.matched
    ? h('mark', api.getMarkProps() as Record<string, unknown>, segment.text)
    : segment.text))
}

function renderRows(
  api: JsonViewerApi,
  children: Map<string | null, JsonViewerNode[]>,
  parent: string | null,
): VNode[] {
  return (children.get(parent) ?? []).map(node => renderRow(api, children, node))
}

/**
 * 一行：标量是 item（键名 + 值），对象与数组是 branch（控制行 + 子层）。
 * 没有键名的行（根行、截断占位）不渲染键名部件，避免多出一个空盒子。
 */
function renderRow(
  api: JsonViewerApi,
  children: Map<string | null, JsonViewerNode[]>,
  node: JsonViewerNode,
): VNode {
  const ref = { value: node.value }

  if (!node.branch) {
    const parts: VNode[] = []
    if (node.key != null)
      parts.push(h('span', api.getItemKeyProps(ref) as Record<string, unknown>, renderSegments(api, api.keySegments(node))))
    parts.push(h('span', api.getItemValueProps(ref) as Record<string, unknown>, renderSegments(api, api.valueSegments(node))))
    return h('div', { ...api.getItemProps(ref) as Record<string, unknown>, key: node.value }, parts)
  }

  const control: VNode[] = [
    h('span', api.getBranchTriggerProps(ref) as Record<string, unknown>, [
      h('span', api.getBranchIndicatorProps(ref) as Record<string, unknown>),
    ]),
  ]
  if (node.key != null)
    control.push(h('span', api.getBranchTextProps(ref) as Record<string, unknown>, renderSegments(api, api.keySegments(node))))
  control.push(h('span', api.getPreviewProps(ref) as Record<string, unknown>, api.previewText(node)))

  const parts: VNode[] = [h('div', api.getBranchControlProps(ref) as Record<string, unknown>, control)]
  // 收起的子层不渲染：一份大 JSON 全铺出来会把页面压住，展开集合本来也是逐层放开的
  if (api.isExpanded(node.value)) {
    parts.push(h(
      'div',
      api.getBranchContentProps(ref) as Record<string, unknown>,
      renderRows(api, children, node.value),
    ))
  }
  return h('div', { ...api.getBranchProps(ref) as Record<string, unknown>, key: node.value }, parts)
}

export const XhJsonViewerRoot = defineComponent({
  name: 'XhJsonViewerRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    // 任意形状都收，类型检查交给使用方
    value: { type: null as unknown as PropType<unknown>, default: undefined as unknown },
    view: { type: String as PropType<JsonViewerView> },
    /** 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留内容。 */
    variant: { type: String as PropType<ControlVariant> },
    expandedValue: { type: Array as PropType<string[]> },
    defaultExpandedValue: { type: Array as PropType<string[]> },
    defaultExpandedDepth: { type: Number },
    maxStringLength: { type: Number },
    maxItems: { type: Number },
    sortKeys: { type: Boolean, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    size: { type: String as PropType<Size> },
    /** 搜索词：键名与值里含有它的行即命中，命中行的祖先自动展开，命中片段铺成 mark。 */
    search: { type: String },
    translations: { type: Object as PropType<Partial<JsonViewerTranslations>> },
  },
  // 空态那一格的内容：不写即铺 translations 里的兜底文案
  slots: Object as SlotsType<{
    empty?: () => VNode[]
    /** 树之前的一条：放搜索框与上一条 / 下一条，渲染为根的前一个兄弟。 */
    toolbar?: (props: JsonViewerToolbarSlotProps) => VNode[]
  }>,
  // 写了工具条时根是片段，接不住自动透传：作者写在 XhJsonViewerRoot 上的 class / aria-* 自己合到根上
  inheritAttrs: false,
  // expanded-change 携带 { value }，update:expandedValue 携带裸集合
  emits: {
    'expanded-value-change': (_details: PayloadOf<JsonViewerProps, 'onExpandedValueChange'>) => true,
    'update:expandedValue': (_value: PayloadOf<JsonViewerProps, 'onExpandedValueChange'>['value']) => true,
  },
  setup(props, { emit, slots, attrs }) {
    const notify: JsonViewerProps['onExpandedValueChange'] = (details) => {
      emit('expanded-value-change', details)
      emit('update:expandedValue', details.value)
    }
    const ctx = useJsonViewer(withXhConfig('json-viewer', props) as JsonViewerProps, notify)
    // 两档容器是页内结构容器（与 Tree 同类）：滚动条走 reset 层的原生细条，不接自绘条
    // 行是按数据摊出来的，作者写不出也不必写：整棵树由组件自己铺
    // 空态与滚动层同级：一行也摊不出来时由它说话，有行可摊时 connect 给它打 hidden
    const renderEmpty = (api: JsonViewerApi): VNode => h(
      'div',
      api.getEmptyProps() as Record<string, unknown>,
      slots.empty?.() ?? api.emptyText,
    )
    const renderRoot = (api: JsonViewerApi): VNode => {
      const rootProps = mergeProps(api.getRootProps() as Record<string, unknown>, attrs)
      // 原文档不铺行：整块文本交给 pre，框选与复制才拿得到与后端一字不差的那份
      if (api.view === 'text') {
        return h('div', rootProps, [
          h('pre', api.getTextProps() as Record<string, unknown>, api.text),
          renderEmpty(api),
        ])
      }

      const children = groupJsonViewerNodesByParent(api.visibleNodes)
      return h('div', rootProps, [
        h('div', api.getTreeProps() as Record<string, unknown>, renderRows(api, children, null)),
        renderEmpty(api),
      ])
    }
    return () => {
      const api = ctx.api.value
      const toolbar = slots.toolbar?.({
        searchMatches: api.searchMatches,
        activeMatch: api.activeMatch,
        nextMatch: api.nextMatch,
        prevMatch: api.prevMatch,
      })
      const root = renderRoot(api)
      return toolbar ? h(Fragment, [...toolbar, root]) : root
    }
  },
})
