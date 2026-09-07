import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ClipboardApi, ClipboardSchema, ClipboardTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { ClipboardProvider, useClipboardContext } from './context'
import { useClipboard } from './use-clipboard'

type ClipboardProps = ClipboardSchema['props']

/** 函数式 children 的载荷：复制状态、当前要复制的文本，以及走一次复制的句柄。 */
export interface ClipboardRootSlotProps extends Pick<ClipboardApi, 'status' | 'copied' | 'value' | 'copy'> {}

export interface XhClipboardRootProps {
  /** 属性缺席即没给要复制的文本，落回空串。 */
  value?: string
  timeout?: number
  disabled?: boolean
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  translations?: Partial<ClipboardTranslations>
  onStatusChange?: ClipboardProps['onStatusChange']
  onCopyError?: ClipboardProps['onCopyError']
  children?: SlotChildren<ClipboardRootSlotProps>
}

export function XhClipboardRoot({ children, ...props }: XhClipboardRootProps): ReactNode {
  const ctx = useClipboard(withXhConfig('clipboard', props) as ClipboardProps)
  return (
    <ClipboardProvider value={ctx}>
      <div {...ctx.api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          status: ctx.api.status,
          copied: ctx.api.copied,
          value: ctx.api.value,
          copy: ctx.api.copy,
        })}
      </div>
    </ClipboardProvider>
  )
}

XhClipboardRoot.xhEvents = ['status-change', 'copy-error'] as const

export interface XhClipboardLabelProps extends ComponentPropsWithRef<'label'> {}
export function XhClipboardLabel({ children, ...rest }: XhClipboardLabelProps): ReactNode {
  const ctx = useClipboardContext()
  // 必须是原生 <label>，connect 把 for 写向 input
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhClipboardControlProps extends ComponentPropsWithRef<'div'> {}
export function XhClipboardControl({ children, ...rest }: XhClipboardControlProps): ReactNode {
  const ctx = useClipboardContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhClipboardInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'children'> {}
/** 自闭合的输入格，内容由 value 给，不收内容。 */
export function XhClipboardInput({ ...rest }: XhClipboardInputProps): ReactNode {
  const ctx = useClipboardContext()
  // 聚焦即全选挂的是 focus，它不冒泡：留在 React 的合成事件上收到的是冒泡的 focusin，
  // 直接派到框上的 focus 到不了处理器
  const bind = useNativeEvents(ctx.api.getInputProps() as Record<string, unknown>, ['onFocus'])
  return (
    <input
      {...mergeReactProps(
        bind.attrs,
        // 文本攥在机器里。React 要求带 value 的输入交出一个 onChange，否则在开发构建里逐帧告警
        { onChange: noop, ref: bind.ref },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhClipboardCopyTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhClipboardCopyTrigger({ children, ...rest }: XhClipboardCopyTriggerProps): ReactNode {
  const ctx = useClipboardContext()
  // 原生 <button>，激活行为交给平台
  return (
    <button {...mergeReactProps(ctx.api.getCopyTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhClipboardStatusProps extends ComponentPropsWithRef<'span'> {}
/** 复制成功的播报区：读屏念得到，屏幕上不占位。不给内容时念 announcement。 */
export function XhClipboardStatus({ children, ...rest }: XhClipboardStatusProps): ReactNode {
  const ctx = useClipboardContext()
  return (
    <span {...mergeReactProps(ctx.api.getStatusProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.announcement}
    </span>
  )
}

export interface XhClipboardIndicatorProps extends ComponentPropsWithRef<'span'> {
  /** 这个标记属于哪一侧：true = 复制成功后的对钩，false（默认）= 平时的复制图标。 */
  copied?: boolean
}
/** 节点常挂，靠 hidden 显隐。 */
export function XhClipboardIndicator({ copied = false, children, ...rest }: XhClipboardIndicatorProps): ReactNode {
  const ctx = useClipboardContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getIndicatorProps({ copied }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

function noop(): void {}
