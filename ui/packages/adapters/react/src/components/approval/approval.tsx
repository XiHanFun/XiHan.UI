import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ApprovalApi, ApprovalSchema, ApprovalScope, ApprovalStatus, ApprovalTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ApprovalProvider, useApprovalContext } from './context'
import { useApproval } from './use-approval'

type Props = ApprovalSchema['props']

/** 函数式 children 的载荷：判定状态、能不能批，以及三个动作入口。 */
export type ApprovalRootSlotProps = Pick<
  ApprovalApi,
  'status' | 'settled' | 'loading' | 'grantedScopes' | 'note' | 'canApprove' | 'announcement' | 'approve' | 'deny' | 'setGrantedScopes' | 'setNote'
>

/** 逐项 children 的载荷。 */
export interface ApprovalScopeSlotProps {
  scope: ApprovalScope
  granted: boolean
}

export interface XhApprovalRootProps {
  /** 这一轮请求的身份。变了即重入待决，并按新时长重起计时。 */
  requestId?: string
  /** 给定即受控。 */
  status?: ApprovalStatus
  defaultStatus?: ApprovalStatus
  /** 多久没人答就按拒绝收口；缺省不给默认值。 */
  timeoutMs?: number
  scopes?: readonly ApprovalScope[]
  grantedScopes?: readonly string[]
  defaultGrantedScopes?: readonly string[]
  /** 附在判定上的一句自由文本，给定即受控。 */
  note?: string
  defaultNote?: string
  /** 判定在途：只挡重复批准，不挡拒绝。 */
  loading?: boolean
  /** Escape 判为拒绝，默认开。 */
  denyOnEscape?: boolean
  /** 卸载时若仍待决就按拒绝派发一次，默认关。 */
  denyOnUnmount?: boolean
  /** 播报档位，默认 polite。 */
  live?: 'polite' | 'assertive'
  /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。 */
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<ApprovalTranslations>
  onDecision?: Props['onDecision']
  onGrantedScopesChange?: Props['onGrantedScopesChange']
  onNoteChange?: Props['onNoteChange']
  children?: SlotChildren<ApprovalRootSlotProps>
}

export function XhApprovalRoot({ children, ...props }: XhApprovalRootProps): ReactNode {
  const ctx = useApproval(withXhConfig('approval', props) as Props)
  const { api } = ctx
  return (
    <ApprovalProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          status: api.status,
          settled: api.settled,
          loading: api.loading,
          grantedScopes: api.grantedScopes,
          note: api.note,
          canApprove: api.canApprove,
          announcement: api.announcement,
          approve: api.approve,
          deny: api.deny,
          setGrantedScopes: api.setGrantedScopes,
          setNote: api.setNote,
        })}
      </div>
    </ApprovalProvider>
  )
}

XhApprovalRoot.xhEvents = ['decision', 'granted-scopes-change', 'note-change'] as const

export interface XhApprovalTitleProps extends ComponentPropsWithRef<'h3'> {}
export function XhApprovalTitle({ children, ...rest }: XhApprovalTitleProps): ReactNode {
  const ctx = useApprovalContext()
  return <h3 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</h3>
}

export interface XhApprovalDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhApprovalDescription({ children, ...rest }: XhApprovalDescriptionProps): ReactNode {
  const ctx = useApprovalContext()
  return <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhApprovalLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/** 不给内容时念状态对应的那一句。 */
export function XhApprovalLiveRegion({ children, ...rest }: XhApprovalLiveRegionProps): ReactNode {
  const ctx = useApprovalContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.announcement}
    </div>
  )
}

export interface XhApprovalGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhApprovalGroup({ children, ...rest }: XhApprovalGroupProps): ReactNode {
  const ctx = useApprovalContext()
  return <div {...mergeReactProps(ctx.api.getGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhApprovalItemProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 这一项授权范围的取值。 */
  scopeValue: string
  scopeLabel?: string
  /** 必选项：没勾满就批不了。 */
  scopeRequired?: boolean
  scopeDisabled?: boolean
  children?: SlotChildren<ApprovalScopeSlotProps>
}
export function XhApprovalItem({
  scopeValue,
  scopeLabel,
  scopeRequired,
  scopeDisabled,
  children,
  ...rest
}: XhApprovalItemProps): ReactNode {
  const ctx = useApprovalContext()
  const scope = useMemo<ApprovalScope>(
    () => ({ value: scopeValue, label: scopeLabel, required: scopeRequired, disabled: scopeDisabled }),
    [scopeValue, scopeLabel, scopeRequired, scopeDisabled],
  )
  return (
    <div {...mergeReactProps(ctx.api.getItemProps(scope) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {renderSlot(children, { scope, granted: ctx.api.isScopeGranted(scopeValue) })}
    </div>
  )
}

export interface XhApprovalItemIndicatorProps extends ComponentPropsWithRef<'span'> {
  scopeValue: string
}
export function XhApprovalItemIndicator({ scopeValue, children, ...rest }: XhApprovalItemIndicatorProps): ReactNode {
  const ctx = useApprovalContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getItemIndicatorProps({ value: scopeValue }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhApprovalItemTextProps extends ComponentPropsWithRef<'span'> {
  scopeValue: string
}
/** 排在勾选项之内，文本自然构成它的可及名。 */
export function XhApprovalItemText({ scopeValue, children, ...rest }: XhApprovalItemTextProps): ReactNode {
  const ctx = useApprovalContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getItemTextProps({ value: scopeValue }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhApprovalNoteProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'children'> {}
/** 自闭合的输入格，内容由 value 给，不收内容。 */
export function XhApprovalNote({ ...rest }: XhApprovalNoteProps): ReactNode {
  const ctx = useApprovalContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getNoteProps() as Record<string, unknown>,
        // 备注攥在机器里，写回走连接层的 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警；真正的写回不经它
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhApprovalTimerProps extends ComponentPropsWithRef<'div'> {}
/** 对读屏隐藏：逐秒变化的数字进活区会不停打断。 */
export function XhApprovalTimer({ children, ...rest }: XhApprovalTimerProps): ReactNode {
  const ctx = useApprovalContext()
  return <div {...mergeReactProps(ctx.api.getTimerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhApprovalResultProps extends ComponentPropsWithRef<'div'> {}
/** 判定落定后才露出；文字由播报区念，这一格对读屏隐藏。 */
export function XhApprovalResult({ children, ...rest }: XhApprovalResultProps): ReactNode {
  const ctx = useApprovalContext()
  return <div {...mergeReactProps(ctx.api.getResultProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhApprovalFooterProps extends ComponentPropsWithRef<'div'> {}
export function XhApprovalFooter({ children, ...rest }: XhApprovalFooterProps): ReactNode {
  const ctx = useApprovalContext()
  return <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhApprovalApproveTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhApprovalApproveTrigger({ children, ...rest }: XhApprovalApproveTriggerProps): ReactNode {
  const ctx = useApprovalContext()
  return (
    <button {...mergeReactProps(ctx.api.getApproveTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhApprovalDenyTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhApprovalDenyTrigger({ children, ...rest }: XhApprovalDenyTriggerProps): ReactNode {
  const ctx = useApprovalContext()
  return (
    <button {...mergeReactProps(ctx.api.getDenyTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

function noop(): void {}
