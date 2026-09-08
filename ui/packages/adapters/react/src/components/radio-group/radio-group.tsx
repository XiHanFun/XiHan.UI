import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { RadioGroupNode, RadioGroupNodeMeta, RadioGroupSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { RadioGroupItemProvider, RadioGroupProvider, useRadioGroupContext, useRadioGroupItemContext } from './context'
import { useRadioGroup } from './use-radio-group'

type RadioGroupProps = RadioGroupSchema['props']

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhRadioGroupRootProps extends RootElementProps {
  collection?: RadioGroupNode[]
  /** 标题文字。给了它就不必再写 label 部件。 */
  label?: ReactNode
  value?: string | null
  defaultValue?: string | null
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  orientation?: Orientation
  dir?: Direction
  name?: string
  tone?: Tone
  size?: Size
  onValueChange?: RadioGroupProps['onValueChange']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: RadioGroupNodeMeta) => ReactNode
  children?: ReactNode
}

export function XhRadioGroupRoot({
  collection,
  label,
  value,
  defaultValue,
  disabled,
  readOnly,
  invalid,
  required,
  orientation,
  dir,
  name,
  tone,
  size,
  onValueChange,
  renderItem,
  children,
  ...rest
}: XhRadioGroupRootProps): ReactNode {
  const ctx = useRadioGroup({
    collection,
    value,
    defaultValue,
    disabled,
    readOnly,
    invalid,
    required,
    orientation,
    dir,
    name,
    tone,
    size,
    onValueChange,
  } as RadioGroupProps)
  const api = ctx.api

  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onFocus'])

  const body = children ?? (collection
    ? <DefaultTree collection={api.collection} label={label} renderItem={renderItem} />
    : null)

  return (
    <RadioGroupProvider value={ctx}>
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
    </RadioGroupProvider>
  )
}

XhRadioGroupRoot.xhEvents = ['value-change'] as const

export interface XhRadioGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhRadioGroupLabel({ children, ...rest }: XhRadioGroupLabelProps): ReactNode {
  const ctx = useRadioGroupContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhRadioGroupItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
/** 隐藏输入与 indicator 由条目自行装配，不暴露成独立部件。 */
export function XhRadioGroupItem({ value, disabled, children, ...rest }: XhRadioGroupItemProps): ReactNode {
  const ctx = useRadioGroupContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)

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

  // 卸载时上报整组失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'GROUP.BLUR' })
  }, [ctx.service])

  return (
    <RadioGroupItemProvider value={item}>
      <div
        {...mergeReactProps(
          ctx.api.getItemProps(item) as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { itemEl.current = el } },
        )}
      >
        <input
          {...ctx.api.getHiddenInputProps(item) as Record<string, unknown>}
          // 选中态由机器持有，这份影子输入没有自己的变更出口。React 要求带 checked 的输入
          // 交出一个出口，否则在开发构建里逐帧告警；节点是 inert，这个出口不会被调用
          onChange={noop}
        />
        <span {...ctx.api.getIndicatorProps(item) as Record<string, unknown>} />
        {children}
      </div>
    </RadioGroupItemProvider>
  )
}

export interface XhRadioGroupItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhRadioGroupItemText({ children, ...rest }: XhRadioGroupItemTextProps): ReactNode {
  const ctx = useRadioGroupContext()
  const item = useRadioGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

function noop(): void {}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly RadioGroupNodeMeta[]
  label?: ReactNode
  renderItem?: (node: RadioGroupNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.label != null ? <XhRadioGroupLabel>{props.label}</XhRadioGroupLabel> : null}
      {props.collection.map(node => (
        <XhRadioGroupItem key={node.value} value={node.value}>
          <XhRadioGroupItemText>{props.renderItem?.(node) ?? node.label}</XhRadioGroupItemText>
        </XhRadioGroupItem>
      ))}
    </>
  )
}
