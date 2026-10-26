/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer 相关实现。

import type { ControlVariant, Direction, Size } from '@xihan-ui/core'
import type { HighlightSegment, JsonViewerApi, JsonViewerNode, JsonViewerSchema, JsonViewerTool, JsonViewerTranslations, JsonViewerView } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { groupJsonViewerNodesByParent } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useJsonViewer } from './use-json-viewer'

type JsonViewerProps = JsonViewerSchema['props']

interface RowsProps {
  api: JsonViewerApi
  groups: Map<string | null, JsonViewerNode[]>
  parent: string | null
}

interface BranchProps {
  api: JsonViewerApi
  groups: Map<string | null, JsonViewerNode[]>
  node: JsonViewerNode
}

/** 按片段铺文字：命中搜索词的那一段包进 mark 部件，其余原样是文本。 */
function Segments({ api, segments }: { api: JsonViewerApi, segments: readonly HighlightSegment[] }): ReactNode {
  // 片段在原文里的起始位置就是它的身份：同一段文字切出来的片段两两不重叠
  const starts = segments.reduce<number[]>((acc, _segment, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + segments[i - 1]!.text.length], [])
  return segments.map((segment, i) => (segment.matched
    ? <mark key={starts[i]} {...api.getMarkProps()}>{segment.text}</mark>
    : segment.text))
}

/** 一层的行：标量是 item，对象与数组是 branch。 */
function JsonRows({ api, groups, parent }: RowsProps): ReactNode {
  return (groups.get(parent) ?? []).map(node => (node.branch
    ? <JsonBranch key={node.value} api={api} groups={groups} node={node} />
    : <JsonItem key={node.value} api={api} node={node} />))
}

/** 标量行：键名加值。没有键名的行（截断占位）不渲染键名部件，避免多出一个空盒子。 */
function JsonItem({ api, node }: { api: JsonViewerApi, node: JsonViewerNode }): ReactNode {
  const ref = { value: node.value }
  // 行的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getItemProps(ref), ['onFocus'])
  return (
    <div {...bind.attrs} ref={bind.ref}>
      {node.key != null ? <span {...api.getItemKeyProps(ref)}><Segments api={api} segments={api.keySegments(node)} /></span> : null}
      <span {...api.getItemValueProps(ref)}><Segments api={api} segments={api.valueSegments(node)} /></span>
    </div>
  )
}

/** 分支行：控制行加子层。根行没有键名，不渲染键名部件。 */
function JsonBranch({ api, groups, node }: BranchProps): ReactNode {
  const ref = { value: node.value }
  // 行的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getBranchProps(ref), ['onFocus'])
  return (
    <div {...bind.attrs} ref={bind.ref}>
      <div {...api.getBranchControlProps(ref)}>
        <span {...api.getBranchTriggerProps(ref)}>
          <span {...api.getBranchIndicatorProps(ref)} />
        </span>
        {node.key != null ? <span {...api.getBranchTextProps(ref)}><Segments api={api} segments={api.keySegments(node)} /></span> : null}
        <span {...api.getPreviewProps(ref)}>{api.previewText(node)}</span>
        {/* 分支的可及名字：视觉隐藏，读屏从这一行的内容里取到它 */}
        <span {...api.getBranchSummaryProps(ref)}>{api.branchSummary(node)}</span>
      </div>
      {/* 收起的子层不渲染：一份大 JSON 全铺出来会把页面压住，展开集合本来也是逐层放开的 */}
      {api.isExpanded(node.value)
        ? (
            <div {...api.getBranchContentProps(ref)}>
              <JsonRows api={api} groups={groups} parent={node.value} />
            </div>
          )
        : null}
    </div>
  )
}

/** 原文按段铺：有类别的段包进 token 部件着色，空白与解析不了的原文是纯文本。 */
function TextSegments({ api }: { api: JsonViewerApi }): ReactNode {
  // 段在原文里的起始位置就是它的身份：切出来的段两两不重叠
  let start = 0
  return api.textSegments.map((segment) => {
    const key = start
    start += segment.text.length
    return segment.kind
      ? <span key={key} {...api.getTokenProps({ kind: segment.kind })}>{segment.text}</span>
      : segment.text
  })
}

/**
 * 内建工具条：根的第一个孩子。钮里不写内容，字形由皮肤按部件画；
 * 播报区跟着复制钮常驻，成功那一刻才有文字，读屏才念得出回执。
 */
function JsonViewerToolbar({ api }: { api: JsonViewerApi }): ReactNode {
  if (!api.tools.length)
    return null
  return (
    <div {...api.getToolbarProps()}>
      {api.tools.includes('expand') ? <button {...api.getExpandTriggerProps()} /> : null}
      {api.tools.includes('wrap') ? <button {...api.getWrapTriggerProps()} /> : null}
      {api.tools.includes('copy')
        ? (
            <>
              <button {...api.getCopyTriggerProps()} />
              <span {...api.getStatusProps()}>{api.announcement}</span>
            </>
          )
        : null}
      {api.tools.includes('view') ? <button {...api.getViewTriggerProps()} /> : null}
    </div>
  )
}

