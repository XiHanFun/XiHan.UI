import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { CheckboxGroupApi, CheckboxGroupNode, CheckboxGroupNodeMeta, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import {
  CheckboxGroupItemProvider,
  CheckboxGroupProvider,
  useCheckboxGroupContext,
  useCheckboxGroupItemContext,
} from './context'
import { useCheckboxGroup } from './use-checkbox-group'

type CheckboxGroupProps = CheckboxGroupSchema['props']

/** 函数式 children 的载荷：整组的选中集合与全选态，以及整体替换与翻转单值的方法。 */
export type CheckboxGroupRootSlotProps = Pick<
  CheckboxGroupApi,
  'value' | 'checkedState' | 'isChecked' | 'setValue' | 'toggleValue'
>

export interface XhCheckboxGroupRootProps {
  collection?: CheckboxGroupNode[]
  /** 标题文字。给了它就不必再写 label 部件。 */
  label?: ReactNode
  value?: string[]
  defaultValue?: string[]
  /** 组内全部条目的值；不给时全选格只在 unchecked 与 indeterminate 两态之间走。 */
  itemValues?: string[]
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  name?: string
  orientation?: Orientation
  tone?: Tone
  size?: Size
  onValueChange?: CheckboxGroupProps['onValueChange']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: CheckboxGroupNodeMeta) => ReactNode
  children?: SlotChildren<CheckboxGroupRootSlotProps>
}

export function XhCheckboxGroupRoot({ children, label, renderItem, ...props }: XhCheckboxGroupRootProps): ReactNode {
  const ctx = useCheckboxGroup(props as CheckboxGroupProps)
  const api = ctx.api

  const body = children != null
    ? renderSlot(children, {
        value: api.value,
        checkedState: api.checkedState,
        isChecked: api.isChecked,
        setValue: api.setValue,
        toggleValue: api.toggleValue,
      })
    : props.collection
      ? <DefaultTree collection={api.collection} label={label} renderItem={renderItem} />
      : null

  return (
    <CheckboxGroupProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {body}
      </div>
    </CheckboxGroupProvider>
  )
}

XhCheckboxGroupRoot.xhEvents = ['value-change'] as const

export interface XhCheckboxGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhCheckboxGroupLabel({ children, ...rest }: XhCheckboxGroupLabelProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
/** 表单影子由条目自行装配，不暴露成独立部件：作者只写方框与文本。 */
export function XhCheckboxGroupItem({ value, disabled, children, ...rest }: XhCheckboxGroupItemProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  return (
    <CheckboxGroupItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        <input
          {...ctx.api.getHiddenInputProps(item) as Record<string, unknown>}
          // 选中态由机器持有，这份影子输入没有自己的变更出口。React 要求带 checked 的输入
          // 交出一个出口，否则在开发构建里逐帧告警；节点是 inert，这个出口不会被调用
          onChange={noop}
        />
        {children}
      </div>
    </CheckboxGroupItemProvider>
  )
}

export interface XhCheckboxGroupIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 方框本身对读屏隐藏，children 留给作者放对勾图形。 */
export function XhCheckboxGroupIndicator({ children, ...rest }: XhCheckboxGroupIndicatorProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhCheckboxGroupItemText({ children, ...rest }: XhCheckboxGroupItemTextProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupSelectAllTriggerProps extends ComponentPropsWithRef<'div'> {}
/** 与条目同形的 role=checkbox 节点，渲染为 div，Space 由 connect 接管。 */
export function XhCheckboxGroupSelectAllTrigger({ children, ...rest }: XhCheckboxGroupSelectAllTriggerProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  return <div {...mergeReactProps(ctx.api.getSelectAllTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

function noop(): void {}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 全选把手不在其中：它是可选部件，要它就写 children。
 */
function DefaultTree(props: {
  collection: readonly CheckboxGroupNodeMeta[]
  label?: ReactNode
  renderItem?: (node: CheckboxGroupNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.label != null ? <XhCheckboxGroupLabel>{props.label}</XhCheckboxGroupLabel> : null}
      {props.collection.map(node => (
        <XhCheckboxGroupItem key={node.value} value={node.value}>
          <XhCheckboxGroupIndicator />
          <XhCheckboxGroupItemText>{props.renderItem?.(node) ?? node.label}</XhCheckboxGroupItemText>
        </XhCheckboxGroupItem>
      ))}
    </>
  )
}
