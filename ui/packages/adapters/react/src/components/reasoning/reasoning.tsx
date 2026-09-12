import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ReasoningApi, ReasoningProps, ReasoningTranslations, ToolCallSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ReasoningProvider, useReasoningContext } from './context'
import { useReasoning } from './use-reasoning'

type MachineProps = ToolCallSchema['props']

/** 函数式 children 的载荷：开合、还在不在想、想了多久，以及当前该显示哪句状态文案。 */
export type ReasoningRootSlotProps = Pick<ReasoningApi, 'open' | 'streaming' | 'disabled' | 'durationMs' | 'statusText' | 'setOpen'>

export interface XhReasoningRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 还在思考。折成机器的「在跑」。 */
  streaming?: boolean
  /** 开始思考的时刻，毫秒时间戳。 */
  startTime?: number
  /** 思考结束的时刻，可能缺席。 */
  endTime?: number
  /** 给定即受控。 */
  open?: boolean
  defaultOpen?: boolean
  /** 想起来自动展开、想完自动收起，用户动过手就锁住。 */
  autoDisclosure?: boolean
  disabled?: boolean
  /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。 */
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<ReasoningTranslations>
  onOpenChange?: MachineProps['onOpenChange']
  children?: SlotChildren<ReasoningRootSlotProps>
}

export function XhReasoningRoot({
  streaming,
  startTime,
  endTime,
  open,
  defaultOpen,
  autoDisclosure,
  disabled,
  variant,
  tone,
  size,
  translations,
  onOpenChange,
  children,
  ...rest
}: XhReasoningRootProps): ReactNode {
  const configured = withXhConfig('reasoning', {
    streaming,
    startTime,
    endTime,
    open,
    defaultOpen,
    autoDisclosure,
    disabled,
    variant,
    tone,
    size,
    translations,
    onOpenChange,
  }) as XhReasoningRootProps
  const ctx = useReasoning(
    {
      // 还在写就是还在跑，自动开合据此走
      running: configured.streaming,
      open: configured.open,
      defaultOpen: configured.defaultOpen,
      autoDisclosure: configured.autoDisclosure,
      disabled: configured.disabled,
      onOpenChange: configured.onOpenChange,
    },
    {
      streaming: configured.streaming,
      startTime: configured.startTime,
      endTime: configured.endTime,
      variant: configured.variant,
      tone: configured.tone,
      size: configured.size,
      translations: configured.translations,
    } as ReasoningProps,
  )
  const { api } = ctx
  return (
    <ReasoningProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          open: api.open,
          streaming: api.streaming,
          disabled: api.disabled,
          durationMs: api.durationMs,
          statusText: api.statusText,
          setOpen: api.setOpen,
        })}
      </div>
    </ReasoningProvider>
  )
}

XhReasoningRoot.xhEvents = ['open-change'] as const

export interface XhReasoningTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhReasoningTrigger({ children, ...rest }: XhReasoningTriggerProps): ReactNode {
  const ctx = useReasoningContext()
  return <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhReasoningIconProps extends ComponentPropsWithRef<'span'> {}
/** 状态图形位：跟着在不在想换色，对读屏隐藏。 */
export function XhReasoningIcon({ children, ...rest }: XhReasoningIconProps): ReactNode {
  const ctx = useReasoningContext()
  return <span {...mergeReactProps(ctx.api.getIconProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhReasoningIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhReasoningIndicator({ children, ...rest }: XhReasoningIndicatorProps): ReactNode {
  const ctx = useReasoningContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhReasoningLabelProps extends ComponentPropsWithRef<'span'> {}
/** 不给内容时显示当前状态那一句。 */
export function XhReasoningLabel({ children, ...rest }: XhReasoningLabelProps): ReactNode {
  const ctx = useReasoningContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.statusText}
    </span>
  )
}

export interface XhReasoningDurationProps extends ComponentPropsWithRef<'span'> {}
export function XhReasoningDuration({ children, ...rest }: XhReasoningDurationProps): ReactNode {
  const ctx = useReasoningContext()
  return <span {...mergeReactProps(ctx.api.getDurationProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhReasoningContentProps extends ComponentPropsWithRef<'div'> {}
export function XhReasoningContent({ children, ...rest }: XhReasoningContentProps): ReactNode {
  const ctx = useReasoningContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}
