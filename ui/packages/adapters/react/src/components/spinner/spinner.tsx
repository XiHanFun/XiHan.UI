import type { Size, Tone } from '@xihan-ui/core'
import type { SpinnerProps, SpinnerTranslations, SpinnerVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { SpinnerProvider, useSpinnerContext } from './context'
import { useSpinner } from './use-spinner'

export interface XhSpinnerProps extends ComponentPropsWithRef<'span'> {
  /** 这一处的可及名字，写在 root 上。 */
  label?: string
  size?: Size
  /** 形态：ring / arc / dots。 */
  variant?: SpinnerVariant
  tone?: Tone
  translations?: Partial<SpinnerTranslations>
}

/** 转圈图形由皮肤画在 root 的伪元素上，这里不生成任何子节点。 */
export function XhSpinner({
  label,
  size,
  variant,
  tone,
  translations,
  children,
  ...rest
}: XhSpinnerProps): ReactNode {
  const ctx = useSpinner(withXhConfig('spinner', { label, size, variant, tone, translations }) as SpinnerProps)
  return (
    <SpinnerProvider value={ctx}>
      <span {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </span>
    </SpinnerProvider>
  )
}

export interface XhSpinnerLabelProps extends ComponentPropsWithRef<'span'> {}

/** 可见文案节点。作者不写内容时显示解析后的 label，屏幕上看到的与读屏念的因此是同一段字。 */
export function XhSpinnerLabel({ children, ...rest }: XhSpinnerLabelProps): ReactNode {
  const ctx = useSpinnerContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.label}
    </span>
  )
}
