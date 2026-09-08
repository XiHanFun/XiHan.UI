import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { NumberFieldApi, NumberFieldSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { NumberFieldProvider, useNumberFieldContext } from './context'
import { useNumberField } from './use-number-field'

type NumberFieldProps = NumberFieldSchema['props']

/** 函数式 children 的载荷：原始输入串与其数值、增减是否还走得动，以及写值、增减的命令。 */
export type NumberFieldRootSlotProps = Pick<
  NumberFieldApi,
  'value' | 'valueAsNumber' | 'empty' | 'canIncrement' | 'canDecrement' | 'setValue' | 'increment' | 'decrement'
>

/** 根上自有的那些取值；defaultValue 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'>

export interface XhNumberFieldRootProps extends RootElementProps {
  /** 值是原始输入串。 */
  value?: string
  defaultValue?: string
  min?: number
  max?: number
  step?: number
  largeStep?: number
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；给了才参与提交。 */
  name?: string
  changeDelay?: number
  changeInterval?: number
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  parse?: NumberFieldProps['parse']
  format?: NumberFieldProps['format']
  onValueChange?: NumberFieldProps['onValueChange']
  children?: SlotChildren<NumberFieldRootSlotProps>
}

export function XhNumberFieldRoot({
  value,
  defaultValue,
  min,
  max,
  step,
  largeStep,
  disabled,
  readOnly,
  required,
  invalid,
  name,
  changeDelay,
  changeInterval,
  variant,
  tone,
  size,
  parse,
  format,
  onValueChange,
  children,
  ...rest
}: XhNumberFieldRootProps): ReactNode {
  const ctx = useNumberField({
    value,
    defaultValue,
    min,
    max,
    step,
    largeStep,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    changeDelay,
    changeInterval,
    variant,
    tone,
    size,
    parse,
    format,
    onValueChange,
  } as NumberFieldProps)
  const api = ctx.api
  return (
    <NumberFieldProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, {
          value: api.value,
          valueAsNumber: api.valueAsNumber,
          empty: api.empty,
          canIncrement: api.canIncrement,
          canDecrement: api.canDecrement,
          setValue: api.setValue,
          increment: api.increment,
          decrement: api.decrement,
        })}
      </div>
    </NumberFieldProvider>
  )
}

XhNumberFieldRoot.xhEvents = ['value-change'] as const

export interface XhNumberFieldLabelProps extends ComponentPropsWithRef<'label'> {}
export function XhNumberFieldLabel({ children, ...rest }: XhNumberFieldLabelProps): ReactNode {
  const ctx = useNumberFieldContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhNumberFieldControlProps extends ComponentPropsWithRef<'div'> {}
/** 视觉盒：输入框与加减钮都放进来，皮肤把描边、底色、聚焦环画在它身上。 */
export function XhNumberFieldControl({ children, ...rest }: XhNumberFieldControlProps): ReactNode {
  const ctx = useNumberFieldContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhNumberFieldPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhNumberFieldPrefix({ children, ...rest }: XhNumberFieldPrefixProps): ReactNode {
  const ctx = useNumberFieldContext()
  return (
    <span {...mergeReactProps(ctx.api.getPrefixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhNumberFieldSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhNumberFieldSuffix({ children, ...rest }: XhNumberFieldSuffixProps): ReactNode {
  const ctx = useNumberFieldContext()
  return (
    <span {...mergeReactProps(ctx.api.getSuffixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhNumberFieldInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhNumberFieldInput({ ...rest }: XhNumberFieldInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = useNumberFieldContext()
  return (
    <input
      {...mergeReactProps(
        fieldLabel({
          ...ctx.api.getInputProps() as Record<string, unknown>,
          ...fieldWiring,
        }),
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhNumberFieldIncrementTriggerProps extends ComponentPropsWithRef<'button'> {}

/**
 * 加号。pointerleave 是按住连发的三条收尾出口之一，React 的合成 onPointerLeave 由
 * pointerout 模拟出来、收不到直接派到节点上的 pointerleave，改装成原生监听器才与另外两家
 * 同一条到达路径。
 */
export function XhNumberFieldIncrementTrigger({ children, ...rest }: XhNumberFieldIncrementTriggerProps): ReactNode {
  const ctx = useNumberFieldContext()
  const bind = useNativeEvents(ctx.api.getIncrementTriggerProps() as Record<string, unknown>, ['onPointerLeave'])
  return (
    <button {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhNumberFieldDecrementTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 减号；pointerleave 的处理同加号。 */
export function XhNumberFieldDecrementTrigger({ children, ...rest }: XhNumberFieldDecrementTriggerProps): ReactNode {
  const ctx = useNumberFieldContext()
  const bind = useNativeEvents(ctx.api.getDecrementTriggerProps() as Record<string, unknown>, ['onPointerLeave'])
  return (
    <button {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