/** 树档的滚动层：整棵树铺在其中，键盘也在它上面收口。 */
function JsonViewerTree({ api }: { api: JsonViewerApi }): ReactNode {
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，行得焦也会把它叫起来，那一下会把焦点从行抢回锚点上。
  // 同一节点上的 onFocusOut 归到 React 的 onBlur，留在合成事件那一档不动
  const bind = useNativeEvents(api.getTreeProps(), ['onFocus'])
  const groups = groupJsonViewerNodesByParent(api.visibleNodes)
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref })}>
      <JsonRows api={api} groups={groups} parent={null} />
    </div>
  )
}

/**
 * 工具条的载荷：搜索命中与在命中之间逐个走的两个动作。
 * 搜索框、上一条 / 下一条与计数由作者摆在这里，搜索词经 search 交给根。
 */
export type JsonViewerToolbarSlotProps = Pick<JsonViewerApi, 'searchMatches' | 'activeMatch' | 'nextMatch' | 'prevMatch'>

/** 根上自有的取值；行由组件按数据铺设，不接收 children，dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'>

export interface XhJsonViewerRootProps extends RootElementProps {
  /** 要展示的值，任意形状。 */
  value?: unknown
  /** 展示形态：tree 展开为可折叠的行，text 直接输出 JSON 原文。提供即受控。 */
  view?: JsonViewerView
  /** 非受控的初始形态，默认 tree。 */
  defaultView?: JsonViewerView
  /** 值的原文：提供时原文档与复制钮取它，只重排缩进、字面量一字不改。 */
  source?: string
  /** 原文档是否自动换行；提供即受控。 */
  wrap?: boolean
  /** 非受控的初始换行，默认 false。 */
  defaultWrap?: boolean
  /** 内建工具条：不提供即没有；true 铺出全部工具；数组只铺列出的几项（expand / wrap / copy / view）。 */
  tools?: boolean | readonly JsonViewerTool[]
  /** 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留内容。 */
  variant?: ControlVariant
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  defaultExpandedDepth?: number
  maxStringLength?: number
  maxItems?: number
  sortKeys?: boolean
  loop?: boolean
  dir?: Direction
  size?: Size
  /** 搜索词：键名与值里含有它的行即命中，命中行的祖先自动展开，命中片段铺成 mark。 */
  search?: string
  translations?: Partial<JsonViewerTranslations>
  onExpandedValueChange?: JsonViewerProps['onExpandedValueChange']
  onViewChange?: JsonViewerProps['onViewChange']
  onWrapChange?: JsonViewerProps['onWrapChange']
  /** 复制钮写入剪贴板失败；此时复制钮已回到常态。 */
  onCopyError?: JsonViewerProps['onCopyError']
  /** 空态格子的内容；未写时铺设 translations 中的兜底文案。 */
  empty?: ReactNode
  /** 树之前的一条：放搜索框与上一条 / 下一条，渲染为根的前一个兄弟。 */
  toolbar?: SlotChildren<JsonViewerToolbarSlotProps>
}

/** 行是按数据展开的，作者无法写出也不必写：整棵树由组件自行铺设。 */
export function XhJsonViewerRoot({
  value,
  view,
  defaultView,
  source,
  wrap,
  defaultWrap,
  tools,
  variant,
  expandedValue,
  defaultExpandedValue,
  defaultExpandedDepth,
  maxStringLength,
  maxItems,
  sortKeys,
  search,
  loop,
  dir,
  size,
  translations,
  onExpandedValueChange,
  onViewChange,
  onWrapChange,
  onCopyError,
  empty,
  toolbar,
  ...rest
}: XhJsonViewerRootProps): ReactNode {
  const machineProps = {
    value,
    view,
    defaultView,
    source,
    wrap,
    defaultWrap,
    tools,
    variant,
    expandedValue,
    defaultExpandedValue,
    defaultExpandedDepth,
    maxStringLength,
    maxItems,
    sortKeys,
    search,
    loop,
    dir,
    size,
    translations,
    onExpandedValueChange,
    onViewChange,
    onWrapChange,
    onCopyError,
  }
  const ctx = useJsonViewer(withXhConfig('json-viewer', machineProps) as JsonViewerProps)
  const { api } = ctx

  // 两档容器是页内结构容器（与 Tree 同类）：滚动条走 reset 层的原生细条，不接自绘条
  // 空态与滚动层同级：一行也摊不出来时由它说话，有行可摊时 connect 给它打 hidden
  const emptySlot = (
    <div {...api.getEmptyProps()}>{empty ?? api.emptyText}</div>
  )

  return (
    <>
      {renderSlot(toolbar, {
        searchMatches: api.searchMatches,
        activeMatch: api.activeMatch,
        nextMatch: api.nextMatch,
        prevMatch: api.prevMatch,
      })}
      <div {...mergeReactProps(api.getRootProps(), rest)}>
        <JsonViewerToolbar api={api} />
        {/* 原文档不铺行：整块文本交给 pre，框选与复制才拿得到与后端一字不差的那份 */}
        {api.view === 'text'
          ? <pre {...api.getTextProps()}><TextSegments api={api} /></pre>
          : <JsonViewerTree api={api} />}
        {emptySlot}
      </div>
    </>
  )
}

XhJsonViewerRoot.xhEvents = ['expanded-value-change', 'view-change', 'wrap-change', 'copy-error'] as const
