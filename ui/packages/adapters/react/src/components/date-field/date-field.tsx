import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { DateFieldApi, DateFieldSchema, DateFieldSegmentState, DateFieldTranslations, DateGranularity, DateSegmentSet, DateSegmentType } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { DateFieldProvider, useDateFieldContext } from './context'
import { useDateField } from './use-date-field'

type DateFieldProps = DateFieldSchema['props']
type SegmentTexts = { readonly [K in DateSegmentType]?: string }

function noop(): void {}

/** 函数式 children 的载荷：整份值、逐段投影、填写状态，以及改写与清空的句柄。 */
export type DateFieldRootSlotProps = Pick<
  DateFieldApi,
  | 'value'
  | 'valueAsDate'
  | 'segments'
  | 'complete'
  | 'empty'
  | 'outOfRange'
  | 'focusedSegment'
  | 'setValue'
  | 'clear'
  | 'canClear'
>

/** 段位函数式 children 的载荷：本段的投影；下标越界时缺席。 */
export interface DateFieldSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

export interface XhDateFieldRootProps {
  value?: string | null
  defaultValue?: string | null
  min?: string
  max?: string
  locale?: string
  timeZone?: string
  granularity?: DateGranularity
  /** 段集：给了就以它为准，granularity 让路。段位节点仍按下标认段，段集是有序的。 */
  segments?: DateSegmentSet
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  name?: string
  placeholder?: SegmentTexts
  translations?: DateFieldTranslations
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: DateFieldProps['onValueChange']
  children?: SlotChildren<DateFieldRootSlotProps>
}

export function XhDateFieldRoot({ children, ...props }: XhDateFieldRootProps): ReactNode {
  const ctx = useDateField(withXhConfig('date-field', props) as DateFieldProps)
  const api = ctx.api
  return (
    <DateFieldProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {children == null
          ? null
          : renderSlot(children, {
              value: api.value,
              valueAsDate: api.valueAsDate,
              segments: api.segments,
              complete: api.complete,
              empty: api.empty,
              outOfRange: api.outOfRange,
              focusedSegment: api.focusedSegment,
              setValue: api.setValue,
              clear: api.clear,
              canClear: api.canClear,
            })}
      </div>
    </DateFieldProvider>
  )
}

XhDateFieldRoot.xhEvents = ['value-change'] as const

export interface XhDateFieldLabelProps extends ComponentPropsWithRef<'span'> {}
/** 渲染为 span 而非 label，段位不是可被 for 标注的控件；点标题聚焦由连接层接管。 */
export function XhDateFieldLabel({ children, ...rest }: XhDateFieldLabelProps): ReactNode {
  const ctx = useDateFieldContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhDateFieldControlProps extends ComponentPropsWithRef<'div'> {}
export function XhDateFieldControl({ children, ...rest }: XhDateFieldControlProps): ReactNode {
  const ctx = useDateFieldContext()
  return <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDateFieldSegmentGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhDateFieldSegmentGroup({ children, ...rest }: XhDateFieldSegmentGroupProps): ReactNode {
  const ctx = useDateFieldContext()
  return <div {...mergeReactProps(ctx.api.getSegmentGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDateFieldSegmentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 下标由作者声明，是哪一段由 locale 与段集算出；兼收字符串。 */
  index?: number | string
  /** 按段名声明这一格。段集里没有这一块时它收起；与 index 二选一，两个都写按段名算。 */
  segment?: DateSegmentType
  children?: SlotChildren<DateFieldSegmentSlotProps>
}
/** 有内容用内容，否则渲染连接层算好的段位文本。 */
export function XhDateFieldSegment({ index, segment, children, ...rest }: XhDateFieldSegmentProps): ReactNode {
  const ctx = useDateFieldContext()
  const api = ctx.api
  // 落点由连接层算：按下标还是按段名是同一条路，适配器这边不重写一份
  const declared = segment != null ? { segment } : { index: Math.trunc(Number(index)) }
  const state = api.segmentOf(declared)
  // 段位的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getSegmentProps(declared) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children == null ? state?.text : renderSlot(children, { segment: state })}
    </div>
  )
}

export interface XhDateFieldClearTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 没写内容时由皮肤画兜底字形。 */
export function XhDateFieldClearTrigger({ children, ...rest }: XhDateFieldClearTriggerProps): ReactNode {
  const ctx = useDateFieldContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhDateFieldHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhDateFieldHiddenInput({ ...rest }: XhDateFieldHiddenInputProps): ReactNode {
  const ctx = useDateFieldContext()
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
