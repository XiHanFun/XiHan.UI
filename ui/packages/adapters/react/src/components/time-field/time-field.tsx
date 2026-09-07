import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TimeFieldApi, TimeFieldSchema, TimeGranularity, TimeHourCycle, TimeSegmentType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { TimeFieldProvider, useTimeFieldContext } from './context'
import { useTimeField } from './use-time-field'

type TimeFieldProps = TimeFieldSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：当前值、值状态标志、参与显示的段与写值方法。 */
export type TimeFieldRootSlotProps = Pick<
  TimeFieldApi,
  'value' | 'empty' | 'outOfRange' | 'canClear' | 'segments' | 'focusedSegment' | 'hourCycle' | 'granularity' | 'setValue' | 'clear'
>

export interface XhTimeFieldRootProps {
  value?: string
  defaultValue?: string
  min?: string
  max?: string
  locale?: string
  hourCycle?: TimeHourCycle
  granularity?: TimeGranularity
  disabled?: boolean
  translations?: TimeFieldProps['translations']
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  name?: string
  placeholder?: string
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: TimeFieldProps['onValueChange']
  children?: SlotChildren<TimeFieldRootSlotProps>
}

export function XhTimeFieldRoot({ children, ...props }: XhTimeFieldRootProps): ReactNode {
  const ctx = useTimeField(withXhConfig('time-field', props) as TimeFieldProps)
  const api = ctx.api
  return (
    <TimeFieldProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {children == null
          ? null
          : renderSlot(children, {
              value: api.value,
              empty: api.empty,
              outOfRange: api.outOfRange,
              canClear: api.canClear,
              segments: api.segments,
              focusedSegment: api.focusedSegment,
              hourCycle: api.hourCycle,
              granularity: api.granularity,
              setValue: api.setValue,
              clear: api.clear,
            })}
      </div>
    </TimeFieldProvider>
  )
}

XhTimeFieldRoot.xhEvents = ['value-change'] as const

export interface XhTimeFieldLabelProps extends ComponentPropsWithRef<'label'> {}
/** 仍用原生 label 保持表单语义，点标题聚焦第一段由连接层的 click 接管。 */
export function XhTimeFieldLabel({ children, ...rest }: XhTimeFieldLabelProps): ReactNode {
  const ctx = useTimeFieldContext()
  return <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</label>
}

export interface XhTimeFieldControlProps extends ComponentPropsWithRef<'div'> {}
export function XhTimeFieldControl({ children, ...rest }: XhTimeFieldControlProps): ReactNode {
  const ctx = useTimeFieldContext()
  return <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTimeFieldSegmentGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhTimeFieldSegmentGroup({ children, ...rest }: XhTimeFieldSegmentGroupProps): ReactNode {
  const ctx = useTimeFieldContext()
  return <div {...mergeReactProps(ctx.api.getSegmentGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTimeFieldSegmentProps extends ComponentPropsWithRef<'span'> {
  /** 段的身份由作者声明。 */
  segment: TimeSegmentType
}
/** 有内容用内容，否则显示该段的文字，空段为占位串。 */
export function XhTimeFieldSegment({ segment, children, ...rest }: XhTimeFieldSegmentProps): ReactNode {
  const ctx = useTimeFieldContext()
  const api = ctx.api
  // 段位的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getSegmentProps({ segment }) as Record<string, unknown>, ['onFocus'])
  return (
    <span {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children ?? api.getSegmentText({ segment })}
    </span>
  )
}

export interface XhTimeFieldClearTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 没写内容时由皮肤画兜底字形。 */
export function XhTimeFieldClearTrigger({ children, ...rest }: XhTimeFieldClearTriggerProps): ReactNode {
  const ctx = useTimeFieldContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTimeFieldHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhTimeFieldHiddenInput({ ...rest }: XhTimeFieldHiddenInputProps): ReactNode {
  const ctx = useTimeFieldContext()
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
