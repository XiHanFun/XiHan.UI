import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { SegmentedNode, SegmentedNodeMeta, SegmentedSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { SegmentedItemProvider, SegmentedProvider, useSegmentedContext, useSegmentedItemContext } from './context'
import { useSegmented } from './use-segmented'

type SegmentedProps = SegmentedSchema['props']

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhSegmentedRootProps extends RootElementProps {
  collection?: SegmentedNode[]
  value?: string | null
  defaultValue?: string | null
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  /** 表单字段名；给了 hidden-input 才带 name 并参与提交。 */
  name?: string
  orientation?: Orientation
  dir?: Direction
  loop?: boolean
  /** 整组撑满可用宽度，每段等分。 */
  block?: boolean
  tone?: Tone
  size?: Size
  onValueChange?: SegmentedProps['onValueChange']
  /** 每一段的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: SegmentedNodeMeta) => ReactNode
  children?: ReactNode
}

export function XhSegmentedRoot({
  collection,
  value,
  defaultValue,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  orientation,
  dir,
  loop,
  block,
  tone,
  size,
  onValueChange,
  renderItem,
  children,
  ...rest
}: XhSegmentedRootProps): ReactNode {
  const ctx = useSegmented({
    collection,
    value,
    defaultValue,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    orientation,
    dir,
    loop,
    block,
    tone,
    size,
    onValueChange,
  } as SegmentedProps)
  const api = ctx.api

  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onFocus'])

  // 写了 children 就整套结构自理：隐藏输入也要自己放一个 XhSegmentedHiddenInput，
  // 否则给了 name 也没有任何东西参与提交
  const body = children ?? (collection
    ? <DefaultTree collection={api.collection} renderItem={renderItem} />
    : null)

  return (
    <SegmentedProvider value={ctx}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </SegmentedProvider>
  )
}

XhSegmentedRoot.xhEvents = ['value-change'] as const

export interface XhSegmentedItemProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
/** 用原生 button，Enter / Space 的激活交给平台。 */
export function XhSegmentedItem({ value, disabled, children, ...rest }: XhSegmentedItemProps): ReactNode {
  const ctx = useSegmentedContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)

  // 本段持有焦点时，value 变更重报焦点段
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

  // 卸载时上报整组失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'GROUP.BLUR' })
  }, [ctx.service])

  // 段自己的 onFocus 同样是不冒泡的 DOM focus：改装成原生监听器，与另外两家同一条到达路径
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onFocus'])

  return (
    <SegmentedItemProvider value={item}>
      <button
        {...mergeReactProps(
          bind.attrs,
          { ref: bind.ref },
          rest as Record<string, unknown>,
          { ref: (el: HTMLButtonElement | null) => { itemEl.current = el } },
        )}
      >
        {children}
      </button>
    </SegmentedItemProvider>
  )
}

export interface XhSegmentedItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhSegmentedItemText({ children, ...rest }: XhSegmentedItemTextProps): ReactNode {
  const ctx = useSegmentedContext()
  const item = useSegmentedItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSegmentedIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 会滑动的选中标记，位置由机器量好写进内联样式的私有槽；无选中项时收起。 */
export function XhSegmentedIndicator({ children, ...rest }: XhSegmentedIndicatorProps): ReactNode {
  const ctx = useSegmentedContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSegmentedHiddenInputProps extends ComponentPropsWithRef<'input'> {}
/** 表单出口：整组只有一份，给了 name 才带上它，提交的就是当前选中值。 */
export function XhSegmentedHiddenInput({ ...rest }: XhSegmentedHiddenInputProps): ReactNode {
  const ctx = useSegmentedContext()
  return <input {...mergeReactProps(ctx.api.getHiddenInputProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 指示器排在最前：它绝对定位，靠文档序让后面的段压在它上面，段里的文字才不会被盖住。
 */
function DefaultTree(props: {
  collection: readonly SegmentedNodeMeta[]
  renderItem?: (node: SegmentedNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      <XhSegmentedIndicator />
      {props.collection.map(node => (
        <XhSegmentedItem key={node.value} value={node.value}>
          <XhSegmentedItemText>{props.renderItem?.(node) ?? node.label}</XhSegmentedItemText>
        </XhSegmentedItem>
      ))}
      <XhSegmentedHiddenInput />
    </>
  )
}
