import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TextFieldApi, TextFieldInputHost, TextFieldSchema, TextFieldType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { autoSizeTextarea } from '@xihan-ui/headless'
import { useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { TextFieldProvider, useTextFieldContext } from './context'
import { useTextField } from './use-text-field'

type TextFieldProps = TextFieldSchema['props']

/** 函数式 children 的载荷：当前值、值状态标志与写值方法。 */
export type TextFieldRootSlotProps = Pick<
  TextFieldApi,
  'value' | 'empty' | 'atLimit' | 'count' | 'canClear' | 'setValue' | 'clear'
>

/** 字数部件函数式 children 的载荷：当前字数、上限与顶到上限的标志。 */
export type TextFieldCountSlotProps = Pick<TextFieldApi, 'count' | 'maxLength' | 'atLimit'>

export interface XhTextFieldRootProps {
  value?: string
  defaultValue?: string
  type?: TextFieldType
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；给了才参与提交。 */
  name?: string
  maxLength?: number
  clearable?: boolean
  showCount?: boolean
  autoSize?: TextFieldProps['autoSize']
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: TextFieldProps['translations']
  onValueChange?: TextFieldProps['onValueChange']
  children?: SlotChildren<TextFieldRootSlotProps>
}

export function XhTextFieldRoot({ children, ...props }: XhTextFieldRootProps): ReactNode {
  const ctx = useTextField(withXhConfig('text-field', props) as TextFieldProps)
  const api = ctx.api
  return (
    <TextFieldProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {renderSlot(children, {
          value: api.value,
          empty: api.empty,
          atLimit: api.atLimit,
          count: api.count,
          canClear: api.canClear,
          setValue: api.setValue,
          clear: api.clear,
        })}
      </div>
    </TextFieldProvider>
  )
}

XhTextFieldRoot.xhEvents = ['value-change'] as const

export interface XhTextFieldLabelProps extends ComponentPropsWithRef<'label'> {}
/** 必须是原生 label，connect 把 for 写向 input。 */
export function XhTextFieldLabel({ children, ...rest }: XhTextFieldLabelProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhTextFieldControlProps extends ComponentPropsWithRef<'div'> {}
/** 视觉盒：输入框与清空按钮都放进来，皮肤把描边、底色、聚焦环画在它身上。 */
export function XhTextFieldControl({ children, ...rest }: XhTextFieldControlProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTextFieldInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {
  /** 输入框渲染成哪个标签，默认 input；写 textarea 即多行宿主，接上 autoSize 自动高度。 */
  as?: TextFieldInputHost
}

export function XhTextFieldInput({ as = 'input', ...rest }: XhTextFieldInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = useTextFieldContext()
  const el = useRef<HTMLTextAreaElement | null>(null)

  // 程序化写值（setValue / 表单重置 / 受控回写）不触发 input 事件，量高在渲染后补一次
  const value = ctx.api.value
  const autoSize = ctx.api.autoSize
  useEffect(() => {
    if (as === 'textarea' && el.current)
      autoSizeTextarea(el.current, autoSize)
  }, [as, value, autoSize])

  const props = mergeReactProps(
    fieldLabel({
      ...ctx.api.getInputProps({ as }) as Record<string, unknown>,
      ...fieldWiring,
    }),
    rest as Record<string, unknown>,
    {
      ref: (node: HTMLElement | null) => {
        el.current = as === 'textarea' ? node as HTMLTextAreaElement : null
      },
    },
  )

  // 自己渲染宿主节点，label 的 for 指向它
  return as === 'textarea'
    ? <textarea {...props as ComponentPropsWithRef<'textarea'>} />
    : <input {...props as ComponentPropsWithRef<'input'>} />
}

export interface XhTextFieldPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhTextFieldPrefix({ children, ...rest }: XhTextFieldPrefixProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <span {...mergeReactProps(ctx.api.getPrefixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTextFieldSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhTextFieldSuffix({ children, ...rest }: XhTextFieldSuffixProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <span {...mergeReactProps(ctx.api.getSuffixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTextFieldClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTextFieldClearTrigger({ children, ...rest }: XhTextFieldClearTriggerProps): ReactNode {
  const ctx = useTextFieldContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhTextFieldCountProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  children?: SlotChildren<TextFieldCountSlotProps>
}

/** 字数：不写内容时渲 `已用 / 上限`，没设上限就只渲已用。 */
export function XhTextFieldCount({ children, ...rest }: XhTextFieldCountProps): ReactNode {
  const ctx = useTextFieldContext()
  const api = ctx.api
  const fallback = api.maxLength === undefined ? `${api.count}` : `${api.count} / ${api.maxLength}`
  const body = children == null
    ? fallback
    : renderSlot(children, { count: api.count, maxLength: api.maxLength, atLimit: api.atLimit })
  return (
    <span {...mergeReactProps(api.getCountProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {body}
    </span>
  )
}
