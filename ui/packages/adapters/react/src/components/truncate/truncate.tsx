import type { TruncateApi, TruncateSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useTruncate } from './use-truncate'

type TruncateProps = TruncateSchema['props']

/** 函数式 children 的载荷：展开态与量出来的溢出与否，以及展开与重量一次的方法。 */
export type TruncateSlotProps = Pick<TruncateApi, 'open' | 'overflowing' | 'setOpen' | 'measure'>

export interface XhTruncateProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 夹几行，1 为单行，默认 1。 */
  lines?: number
  /** 点一下铺开全文。 */
  expandable?: boolean
  /** 受控展开；缺省该 prop 即非受控。 */
  open?: boolean
  /** 非受控时的初始展开态。 */
  defaultOpen?: boolean
  /** 真被裁掉了才把整段文字交给平台的原生提示。 */
  tooltip?: boolean
  onOpenChange?: TruncateProps['onOpenChange']
  onOverflowChange?: TruncateProps['onOverflowChange']
  children?: SlotChildren<TruncateSlotProps>
}

/**
 * 一段夹住的文字：单行收成省略号，多行按行数裁。
 * 溢出与否是量出来的，落在 data-overflowing 上，也经函数式 children 的 overflowing 交出去——
 * 要不要再套一层提示由作者决定，这里不做浮层。
 */
export function XhTruncate({
  lines,
  expandable,
  open,
  defaultOpen,
  tooltip,
  onOpenChange,
  onOverflowChange,
  children,
  ...rest
}: XhTruncateProps): ReactNode {
  const ctx = useTruncate({
    lines,
    expandable,
    open,
    defaultOpen,
    tooltip,
    onOpenChange,
    onOverflowChange,
  } as TruncateProps)
  const props = mergeReactProps(
    ctx.api.getRootProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
    { ref: ctx.rootRef as Ref<unknown> },
  )
  return (
    <div {...props}>
      {renderSlot(children, {
        open: ctx.api.open,
        overflowing: ctx.api.overflowing,
        setOpen: ctx.api.setOpen,
        measure: ctx.api.measure,
      })}
    </div>
  )
}

XhTruncate.xhEvents = ['open-change', 'overflow-change'] as const
