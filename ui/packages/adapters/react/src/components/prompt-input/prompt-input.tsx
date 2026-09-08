import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { PromptInputApi, PromptInputSchema, PromptInputSubmitKey, PromptInputTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { PromptInputProvider, usePromptInputContext } from './context'
import { usePromptInput } from './use-prompt-input'

type Props = PromptInputSchema['props']

/** 函数式 children 的载荷：草稿文本与四个状态，以及改写、提交、停止三个动作。 */
export type PromptInputRootSlotProps = Pick<
  PromptInputApi,
  'value' | 'isComposing' | 'canSubmit' | 'loading' | 'disabled' | 'setValue' | 'submit' | 'stop'
>

/** 根上自有的那些取值；defaultValue 与 onSubmit 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'onSubmit'>

export interface XhPromptInputRootProps extends RootElementProps {
  /** 给定即受控。 */
  value?: string
  defaultValue?: string
  disabled?: boolean
  /** 生成中：提交钮原位翻成停止。 */
  loading?: boolean
  /** 哪个键提交：enter / mod-enter / none。 */
  submitKey?: PromptInputSubmitKey
  /** 空草稿也许提交。 */
  allowEmptySubmit?: boolean
  /** 提交之后清空草稿。 */
  clearOnSubmit?: boolean
  /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。 */
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<PromptInputTranslations>
  onValueChange?: Props['onValueChange']
  onSubmit?: Props['onSubmit']
  onStop?: Props['onStop']
  children?: SlotChildren<PromptInputRootSlotProps>
}

export function XhPromptInputRoot({
  value,
  defaultValue,
  disabled,
  loading,
  submitKey,
  allowEmptySubmit,
  clearOnSubmit,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onSubmit,
  onStop,
  children,
  ...rest
}: XhPromptInputRootProps): ReactNode {
  const ctx = usePromptInput(withXhConfig('prompt-input', {
    value,
    defaultValue,
    disabled,
    loading,
    submitKey,
    allowEmptySubmit,
    clearOnSubmit,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onSubmit,
    onStop,
  }) as Props)
  const { api } = ctx
  return (
    <PromptInputProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          value: api.value,
          isComposing: api.isComposing,
          canSubmit: api.canSubmit,
          loading: api.loading,
          disabled: api.disabled,
          setValue: api.setValue,
          submit: api.submit,
          stop: api.stop,
        })}
      </div>
    </PromptInputProvider>
  )
}

XhPromptInputRoot.xhEvents = ['value-change', 'submit', 'stop'] as const

export interface XhPromptInputControlProps extends ComponentPropsWithRef<'div'> {}
/** 渲了这一层，输入框与按钮并排收在它里面，root 翻成竖排。 */
export function XhPromptInputControl({ children, ...rest }: XhPromptInputControlProps): ReactNode {
  const ctx = usePromptInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPromptInputInputProps extends Omit<ComponentPropsWithRef<'textarea'>, 'value' | 'defaultValue' | 'children'> {}
/** 渲染原生 textarea，换行与撤销栈交给浏览器；自动长高是皮肤的两行 CSS。 */
export function XhPromptInputInput({ ...rest }: XhPromptInputInputProps): ReactNode {
  const ctx = usePromptInputContext()
  return (
    <textarea
      {...mergeReactProps(
        ctx.api.getInputProps() as Record<string, unknown>,
        // 草稿攥在机器里，写回走连接层的 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警；真正的写回不经它
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhPromptInputSubmitTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 生成期间原位切换为停止，只改 data-mode 与 aria-label。 */
export function XhPromptInputSubmitTrigger({ children, ...rest }: XhPromptInputSubmitTriggerProps): ReactNode {
  const ctx = usePromptInputContext()
  return (
    <button {...mergeReactProps(ctx.api.getSubmitTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

function noop(): void {}
