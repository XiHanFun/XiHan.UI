import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { PasswordInputApi, PasswordInputSchema, PasswordInputTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { PasswordInputProvider, usePasswordInputContext } from './context'
import { usePasswordInput } from './use-password-input'

type PasswordInputProps = PasswordInputSchema['props']

/** 函数式 children 的载荷：当前值与空标志、明暗与大写锁定，以及写值与翻明暗的动作。 */
export type PasswordInputRootSlotProps = Pick<
  PasswordInputApi,
  'value' | 'empty' | 'visible' | 'capsLock' | 'inputType' | 'setValue' | 'setVisible' | 'toggleVisibility'
>

export interface XhPasswordInputRootProps {
  value?: string
  defaultValue?: string
  visible?: boolean
  defaultVisible?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；给了才参与提交。 */
  name?: string
  placeholder?: string
  autoComplete?: string
  /** 强度档位 0–4，由调用方打分后传进来；不给时强度条收起。 */
  strength?: number
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<PasswordInputTranslations>
  onValueChange?: PasswordInputProps['onValueChange']
  onVisibilityChange?: PasswordInputProps['onVisibilityChange']
  children?: SlotChildren<PasswordInputRootSlotProps>
}

export function XhPasswordInputRoot({ children, ...props }: XhPasswordInputRootProps): ReactNode {
  const ctx = usePasswordInput(withXhConfig('password-input', props) as PasswordInputProps)
  const api = ctx.api
  return (
    <PasswordInputProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {renderSlot(children, {
          value: api.value,
          empty: api.empty,
          visible: api.visible,
          capsLock: api.capsLock,
          inputType: api.inputType,
          setValue: api.setValue,
          setVisible: api.setVisible,
          toggleVisibility: api.toggleVisibility,
        })}
      </div>
    </PasswordInputProvider>
  )
}

XhPasswordInputRoot.xhEvents = ['value-change', 'visibility-change'] as const

export interface XhPasswordInputLabelProps extends ComponentPropsWithRef<'label'> {}
/** 必须是原生 label，connect 把 for 写向 input。 */
export function XhPasswordInputLabel({ children, ...rest }: XhPasswordInputLabelProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhPasswordInputControlProps extends ComponentPropsWithRef<'div'> {}
/** 视觉盒：输入框、切换钮与大写锁定提示都排在它里面。 */
export function XhPasswordInputControl({ children, ...rest }: XhPasswordInputControlProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPasswordInputInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 原生 input：光标、选区与撤销都归浏览器，label 的 for 也指着它。 */
export function XhPasswordInputInput({ ...rest }: XhPasswordInputInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = usePasswordInputContext()
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

export interface XhPasswordInputVisibilityTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 原生 button，Enter / Space 的激活交给平台。 */
export function XhPasswordInputVisibilityTrigger({ children, ...rest }: XhPasswordInputVisibilityTriggerProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <button {...mergeReactProps(ctx.api.getVisibilityTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhPasswordInputCapsLockIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {}
/** 区内文字由组件写：活区域播报的是内容，不是名字。关着时是空串，节点仍在场。 */
export function XhPasswordInputCapsLockIndicator({ ...rest }: XhPasswordInputCapsLockIndicatorProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <span {...mergeReactProps(ctx.api.getCapsLockIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {ctx.api.capsLockMessage}
    </span>
  )
}

export interface XhPasswordInputStrengthMeterProps extends ComponentPropsWithRef<'div'> {}
/** 强度条：档位由调用方打分后经 strength 传进来，没给就收起。 */
export function XhPasswordInputStrengthMeter({ children, ...rest }: XhPasswordInputStrengthMeterProps): ReactNode {
  const ctx = usePasswordInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getStrengthMeterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
