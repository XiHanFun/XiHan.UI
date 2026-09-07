import type { Direction } from '@xihan-ui/core'
import type { SortableItemState, SortableMode, SortableSchema, SortableTranslations } from '@xihan-ui/headless'
import type { SortableAxis } from '@xihan-ui/pointer'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { SortableProvider, useSortableContext } from './context'
import { useSortable } from './use-sortable'

type SortableProps = SortableSchema['props']

/** 函数式 children 的载荷：逐项呈现状态与整体拖动态。 */
export interface SortableRootSlotProps {
  items: SortableItemState[]
  dragging: boolean
  activeId: string | null
  from: number
  to: number
  mode: SortableMode | null
}

/** 每一项的载荷。`dragging` 是「就是它被拖着」，不是「列表里有人在拖」。 */
export interface SortableItemSlotProps {
  dragging: boolean
  index: number
}

export interface XhSortableRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir' | 'onDragStart' | 'onDragEnd'> {
  /** 项的稳定标识，数组顺序就是当前顺序。 */
  ids?: string[]
  /** 排序沿哪根轴走；换行网格用 both。 */
  orientation?: SortableAxis
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  disabled?: boolean
  /** 按下之后走多远才算开始拖，默认 5px。 */
  activationDistance?: number
  /** 拖到容器边缘时自动滚动，默认开。 */
  autoScroll?: boolean
  translations?: Partial<SortableTranslations>
  /** 顺序变化意图；取消的那次不发。 */
  onSort?: SortableProps['onSort']
  onDragStart?: SortableProps['onDragStart']
  onDragEnd?: SortableProps['onDragEnd']
  children?: SlotChildren<SortableRootSlotProps>
}

export function XhSortableRoot({
  ids,
  orientation,
  dir,
  disabled,
  activationDistance,
  autoScroll,
  translations,
  onSort,
  onDragStart,
  onDragEnd,
  children,
  ...rest
}: XhSortableRootProps): ReactNode {
  const ctx = useSortable(withXhConfig('sortable', {
    ids: ids ?? [],
    orientation,
    dir,
    disabled,
    activationDistance,
    autoScroll,
    translations,
    onSort,
    onDragStart,
    onDragEnd,
  }) as SortableProps)
  const api = ctx.api

  return (
    <SortableProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          items: api.items,
          dragging: api.dragging,
          activeId: api.activeId,
          from: api.from,
          to: api.to,
          mode: api.mode,
        })}
      </div>
    </SortableProvider>
  )
}

XhSortableRoot.xhEvents = ['sort', 'drag-start', 'drag-end'] as const

export interface XhSortableItemProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 项标识，与 ids 里的值一一对应。 */
  itemId: string
  /** 单独禁掉这一项。整份 disabled 在 Root 上，这条是项级的。 */
  disabled?: boolean
  children?: SlotChildren<SortableItemSlotProps>
}

export function XhSortableItem({ itemId, disabled, children, ...rest }: XhSortableItemProps): ReactNode {
  const ctx = useSortableContext()
  const state = ctx.api.items.find(item => item.id === itemId)
  return (
    <div
      {...mergeReactProps(
        ctx.api.getItemProps({ id: itemId, disabled }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {renderSlot(children, { dragging: state?.dragging ?? false, index: state?.index ?? -1 })}
    </div>
  )
}

export interface XhSortableItemDragTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 项标识，与 ids 里的值一一对应。 */
  itemId: string
  /** 单独禁掉这一项。整份 disabled 在 Root 上，这条是项级的。 */
  disabled?: boolean
}

export function XhSortableItemDragTrigger({ itemId, disabled, children, ...rest }: XhSortableItemDragTriggerProps): ReactNode {
  const ctx = useSortableContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getItemDragTriggerProps({ id: itemId, disabled }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}

export interface XhSortableDropIndicatorProps extends ComponentPropsWithRef<'div'> {}

/**
 * 落点线：拖动中画在松手后这一项会插进去的那条缝上，落点与起点同一位时不在场。
 *
 * 它是容器的绝对定位子节点，写在 Root 里、排在末项之后——那样它才画在各项之上。
 */
export function XhSortableDropIndicator({ ...rest }: XhSortableDropIndicatorProps): ReactNode {
  const ctx = useSortableContext()
  return <div {...mergeReactProps(ctx.api.getDropIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhSortableLiveRegionProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/**
 * 拖动过程的读屏播报区，视觉上不可见。
 *
 * 放进列表里就行，位置不限。它必须在拖动开始之前就在 DOM 上——
 * 读屏不播报后插入的节点。
 */
export function XhSortableLiveRegion({ ...rest }: XhSortableLiveRegionProps): ReactNode {
  const ctx = useSortableContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {ctx.service.context.get('announcement')}
    </div>
  )
}
