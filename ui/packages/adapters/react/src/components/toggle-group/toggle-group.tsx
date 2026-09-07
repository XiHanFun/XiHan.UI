import type { ActionVariant, Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { ToggleGroupNode, ToggleGroupNodeMeta, ToggleGroupSchema, ToggleGroupValue } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { ToggleGroupProvider, useToggleGroupContext } from './context'
import { useToggleGroup } from './use-toggle-group'

type ToggleGroupProps = ToggleGroupSchema['props']

export interface XhToggleGroupRootProps {
  collection?: ToggleGroupNode[]
  value?: ToggleGroupValue
  defaultValue?: ToggleGroupValue
  multiple?: boolean
  disabled?: boolean
  /** 不许把值清空：单选点当前项不取消，多选摘不掉最后一个。 */
  disallowEmpty?: boolean
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  fullWidth?: boolean
  name?: string
  orientation?: Orientation
  dir?: Direction
  loop?: boolean
  /** roving tabindex，默认开；关掉后每个条目自成一个 Tab 停靠点。 */
  rovingFocus?: boolean
  onValueChange?: ToggleGroupProps['onValueChange']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: ToggleGroupNodeMeta) => ReactNode
  children?: ReactNode
}

export function XhToggleGroupRoot({ children, renderItem, ...props }: XhToggleGroupRootProps): ReactNode {
  const ctx = useToggleGroup(props as ToggleGroupProps)
  const api = ctx.api

  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onFocus'])

  const body = children ?? (props.collection
    ? <DefaultTree collection={api.collection} renderItem={renderItem} />
    : null)

  return (
    <ToggleGroupProvider value={ctx}>
      <div
        {...mergeReactProps(
          bind.attrs,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </ToggleGroupProvider>
  )
}

XhToggleGroupRoot.xhEvents = ['value-change'] as const

export interface XhToggleGroupItemProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
/** 用原生 button，Enter / Space 的激活交给平台。 */
export function XhToggleGroupItem({ value, disabled, children, ...rest }: XhToggleGroupItemProps): ReactNode {
  const ctx = useToggleGroupContext()
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
  useEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'GROUP.BLUR' })
  }, [ctx.service])

  return (
    <button
      {...mergeReactProps(
        ctx.api.getItemProps({ value, disabled }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLButtonElement | null) => { itemEl.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhToggleGroupSeparatorProps extends ComponentPropsWithRef<'span'> {}
/** 段与段之间的装饰线；纯视觉，方向键与读屏都跳过它。 */
export function XhToggleGroupSeparator({ children, ...rest }: XhToggleGroupSeparatorProps): ReactNode {
  const ctx = useToggleGroupContext()
  return <span {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhToggleGroupHiddenInputProps extends ComponentPropsWithRef<'input'> {}
/** 表单出口：整组只有一份，给了 name 才参与提交。 */
export function XhToggleGroupHiddenInput({ ...rest }: XhToggleGroupHiddenInputProps): ReactNode {
  const ctx = useToggleGroupContext()
  return <input {...mergeReactProps(ctx.api.getHiddenInputProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 条目底下没有文本部件，文字直接落在条目里。
 */
function DefaultTree(props: {
  collection: readonly ToggleGroupNodeMeta[]
  renderItem?: (node: ToggleGroupNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.collection.map(node => (
        <XhToggleGroupItem key={node.value} value={node.value}>
          {props.renderItem?.(node) ?? node.label}
        </XhToggleGroupItem>
      ))}
    </>
  )
}
