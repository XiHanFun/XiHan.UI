import type { Direction, Service, Size, Tone } from '@xihan-ui/core'
import type {
  TransferCheckState,
  TransferFilter,
  TransferItem,
  TransferSchema,
  TransferSide,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import {
  TransferGroupProvider,
  TransferItemProvider,
  TransferPanelProvider,
  TransferProvider,
  useTransferContext,
  useTransferGroupContext,
  useTransferItemContext,
  useTransferPanelContext,
} from './context'
import { useTransfer } from './use-transfer'

type TransferProps = TransferSchema['props']

/** 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告。 */

/** 函数式 children 的载荷：目标侧的值与两侧的勾选、两侧当下可见的条目，以及勾选、写值与搬运的动作。 */
export interface TransferRootSlotProps {
  value: string[]
  selection: string[]
  sourceItems: readonly TransferItem[]
  targetItems: readonly TransferItem[]
  canMove: (to: TransferSide) => boolean
  checkState: (side: TransferSide) => TransferCheckState
  isChecked: (value: string) => boolean
  setValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  toggle: (value: string, options?: { extend?: boolean }) => void
  toggleAll: (side: TransferSide) => void
  move: (to: TransferSide) => void
}

/** 面板函数式 children 的载荷：这一侧的身份、当下可见的条目、这一侧的全选三态与搜索词。 */
export interface TransferPanelSlotProps {
  side: TransferSide
  items: readonly TransferItem[]
  checkState: TransferCheckState
  query: string
}

export interface XhTransferRootProps {
  collection?: TransferItem[]
  value?: string[]
  defaultValue?: string[]
  selection?: string[]
  defaultSelection?: string[]
  searchable?: boolean
  filter?: TransferFilter
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  tone?: Tone
  size?: Size
  oneWay?: boolean
  loop?: boolean
  dir?: Direction
  translations?: TransferProps['translations']
  onValueChange?: TransferProps['onValueChange']
  onSelectionChange?: TransferProps['onSelectionChange']
  children?: SlotChildren<TransferRootSlotProps>
}

export function XhTransferRoot({ children, ...props }: XhTransferRootProps): ReactNode {
  const ctx = useTransfer(withXhConfig('transfer', props) as TransferProps)
  const api = ctx.api
  return (
    <TransferProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          value: api.value,
          selection: api.selection,
          sourceItems: api.visibleItems('source'),
          targetItems: api.visibleItems('target'),
          canMove: api.canMove,
          checkState: api.checkState,
          isChecked: api.isChecked,
          setValue: api.setValue,
          setSelection: api.setSelection,
          toggle: api.toggle,
          toggleAll: api.toggleAll,
          move: api.move,
        })}
      </div>
    </TransferProvider>
  )
}

XhTransferRoot.xhEvents = ['value-change', 'selection-change'] as const

export interface XhTransferPanelProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: SlotChildren<TransferPanelSlotProps>
}

/** 源 / 目标两个面板的共同实现，两侧只在 side 上不同。 */
function TransferPanel({ side, children, ...rest }: XhTransferPanelProps & { side: TransferSide }): ReactNode {
  const ctx = useTransferContext()
  const panel = useMemo(() => ({ side }), [side])
  const api = ctx.api
  return (
    <TransferPanelProvider value={panel}>
      <div {...mergeReactProps(api.getPanelProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          side,
          // 这一侧当下看得见的条目（分侧 + 搜索之后），不是数据入口：入口叫 collection，是整份全集
          items: api.visibleItems(side),
          checkState: api.checkState(side),
          query: api.query(side),
        })}
      </div>
    </TransferPanelProvider>
  )
}

export function XhTransferSourcePanel(props: XhTransferPanelProps): ReactNode {
  return <TransferPanel {...props} side="source" />
}

export function XhTransferTargetPanel(props: XhTransferPanelProps): ReactNode {
  return <TransferPanel {...props} side="target" />
}

