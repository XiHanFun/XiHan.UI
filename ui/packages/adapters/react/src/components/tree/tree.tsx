/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree 相关实现。

import type { CascadeStrategy, ControlVariant, Direction, Orientation, Service } from '@xihan-ui/core'
import type { TreeApi, TreeNode, TreeSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { TreeNodeProvider, TreeProvider, useTreeContext, useTreeNodeContext } from './context'
import { useTree } from './use-tree'

type TreeProps = TreeSchema['props']

/** 服务端没有提交这一步，layout effect 替换为永不执行的 useEffect，避开 React 的警告。 */

/** 函数式 children 的载荷：可见行序列与展开、选中、焦点状态，以及按值判定与展开、收起、选中的动作。 */
export type TreeRootSlotProps = Pick<
  TreeApi,
  | 'visibleNodes'
  | 'expandedValue'
  | 'selection'
  | 'focusedValue'
  | 'isExpanded'
  | 'isSelected'
  | 'isIndeterminate'
  | 'expand'
  | 'collapse'
  | 'select'
>

/** 本节点持有焦点时，value 变更重新报告焦点节点，卸载时上报整树失焦。 */
function useNodeFocusReport(
  service: Service<TreeSchema>,
  el: RefObject<HTMLElement | null>,
  value: string,
): void {
  const previous = useRef(value)
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'NODE.FOCUS', value })
  }, [service, el, value])

  // 按「本节点当下正持有焦点」判定，不按 value 比对。
  // 用 layout effect：节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在它身上；
  // 排到 passive 那一档就晚了，那时节点已经离场、焦点早掉回 body
  useIsomorphicLayoutEffect(() => () => {
    // 整棵树一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'TREE.BLUR' })
  }, [service, el])
}

export interface XhTreeRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  collection?: TreeNode[]
  /** 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留行。 */
  variant?: ControlVariant
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  selection?: string[]
  defaultSelection?: string[]
  multiple?: boolean
  /** 末端层的排布方式，默认 vertical；horizontal 使子节点全为叶子的层并排铺开。 */
  leafOrientation?: Orientation
  cascade?: boolean
  checkedStrategy?: CascadeStrategy
  expandOnClick?: boolean
  disabled?: boolean
  loading?: boolean
  loop?: boolean
  typeahead?: boolean
  dir?: Direction
  /** 节点可以拖动移动。整个节点都是拖动源，不另设把手。 */
  nodeDraggable?: boolean
  /** 本次移动是否允许。收到的是折算后的落点（移动到哪个父节点下的第几位）。未提供时全部允许。 */
  allowDrop?: TreeProps['allowDrop']
  translations?: TreeProps['translations']
  onExpandedValueChange?: TreeProps['onExpandedValueChange']
  onSelectionChange?: TreeProps['onSelectionChange']
  /** 移动是通知，节点顺序的真源在使用者的数据中。 */
  onNodeMove?: TreeProps['onNodeMove']
  children?: SlotChildren<TreeRootSlotProps>
}

export function XhTreeRoot({
  collection,
  variant,
  expandedValue,
  defaultExpandedValue,
  selection,
  defaultSelection,
  multiple,
  leafOrientation,
  cascade,
  checkedStrategy,
  expandOnClick,
  disabled,
  loading,
  loop,
  typeahead,
  dir,
  nodeDraggable,
  allowDrop,
  translations,
  onExpandedValueChange,
  onSelectionChange,
  onNodeMove,
  children,
  ...rest
}: XhTreeRootProps): ReactNode {
  const ctx = useTree(withXhConfig('tree', {
    collection,
    variant,
    expandedValue,
    defaultExpandedValue,
    selection,
    defaultSelection,
    multiple,
    leafOrientation,
    cascade,
    checkedStrategy,
    expandOnClick,
    disabled,
    loading,
    loop,
    typeahead,
    dir,
    nodeDraggable,
    allowDrop,
    translations,
    onExpandedValueChange,
    onSelectionChange,
    onNodeMove,
  }) as TreeProps)
  const api = ctx.api
  return (
    <TreeProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          visibleNodes: api.visibleNodes,
          expandedValue: api.expandedValue,
          selection: api.selection,
          focusedValue: api.focusedValue,
          isExpanded: api.isExpanded,
          isSelected: api.isSelected,
          isIndeterminate: api.isIndeterminate,
          expand: api.expand,
          collapse: api.collapse,
          select: api.select,
        })}
      </div>
    </TreeProvider>
  )
}

XhTreeRoot.xhEvents = ['expanded-value-change', 'selection-change', 'node-move'] as const

