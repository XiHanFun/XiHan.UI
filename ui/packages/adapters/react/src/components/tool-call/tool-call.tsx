import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ToolCallApi, ToolCallPhase, ToolCallProps, ToolCallSchema, ToolCallTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { isToolCallRunning } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ToolCallProvider, useToolCallContext } from './context'
import { useToolCall } from './use-tool-call'

type MachineProps = ToolCallSchema['props']

/** 函数式 children 的载荷：开合、阶段与在不在跑，一句可播报的状态文本，以及跑了多久。 */
export type ToolCallRootSlotProps = Pick<ToolCallApi, 'open' | 'phase' | 'running' | 'disabled' | 'statusText' | 'durationMs' | 'setOpen'>

export interface XhToolCallRootProps {
  /** 这次调用走到哪一步，默认 input-available。 */
  phase?: ToolCallPhase
  /** 这次调用开始的时刻，毫秒时间戳。 */
  startTime?: number
  /** 这次调用结束的时刻，可能缺席。 */
  endTime?: number
  /** 给定即受控。 */
  open?: boolean
  defaultOpen?: boolean
  /** 跑起来自动展开、跑完自动收起，用户动过手就锁住。 */
  autoDisclosure?: boolean
  disabled?: boolean
  /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。 */
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<ToolCallTranslations>
  onOpenChange?: MachineProps['onOpenChange']
  children?: SlotChildren<ToolCallRootSlotProps>
}

export function XhToolCallRoot({ children, ...props }: XhToolCallRootProps): ReactNode {
  const configured = withXhConfig('tool-call', props) as XhToolCallRootProps
  const ctx = useToolCall(
    {
      // 作者只写 phase，跑不跑由纯函数折出来交给机器
      running: isToolCallRunning(configured.phase ?? 'input-available'),
      open: configured.open,
      defaultOpen: configured.defaultOpen,
      autoDisclosure: configured.autoDisclosure,
      disabled: configured.disabled,
      onOpenChange: configured.onOpenChange,
    },
    {
      phase: configured.phase,
      startTime: configured.startTime,
      endTime: configured.endTime,
      variant: configured.variant,
      tone: configured.tone,
      size: configured.size,
      translations: configured.translations,
    } as ToolCallProps,
  )
  const { api } = ctx
  return (
    <ToolCallProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          open: api.open,
          phase: api.phase,
          running: api.running,
          disabled: api.disabled,
          statusText: api.statusText,
          durationMs: api.durationMs,
          setOpen: api.setOpen,
        })}
      </div>
    </ToolCallProvider>
  )
}

XhToolCallRoot.xhEvents = ['open-change'] as const

export interface XhToolCallTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhToolCallTrigger({ children, ...rest }: XhToolCallTriggerProps): ReactNode {
  const ctx = useToolCallContext()
  return <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhToolCallIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhToolCallIndicator({ children, ...rest }: XhToolCallIndicatorProps): ReactNode {
  const ctx = useToolCallContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhToolCallLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhToolCallLabel({ children, ...rest }: XhToolCallLabelProps): ReactNode {
  const ctx = useToolCallContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhToolCallSummaryProps extends ComponentPropsWithRef<'span'> {}
/** 一行参数摘要，收起时也看得见这次查的是什么。 */
export function XhToolCallSummary({ children, ...rest }: XhToolCallSummaryProps): ReactNode {
  const ctx = useToolCallContext()
  return <span {...mergeReactProps(ctx.api.getSummaryProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhToolCallStatusProps extends ComponentPropsWithRef<'span'> {}
/** 不给内容时念阶段对应的那一句。 */
export function XhToolCallStatus({ children, ...rest }: XhToolCallStatusProps): ReactNode {
  const ctx = useToolCallContext()
  return (
    <span {...mergeReactProps(ctx.api.getStatusProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.statusText}
    </span>
  )
}

export interface XhToolCallDurationProps extends ComponentPropsWithRef<'span'> {}
/** 时长文案由作者现场代入：模板串里的秒数是宿主的事，连接层不做插值。 */
export function XhToolCallDuration({ children, ...rest }: XhToolCallDurationProps): ReactNode {
  const ctx = useToolCallContext()
  return <span {...mergeReactProps(ctx.api.getDurationProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhToolCallApprovalProps extends ComponentPropsWithRef<'div'> {}
/** 常驻在开关与详情之间：审批闸门不该被折叠藏起来。 */
export function XhToolCallApproval({ children, ...rest }: XhToolCallApprovalProps): ReactNode {
  const ctx = useToolCallContext()
  return <div {...mergeReactProps(ctx.api.getApprovalProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhToolCallContentProps extends ComponentPropsWithRef<'div'> {}
export function XhToolCallContent({ children, ...rest }: XhToolCallContentProps): ReactNode {
  const ctx = useToolCallContext()
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

export interface XhToolCallInputProps extends ComponentPropsWithRef<'div'> {}
export function XhToolCallInput({ children, ...rest }: XhToolCallInputProps): ReactNode {
  const ctx = useToolCallContext()
  return <div {...mergeReactProps(ctx.api.getInputProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhToolCallOutputProps extends ComponentPropsWithRef<'div'> {}
export function XhToolCallOutput({ children, ...rest }: XhToolCallOutputProps): ReactNode {
  const ctx = useToolCallContext()
  return <div {...mergeReactProps(ctx.api.getOutputProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhToolCallErrorProps extends ComponentPropsWithRef<'div'> {}
/** 流被中止时未拿到结果的调用会被收尾成出错但拿不到原因，这一格要容忍空内容。 */
export function XhToolCallError({ children, ...rest }: XhToolCallErrorProps): ReactNode {
  const ctx = useToolCallContext()
  return <div {...mergeReactProps(ctx.api.getErrorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
