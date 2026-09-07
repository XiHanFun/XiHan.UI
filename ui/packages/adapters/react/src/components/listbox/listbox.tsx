import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { ListboxApi, ListboxNode, ListboxNodeMeta, ListboxSchema, ListboxSelectionMode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import {
  ListboxGroupProvider,
  ListboxItemProvider,
  ListboxProvider,
  useListboxContext,
  useListboxGroupContext,
  useListboxItemContext,
} from './context'
import { useListbox } from './use-listbox'

type ListboxProps = ListboxSchema['props']

/** 函数式 children 的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换的命令。 */
export type ListboxRootSlotProps = Pick<
  ListboxApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle'
>

export interface XhListboxRootProps {
  collection?: ListboxNode[]
  /** 标题文字。给了它就不必再写 label 部件。 */
  label?: ReactNode
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: ListboxSelectionMode
  disabled?: boolean
  /** 只读：条目照常浏览与聚焦，但选中值改不动。 */
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  tone?: Tone
  size?: Size
  loop?: boolean
  typeahead?: boolean
  dir?: Direction
  orientation?: Orientation
  onValueChange?: ListboxProps['onValueChange']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: ListboxNodeMeta) => ReactNode
  children?: SlotChildren<ListboxRootSlotProps>
}

export function XhListboxRoot({ children, label, renderItem, ...props }: XhListboxRootProps): ReactNode {
  const ctx = useListbox(props as ListboxProps)
  const api = ctx.api

  const body = children != null
    ? renderSlot(children, {
        value: api.value,
        selectionMode: api.selectionMode,
        focusedValue: api.focusedValue,
        isSelected: api.isSelected,
        setValue: api.setValue,
        select: api.select,
        toggle: api.toggle,
      })
    : props.collection
      ? <DefaultTree collection={api.collection} label={label} renderItem={renderItem} />
      : null

  return (
    <ListboxProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>{body}</div>
    </ListboxProvider>
  )
}

XhListboxRoot.xhEvents = ['value-change'] as const

export interface XhListboxLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxLabel({ children, ...rest }: XhListboxLabelProps): ReactNode {
  const ctx = useListboxContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhListboxContentProps extends ComponentPropsWithRef<'div'> {}
/** 列表框本体：条目放这里面，方向键与连打检索都落在这一层。 */
export function XhListboxContent({ children, ...rest }: XhListboxContentProps): ReactNode {
  const ctx = useListboxContext()
  // content 自身得焦时把焦点转交给锚点条目，收的是不冒泡的 DOM focus：合成事件挂在
  // 冒泡的 focusin 上，后代条目得焦也会把它叫起来，判据整个变味。
  // onFocusOut 不动——它经归一化落到 React 的 onBlur，挂的正是冒泡的 focusout
  const bind = useNativeEvents(ctx.api.getContentProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhListboxEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 空态占位：写在 root 里、content 的兄弟，不进列表框的拥有关系。 */
export function XhListboxEmpty({ children, ...rest }: XhListboxEmptyProps): ReactNode {
  const ctx = useListboxContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListboxLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间顶上来。 */
export function XhListboxLoading({ children, ...rest }: XhListboxLoadingProps): ReactNode {
  const ctx = useListboxContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListboxLoadMoreTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 取下一页的入口：点了做什么归作者，这里只把在途与禁用两档焊成点不动。 */
export function XhListboxLoadMoreTrigger({ children, ...rest }: XhListboxLoadMoreTriggerProps): ReactNode {
  const ctx = useListboxContext()
  return <button {...mergeReactProps(ctx.api.getLoadMoreTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhListboxGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
/** 分组容器：条目照常挂在它里面，role=group 是列表框允许拥有的两种子节点之一。 */
export function XhListboxGroup({ value, children, ...rest }: XhListboxGroupProps): ReactNode {
  const ctx = useListboxContext()
  const group = useMemo(() => ({ value }), [value])
  return (
    <ListboxGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </ListboxGroupProvider>
  )
}

export interface XhListboxGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxGroupLabel({ children, ...rest }: XhListboxGroupLabelProps): ReactNode {
  const ctx = useListboxContext()
  const group = useListboxGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhListboxItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhListboxItem({ value, disabled, children, ...rest }: XhListboxItemProps): ReactNode {
  const ctx = useListboxContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onFocus'])

  // 本条目持有焦点时，value 变更重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', value })
  }, [ctx.service, value])

  // 卸载时上报列表失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'LIST.BLUR' })
  }, [ctx.service])

  return (
    <ListboxItemProvider value={item}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { itemEl.current = el } },
        )}
      >
        {children}
      </div>
    </ListboxItemProvider>
  )
}

export interface XhListboxItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemText({ children, ...rest }: XhListboxItemTextProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhListboxItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemIndicator({ children, ...rest }: XhListboxItemIndicatorProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly ListboxNodeMeta[]
  label?: ReactNode
  renderItem?: (node: ListboxNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.label != null ? <XhListboxLabel>{props.label}</XhListboxLabel> : null}
      <XhListboxContent>
        {props.collection.map(node => (
          <XhListboxItem key={node.value} value={node.value}>
            <XhListboxItemText>{props.renderItem?.(node) ?? node.label}</XhListboxItemText>
            <XhListboxItemIndicator />
          </XhListboxItem>
        ))}
      </XhListboxContent>
    </>
  )
}