export interface XhTransferPanelHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhTransferPanelHeader({ children, ...rest }: XhTransferPanelHeaderProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <div {...mergeReactProps(ctx.api.getPanelHeaderProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTransferPanelTitleProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferPanelTitle({ children, ...rest }: XhTransferPanelTitleProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <span {...mergeReactProps(ctx.api.getPanelTitleProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTransferPanelCountProps extends ComponentPropsWithRef<'span'> {}
/** 只带 data-checked-count / data-count 属性，文案由作者或皮肤层提供。 */
export function XhTransferPanelCount({ children, ...rest }: XhTransferPanelCountProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <span {...mergeReactProps(ctx.api.getPanelCountProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTransferSearchProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {}
export function XhTransferSearch({ ...rest }: XhTransferSearchProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getSearchProps(panel) as Record<string, unknown>,
        // 搜索串攥在机器里，写回走 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警；真正的写回不经它
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhTransferListProps extends ComponentPropsWithRef<'div'> {}
export function XhTransferList({ children, ...rest }: XhTransferListProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上
  const bind = useNativeEvents(ctx.api.getListProps(panel) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhTransferSelectAllTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 用原生 button，激活与禁用交给平台。 */
export function XhTransferSelectAllTrigger({ children, ...rest }: XhTransferSelectAllTriggerProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return (
    <button {...mergeReactProps(ctx.api.getSelectAllTriggerProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhTransferEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 空态占位：写在面板里、list 的兄弟；本侧没有可见条目时由连接层放它出面。 */
export function XhTransferEmpty({ children, ...rest }: XhTransferEmptyProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTransferLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间顶上来。 */
export function XhTransferLoading({ children, ...rest }: XhTransferLoadingProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps(panel) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTransferGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTransferGroup({ value, children, ...rest }: XhTransferGroupProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  // 两侧各挂一份同名分组，身份连 side 一起算，两边的标题 id 才不撞
  const group = useMemo(() => ({ value, side: panel.side }), [value, panel.side])
  return (
    <TransferGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </TransferGroupProvider>
  )
}

export interface XhTransferGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferGroupLabel({ children, ...rest }: XhTransferGroupLabelProps): ReactNode {
  const ctx = useTransferContext()
  const group = useTransferGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 本条目持有焦点时，value 变更重报焦点条目，卸载时上报本侧列表失焦。 */
function useItemFocusReport(
  service: Service<TransferSchema>,
  el: RefObject<HTMLElement | null>,
  value: string,
  side: TransferSide,
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
      service.send({ type: 'ITEM.FOCUS', side, value })
  }, [service, el, value, side])

  // 按「本条目当下正持有焦点」判定，不按 value 比对。
  // 用 layout effect：节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在它身上；
  // 排到 passive 那一档就晚了，那时节点已经离场、焦点早掉回 body
  useIsomorphicLayoutEffect(() => () => {
    // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'LIST.BLUR', side })
  }, [service, el, side])
}

export interface XhTransferItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTransferItem({ value, children, ...rest }: XhTransferItemProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  // 条目只报值与所属面板，禁用与标签回 collection 里查；同一 value 的两侧节点靠 side 分身份
  const item = useMemo(() => ({ value, side: panel.side }), [value, panel.side])
  const el = useRef<HTMLElement | null>(null)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onFocus'])
  useItemFocusReport(ctx.service, el, value, panel.side)
  return (
    <TransferItemProvider value={item}>
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
    </TransferItemProvider>
  )
}

export interface XhTransferItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferItemText({ children, ...rest }: XhTransferItemTextProps): ReactNode {
  const ctx = useTransferContext()
  const item = useTransferItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTransferItemCheckboxProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferItemCheckbox({ children, ...rest }: XhTransferItemCheckboxProps): ReactNode {
  const ctx = useTransferContext()
  const item = useTransferItemContext()
  return <span {...mergeReactProps(ctx.api.getItemCheckboxProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTransferToTargetTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 用原生 button，激活与禁用交给平台。 */
export function XhTransferToTargetTrigger({ children, ...rest }: XhTransferToTargetTriggerProps): ReactNode {
  const ctx = useTransferContext()
  return (
    <button {...mergeReactProps(ctx.api.getToTargetTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhTransferToSourceTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTransferToSourceTrigger({ children, ...rest }: XhTransferToSourceTriggerProps): ReactNode {
  const ctx = useTransferContext()
  return (
    <button {...mergeReactProps(ctx.api.getToSourceTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

function noop(): void {}
