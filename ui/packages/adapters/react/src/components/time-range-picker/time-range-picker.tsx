/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  TimeGranularity,
  TimeHourCycle,
  TimeRangePickerApi,
  TimePickerColumn,
  TimePickerColumnUnit,
  TimeRangePickerEndIndex,
  TimeRangePickerPreset,
  TimeRangePickerPresetState,
  TimeRangePickerSchema,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { resolveTimeRangePickerEndIndex } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  TimeRangePickerColumnProvider,
  TimeRangePickerEndProvider,
  TimeRangePickerProvider,
  useTimeRangePickerColumnContext,
  useTimeRangePickerContext,
  useTimeRangePickerEndContext,
} from './context'
import { useTimeRangePicker } from './use-time-range-picker'

type TimeRangePickerProps = TimeRangePickerSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：浮层开合与两端、值状态标志、当前的段与两组时列，以及开合、写值、清空的动作。 */
export type TimeRangePickerRootSlotProps = Pick<
  TimeRangePickerApi,
  | 'open'
  | 'value'
  | 'start'
  | 'end'
  | 'empty'
  | 'outOfRange'
  | 'reversed'
  | 'segments'
  | 'columnGroups'
  | 'canClear'
  | 'setOpen'
  | 'setValue'
  | 'clear'
>

/** 时列外壳函数式 children 的载荷：该端当前应排列的列。 */
export interface TimeRangePickerColumnGroupSlotProps {
  columns: readonly TimePickerColumn[]
}

/** 列函数式 children 的载荷：该列当前的可选值。 */
export interface TimeRangePickerColumnSlotProps {
  options: TimePickerColumn['options']
}

/** 快捷选项列函数式 children 的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface TimeRangePickerPresetsSlotProps {
  presets: readonly TimeRangePickerPresetState[]
}

export interface XhTimeRangePickerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 区间两端 [start, end]；空缺的一端用空串占位。 */
  value?: string[]
  defaultValue?: string[]
  open?: boolean
  defaultOpen?: boolean
  min?: string
  max?: string
  locale?: string
  hourCycle?: TimeHourCycle
  granularity?: TimeGranularity
  step?: number
  /** 快捷选项；提供后浮层中多出一列，时刻要在调用方计算后再传入。 */
  presets?: TimeRangePickerPreset[]
  disabled?: boolean
  /** 两组段位与时列各自的读屏名字。 */
  translations?: TimeRangePickerProps['translations']
  isTimeUnavailable?: (value: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex) => boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  name?: string
  /** 终点隐藏输入的表单名；未提供时终点不参与提交。 */
  endName?: string
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  placement?: Placement
  offset?: number
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  onValueChange?: TimeRangePickerProps['onValueChange']
  onOpenChange?: TimeRangePickerProps['onOpenChange']
  children?: SlotChildren<TimeRangePickerRootSlotProps>
}

export function XhTimeRangePickerRoot({
  value,
  defaultValue,
  open,
  defaultOpen,
  min,
  max,
  locale,
  hourCycle,
  granularity,
  step,
  presets,
  disabled,
  translations,
  isTimeUnavailable,
  readOnly,
  invalid,
  required,
  name,
  endName,
  variant,
  tone,
  size,
  placement,
  offset,
  dir,
  onValueChange,
  onOpenChange,
  children,
  ...rest
}: XhTimeRangePickerRootProps): ReactNode {
  const ctx = useTimeRangePicker(withXhConfig('time-range-picker', useFormControlProps({
    value,
    defaultValue,
    open,
    defaultOpen,
    min,
    max,
    locale,
    hourCycle,
    granularity,
    step,
    presets,
    disabled,
    translations,
    isTimeUnavailable,
    readOnly,
    invalid,
    required,
    name,
    endName,
    variant,
    tone,
    size,
    placement,
    offset,
    dir,
    onValueChange,
    onOpenChange,
  })) as TimeRangePickerProps)
  const api = ctx.api
  return (
    <TimeRangePickerProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {children == null
          ? null
          : renderSlot(children, {
              open: api.open,
              value: api.value,
              start: api.start,
              end: api.end,
              empty: api.empty,
              outOfRange: api.outOfRange,
              reversed: api.reversed,
              segments: api.segments,
              columnGroups: api.columnGroups,
              canClear: api.canClear,
              setOpen: api.setOpen,
              setValue: api.setValue,
              clear: api.clear,
            })}
      </div>
    </TimeRangePickerProvider>
  )
}

XhTimeRangePickerRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhTimeRangePickerLabelProps extends ComponentPropsWithRef<'label'> {}
/** 仍使用原生 label 保持表单语义，点击标题聚焦第一段由连接层的 click 接管。 */
export function XhTimeRangePickerLabel({ children, ...rest }: XhTimeRangePickerLabelProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  return <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</label>
}

export interface XhTimeRangePickerControlProps extends ComponentPropsWithRef<'div'> {}
export function XhTimeRangePickerControl({ children, ...rest }: XhTimeRangePickerControlProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getControlProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.controlRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhTimeRangePickerSegmentGroupProps extends ComponentPropsWithRef<'div'> {
  /** 端号：0 起点、1 终点，兼收字符串。 */
  index?: number | string
}
/** 一端的段位容器，组内的段位据此认领起止。 */
export function XhTimeRangePickerSegmentGroup({ index = 0, children, ...rest }: XhTimeRangePickerSegmentGroupProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const end: TimeRangePickerEndIndex = resolveTimeRangePickerEndIndex(index)
  return (
    <TimeRangePickerEndProvider value={end}>
      <div {...mergeReactProps(ctx.api.getSegmentGroupProps({ index: end }) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </TimeRangePickerEndProvider>
  )
}

export interface XhTimeRangePickerSegmentProps extends ComponentPropsWithRef<'span'> {
  /** 段的身份由作者声明；属于哪一端跟随所在的段位容器。 */
  segment: TimeSegmentType
}
/** 有内容时使用内容，否则显示该段的文字，空段为占位串。 */
export function XhTimeRangePickerSegment({ segment, children, ...rest }: XhTimeRangePickerSegmentProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const index = useTimeRangePickerEndContext()
  const api = ctx.api
  // 段位的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getSegmentProps({ index, segment }) as Record<string, unknown>, ['onFocus'])
  return (
    <span {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children ?? api.getSegmentText({ index, segment })}
    </span>
  )
}

export interface XhTimeRangePickerRangeSeparatorProps extends ComponentPropsWithRef<'span'> {}
export function XhTimeRangePickerRangeSeparator({ children, ...rest }: XhTimeRangePickerRangeSeparatorProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getRangeSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? '-'}
    </span>
  )
}

export interface XhTimeRangePickerTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTimeRangePickerTrigger({ children, ...rest }: XhTimeRangePickerTriggerProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  return (
    <button
      {...mergeReactProps(
        fieldLabel({ ...fieldWiring, ...ctx.api.getTriggerProps() as Record<string, unknown> }),
        rest as Record<string, unknown>,
        // 归还焦点要落到它身上：锚点取的是整个输入行，那一层不可聚焦
        { ref: (el: HTMLButtonElement | null) => { ctx.triggerRef.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhTimeRangePickerClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTimeRangePickerClearTrigger({ children, ...rest }: XhTimeRangePickerClearTriggerProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTimeRangePickerPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhTimeRangePickerPositioner({ children, container, ...rest }: XhTimeRangePickerPositionerProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.controlRef}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
      </div>
    </XhPortal>
  )
}

export interface XhTimeRangePickerContentProps extends ComponentPropsWithRef<'div'> {}
export function XhTimeRangePickerContent({ children, ...rest }: XhTimeRangePickerContentProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhTimeRangePickerPresetGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
  children?: SlotChildren<TimeRangePickerPresetsSlotProps>
}
export function XhTimeRangePickerPresetGroup({ children, ...rest }: XhTimeRangePickerPresetGroupProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const api = ctx.api
  const authored = children == null ? null : renderSlot(children, { presets: api.presets })
  return (
    <div {...mergeReactProps(api.getPresetGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(authored)
        ? authored
        : api.presets.map(preset => (
            <div key={preset.value} {...api.getPresetProps({ value: preset.value }) as Record<string, unknown>}>
              {preset.label}
            </div>
          ))}
    </div>
  )
}

export interface XhTimeRangePickerPresetProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
  value: string
}
/** 有内容时使用内容，否则使用数据中的 label。 */
export function XhTimeRangePickerPreset({ value, children, ...rest }: XhTimeRangePickerPresetProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getPresetProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : api.presets.find(p => p.value === value)?.label}
    </div>
  )
}

export interface XhTimeRangePickerColumnGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 端号：0 起点、1 终点，兼收字符串。 */
  index?: number | string
  children?: SlotChildren<TimeRangePickerColumnGroupSlotProps>
}
/** 一端的时列外壳，组内的小标题、列与选项据此认领起止。 */
export function XhTimeRangePickerColumnGroup({ index = 0, children, ...rest }: XhTimeRangePickerColumnGroupProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const api = ctx.api
  const end: TimeRangePickerEndIndex = resolveTimeRangePickerEndIndex(index)
  return (
    <TimeRangePickerEndProvider value={end}>
      <div {...mergeReactProps(api.getColumnGroupProps({ index: end }) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children == null ? null : renderSlot(children, { columns: api.columnGroups[end].columns })}
      </div>
    </TimeRangePickerEndProvider>
  )
}

export interface XhTimeRangePickerColumnGroupLabelProps extends ComponentPropsWithRef<'div'> {}
export function XhTimeRangePickerColumnGroupLabel({ children, ...rest }: XhTimeRangePickerColumnGroupLabelProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const index = useTimeRangePickerEndContext()
  return <div {...mergeReactProps(ctx.api.getColumnGroupLabelProps({ index }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTimeRangePickerColumnProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  unit: TimePickerColumnUnit
  children?: SlotChildren<TimeRangePickerColumnSlotProps>
}
export function XhTimeRangePickerColumn({ unit, children, ...rest }: XhTimeRangePickerColumnProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const index = useTimeRangePickerEndContext()
  const api = ctx.api
  return (
    // 下传单位，供列内选项取到自己归哪一列
    <TimeRangePickerColumnProvider value={unit}>
      <div {...mergeReactProps(api.getColumnProps({ index, unit }) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children == null
          ? null
          : renderSlot(children, { options: api.columnGroups[index].columns.find(c => c.unit === unit)?.options ?? [] })}
      </div>
    </TimeRangePickerColumnProvider>
  )
}

export interface XhTimeRangePickerItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 两位补零的显示串（'09' / '30'）；上下午列写 '00' / '01'。 */
  value: string
}
/** 有内容时使用内容，否则显示该格应显示的文字（上下午列按 locale 译为「上午 / 下午」）。 */
export function XhTimeRangePickerItem({ value, children, ...rest }: XhTimeRangePickerItemProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const index = useTimeRangePickerEndContext()
  const unit = useTimeRangePickerColumnContext()
  const api = ctx.api
  // 选项的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getItemProps({ index, unit, value }) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children ?? api.getItemText({ unit, value })}
    </div>
  )
}

export interface XhTimeRangePickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {
  /** 写在段位容器外面时用它指明属于哪一端；写在容器内时不必提供，跟随容器。 */
  index?: number | string
}
export function XhTimeRangePickerHiddenInput({ index, ...rest }: XhTimeRangePickerHiddenInputProps): ReactNode {
  const ctx = useTimeRangePickerContext()
  const group = useTimeRangePickerEndContext()
  const at: TimeRangePickerEndIndex = index === undefined ? group : resolveTimeRangePickerEndIndex(index)
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps({ index: at }) as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