export interface XhTreeLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeLabel({ children, ...rest }: XhTreeLabelProps): ReactNode {
  const ctx = useTreeContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeTreeProps extends ComponentPropsWithRef<'div'> {}
export function XhTreeTree({ children, ...rest }: XhTreeTreeProps): ReactNode {
  const ctx = useTreeContext()
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，节点得焦也会把它叫起来，那一下会把焦点从节点抢回锚点上
  const bind = useNativeEvents(ctx.api.getTreeProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhTreeEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 空态占位：写在 root 中、tree 的兄弟，不进入 role=tree 的拥有关系。 */
export function XhTreeEmpty({ children, ...rest }: XhTreeEmptyProps): ReactNode {
  const ctx = useTreeContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间显示。 */
export function XhTreeLoading({ children, ...rest }: XhTreeLoadingProps): ReactNode {
  const ctx = useTreeContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/**
 * 拖动过程的读屏播报区，视觉上不可见。
 *
 * 放在 root 中、与 tree 部件平级。它必须在拖动开始之前就在 DOM 上：
 * 读屏不播报后插入的节点，等到拾起才渲染等于没有。
 */
export function XhTreeLiveRegion({ children, ...rest }: XhTreeLiveRegionProps): ReactNode {
  const ctx = useTreeContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.announcement}
    </div>
  )
}

export interface XhTreeItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTreeItem({ value, children, ...rest }: XhTreeItemProps): ReactNode {
  const ctx = useTreeContext()
  const node = useMemo(() => ({ value }), [value])
  const el = useRef<HTMLElement | null>(null)
  // 节点的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(node) as Record<string, unknown>, ['onFocus'])
  useNodeFocusReport(ctx.service, el, value)
  return (
    <TreeNodeProvider value={node}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (n: HTMLDivElement | null) => { el.current = n } },
        )}
      >
        {children}
      </div>
    </TreeNodeProvider>
  )
}

export interface XhTreeItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeItemText({ children, ...rest }: XhTreeItemTextProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目的第 2 行副文本，跨文字槽、走 muted 档。 */
export interface XhTreeItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeItemDescription({ children, ...rest }: XhTreeItemDescriptionProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行尾的作者内容（计数、徽标）。 */
export interface XhTreeItemSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeItemSuffix({ children, ...rest }: XhTreeItemSuffixProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeNodeDragTriggerProps extends ComponentPropsWithRef<'span'> {}
/**
 * 节点拖拽把手。放在节点中，自带 touch-action: none，按下即拖动，不等待激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘移动由树上的 Alt + 方向键承担。
 * 整个节点拖动的路径照常可用，把手是叠加的第二个入口。
 */
export function XhTreeNodeDragTrigger({ children, ...rest }: XhTreeNodeDragTriggerProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getNodeDragTriggerProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeItemCheckboxProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeItemCheckbox({ children, ...rest }: XhTreeItemCheckboxProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemCheckboxProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeBranchCheckboxProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeBranchCheckbox({ children, ...rest }: XhTreeBranchCheckboxProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchCheckboxProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeItemIndicator({ children, ...rest }: XhTreeItemIndicatorProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeBranchProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
/** 分支自身也是 treeitem，供其子部件读取；子节点各自再挂一层。 */
export function XhTreeBranch({ value, children, ...rest }: XhTreeBranchProps): ReactNode {
  const ctx = useTreeContext()
  const node = useMemo(() => ({ value }), [value])
  const el = useRef<HTMLElement | null>(null)
  // 节点的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getBranchProps(node) as Record<string, unknown>, ['onFocus'])
  useNodeFocusReport(ctx.service, el, value)
  return (
    <TreeNodeProvider value={node}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (n: HTMLDivElement | null) => { el.current = n } },
        )}
      >
        {children}
      </div>
    </TreeNodeProvider>
  )
}

export interface XhTreeBranchControlProps extends ComponentPropsWithRef<'div'> {}
export function XhTreeBranchControl({ children, ...rest }: XhTreeBranchControlProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <div {...mergeReactProps(ctx.api.getBranchControlProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeBranchTriggerProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeBranchTrigger({ children, ...rest }: XhTreeBranchTriggerProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchTriggerProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeBranchIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeBranchIndicator({ children, ...rest }: XhTreeBranchIndicatorProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchIndicatorProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeBranchTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeBranchText({ children, ...rest }: XhTreeBranchTextProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchTextProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeBranchContentProps extends ComponentPropsWithRef<'div'> {}
/** 收起只加 hidden，不卸载子树节点。 */
export function XhTreeBranchContent({ children, ...rest }: XhTreeBranchContentProps): ReactNode {
  const ctx = useTreeContext()
  const node = useTreeNodeContext()
  return <div {...mergeReactProps(ctx.api.getBranchContentProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
