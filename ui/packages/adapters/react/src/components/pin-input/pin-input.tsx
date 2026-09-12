import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { PinInputApi, PinInputSchema, PinInputTranslations, PinInputType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useFormControlProps } from '../form/use-form-control'
import { PinInputProvider, usePinInputContext } from './context'
import { usePinInput } from './use-pin-input'

type PinInputProps = PinInputSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：逐格的值与拼好的串、填满与否、格数与焦点所在格，与改值、清空的命令。 */
export type PinInputRootSlotProps = Pick<
  PinInputApi,
  'value' | 'valueAsString' | 'complete' | 'length' | 'focusedIndex' | 'setValue' | 'clear'
>

/** 根上自有的那些取值；defaultValue 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'>

export interface XhPinInputRootProps extends RootElementProps {
  value?: string[]
  defaultValue?: string[]
  length?: number
  type?: PinInputType
  pattern?: string
  /** 遮蔽走原生 password，读屏与密码管理器才认得。 */
  mask?: boolean
  /** 一次性验证码：把 autocomplete 打成 one-time-code，系统短信才填得进来。 */
  otp?: boolean
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 填满即撤走焦点。 */
  blurOnComplete?: boolean
  /** 表单字段名；给了隐藏输入才带 name 并参与提交。 */
  name?: string
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<PinInputTranslations>
  onValueChange?: PinInputProps['onValueChange']
  onValueComplete?: PinInputProps['onValueComplete']
  children?: SlotChildren<PinInputRootSlotProps>
}

export function XhPinInputRoot({
  value,
  defaultValue,
  length,
  type,
  pattern,
  mask,
  otp,
  placeholder,
  disabled,
  readOnly,
  required,
  invalid,
  blurOnComplete,
  name,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onValueComplete,
  children,
  ...rest
}: XhPinInputRootProps): ReactNode {
  const machineProps = {
    value,
    defaultValue,
    length,
    type,
    pattern,
    mask,
    otp,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    blurOnComplete,
    name,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onValueComplete,
  }
  const ctx = usePinInput(withXhConfig('pin-input', useFormControlProps(machineProps)) as PinInputProps)
  const api = ctx.api
  return (
    <PinInputProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, {
          value: api.value,
          valueAsString: api.valueAsString,
          complete: api.complete,
          length: api.length,
          focusedIndex: api.focusedIndex,
          setValue: api.setValue,
          clear: api.clear,
        })}
      </div>
    </PinInputProvider>
  )
}

XhPinInputRoot.xhEvents = ['value-change', 'value-complete'] as const

export interface XhPinInputLabelProps extends ComponentPropsWithRef<'label'> {}
/** 必须是原生 label，getLabelProps 的 for 恒写向首格。 */
export function XhPinInputLabel({ children, ...rest }: XhPinInputLabelProps): ReactNode {
  const ctx = usePinInputContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhPinInputGroupProps extends ComponentPropsWithRef<'div'> {}
/** 分段：连着的几格圈成一段（123-456 这种分段写法）。 */
export function XhPinInputGroup({ children, ...rest }: XhPinInputGroupProps): ReactNode {
  const ctx = usePinInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPinInputSeparatorProps extends ComponentPropsWithRef<'span'> {}
/** 段与段之间的分隔；对读屏隐藏。 */
export function XhPinInputSeparator({ children, ...rest }: XhPinInputSeparatorProps): ReactNode {
  const ctx = usePinInputContext()
  return (
    <span {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhPinInputInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {
  /** 下标由作者声明；兼收字符串，与另外两家读的是同一份声明。 */
  index: number | string
}

/**
 * 一格。connect 挂的 onFocus 是不冒泡的 DOM focus，改装成原生监听器，
 * 与另外两家同一条到达路径。
 */
export function XhPinInputInput({ index, ...rest }: XhPinInputInputProps): ReactNode {
  const ctx = usePinInputContext()
  const bind = useNativeEvents(
    ctx.api.getInputProps({ index: Math.trunc(Number(index)) }) as Record<string, unknown>,
    ['onFocus'],
  )
  return <input {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)} />
}

export interface XhPinInputHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 整份验证码的表单出口。 */
export function XhPinInputHiddenInput({ ...rest }: XhPinInputHiddenInputProps): ReactNode {
  const ctx = usePinInputContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
