/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer 相关实现。

import type { ControlVariant, Direction, Size } from '@xihan-ui/core'
import type { JsonViewerApi, JsonViewerNode, JsonViewerSchema, JsonViewerTranslations, JsonViewerView } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { groupJsonViewerNodesByParent } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
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
  const bind = useNativeEvents(api.getItemProps(ref) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...bind.attrs} ref={bind.ref}>
      {node.key != null ? <span {...api.getItemKeyProps(ref) as Record<string, unknown>}>{node.key}</span> : null}
      <span {...api.getItemValueProps(ref) as Record<string, unknown>}>{api.valueText(node)}</span>
    </div>
  )
}

/** 分支行：控制行加子层。根行没有键名，不渲染键名部件。 */
function JsonBranch({ api, groups, node }: BranchProps): ReactNode {
  const ref = { value: node.value }
  // 行的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getBranchProps(ref) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...bind.attrs} ref={bind.ref}>
      <div {...api.getBranchControlProps(ref) as Record<string, unknown>}>
        <span {...api.getBranchTriggerProps(ref) as Record<string, unknown>}>
          <span {...api.getBranchIndicatorProps(ref) as Record<string, unknown>} />
        </span>
        {node.key != null ? <span {...api.getBranchTextProps(ref) as Record<string, unknown>}>{node.key}</span> : null}
        <span {...api.getPreviewProps(ref) as Record<string, unknown>}>{api.previewText(node)}</span>
      </div>
      {/* 收起的子层不渲染：一份大 JSON 全铺出来会把页面压住，展开集合本来也是逐层放开的 */}
      {api.isExpanded(node.value)
        ? (
            <div {...api.getBranchContentProps(ref) as Record<string, unknown>}>
              <JsonRows api={api} groups={groups} parent={node.value} />
            </div>
          )
        : null}
    </div>
  )
}

/** 树档的滚动层：整棵树铺在其中，键盘也在它上面收口。 */
function JsonViewerTree({ api }: { api: JsonViewerApi }): ReactNode {
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，行得焦也会把它叫起来，那一下会把焦点从行抢回锚点上。
  // 同一节点上的 onFocusOut 归到 React 的 onBlur，留在合成事件那一档不动
  const bind = useNativeEvents(api.getTreeProps() as Record<string, unknown>, ['onFocus'])
  const groups = groupJsonViewerNodesByParent(api.visibleNodes)
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref })}>
      <JsonRows api={api} groups={groups} parent={null} />
    </div>
  )
}

/** 根上自有的取值；行由组件按数据铺设，不接收 children，dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'>

export interface XhJsonViewerRootProps extends RootElementProps {
  /** 要展示的值，任意形状。 */
  value?: unknown
  /** 展示形态：tree 展开为可折叠的行，text 直接输出 JSON 原文。 */
  view?: JsonViewerView
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
  translations?: Partial<JsonViewerTranslations>
  onExpandedValueChange?: JsonViewerProps['onExpandedValueChange']
  /** 空态格子的内容；未写时铺设 translations 中的兜底文案。 */
  empty?: ReactNode
}

/** 行是按数据展开的，作者无法写出也不必写：整棵树由组件自行铺设。 */
export function XhJsonViewerRoot({
  value,
  view,
  variant,
  expandedValue,
  defaultExpandedValue,
  defaultExpandedDepth,
  maxStringLength,
  maxItems,
  sortKeys,
  loop,
  dir,
  size,
  translations,
  onExpandedValueChange,
  empty,
  ...rest
}: XhJsonViewerRootProps): ReactNode {
  const machineProps = {
    value,
    view,
    variant,
    expandedValue,
    defaultExpandedValue,
    defaultExpandedDepth,
    maxStringLength,
    maxItems,
    sortKeys,
    loop,
    dir,
    size,
    translations,
    onExpandedValueChange,
  }
  const ctx = useJsonViewer(withXhConfig('json-viewer', machineProps) as JsonViewerProps)
  const { api } = ctx

  // 两档容器是页内结构容器（与 Tree 同类）：滚动条走 reset 层的原生细条，不接自绘条
  // 空态与滚动层同级：一行也摊不出来时由它说话，有行可摊时 connect 给它打 hidden
  const emptySlot = (
    <div {...api.getEmptyProps() as Record<string, unknown>}>{empty ?? api.emptyText}</div>
  )

  return (
    <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {/* 原文档不铺行：整块文本交给 pre，框选与复制才拿得到与后端一字不差的那份 */}
      {api.view === 'text'
        ? <pre {...api.getTextProps() as Record<string, unknown>}>{api.text}</pre>
        : <JsonViewerTree api={api} />}
      {emptySlot}
    </div>
  )
}

XhJsonViewerRoot.xhEvents = ['expanded-value-change'] as const
