/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  TimeGranularity,
  TimeHourCycle,
  TimePickerApi,
  TimePickerColumn,
  TimePickerColumnUnit,
  TimePickerPreset,
  TimePickerPresetState,
  TimePickerSchema,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { TimePickerColumnProvider, TimePickerProvider, useTimePickerColumnContext, useTimePickerContext } from './context'
import { useTimePicker } from './use-time-picker'

type TimePickerProps = TimePickerSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：浮层开合与当前值、值状态标志、当前的段与列，以及开合、写值、清空的动作。 */
export type TimePickerRootSlotProps = Pick<
  TimePickerApi,
  | 'open'
  | 'value'
  | 'empty'
  | 'outOfRange'
  | 'segments'
  | 'columns'
  | 'canClear'
  | 'setOpen'
  | 'setValue'
  | 'clear'
>

/** 列函数式 children 的载荷：该列当前的可选值。 */
export interface TimePickerColumnSlotProps {
  options: TimePickerColumn['options']
}

/** 快捷选项列函数式 children 的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface TimePickerPresetsSlotProps {
  presets: readonly TimePickerPresetState[]
}

export interface XhTimePickerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  value?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  min?: string
  max?: string
  locale?: string
  hourCycle?: TimeHourCycle
  granularity?: TimeGranularity
  step?: number
  /** 快捷选项；提供后浮层中多出一列，时刻要在调用方计算后再传入。 */
  presets?: TimePickerPreset[]
  disabled?: boolean
  translations?: TimePickerProps['translations']
  isTimeUnavailable?: (value: string, unit: TimePickerColumnUnit) => boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  name?: string
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  placement?: Placement
  offset?: number
  /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
  dir?: Direction
  onValueChange?: TimePickerProps['onValueChange']
  onOpenChange?: TimePickerProps['onOpenChange']
  children?: SlotChildren<TimePickerRootSlotProps>
}

export function XhTimePickerRoot({
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
}: XhTimePickerRootProps): ReactNode {
  const ctx = useTimePicker(withXhConfig('time-picker', useFormControlProps({
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
    variant,
    tone,
    size,
    placement,
    offset,
    dir,
    onValueChange,
    onOpenChange,
  })) as TimePickerProps)
  const api = ctx.api
  return (
    <TimePickerProvider value={ctx}>
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
              empty: api.empty,
              outOfRange: api.outOfRange,
              segments: api.segments,
              columns: api.columns,
              canClear: api.canClear,
              setOpen: api.setOpen,
              setValue: api.setValue,
              clear: api.clear,
            })}
      </div>
    </TimePickerProvider>
  )
}

XhTimePickerRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhTimePickerLabelProps extends ComponentPropsWithRef<'label'> {}
/** 仍使用原生 label 保持表单语义，点击标题聚焦第一段由连接层的 click 接管。 */
export function XhTimePickerLabel({ children, ...rest }: XhTimePickerLabelProps): ReactNode {
  const ctx = useTimePickerContext()
  return <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</label>
}

export interface XhTimePickerControlProps extends ComponentPropsWithRef<'div'> {}
export function XhTimePickerControl({ children, ...rest }: XhTimePickerControlProps): ReactNode {
  const ctx = useTimePickerContext()
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

export interface XhTimePickerSegmentGroupProps extends ComponentPropsWithRef<'div'> {}
export function XhTimePickerSegmentGroup({ children, ...rest }: XhTimePickerSegmentGroupProps): ReactNode {
  const ctx = useTimePickerContext()
  return <div {...mergeReactProps(ctx.api.getSegmentGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTimePickerSegmentProps extends ComponentPropsWithRef<'span'> {
  /** 段的身份由作者声明。 */
  segment: TimeSegmentType
}
/** 有内容时使用内容，否则显示该段的文字，空段为占位串。 */
export function XhTimePickerSegment({ segment, children, ...rest }: XhTimePickerSegmentProps): ReactNode {
  const ctx = useTimePickerContext()
  const api = ctx.api
  // 段位的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getSegmentProps({ segment }) as Record<string, unknown>, ['onFocus'])
  return (
    <span {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children ?? api.getSegmentText({ segment })}
    </span>
  )
}

export interface XhTimePickerTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTimePickerTrigger({ children, ...rest }: XhTimePickerTriggerProps): ReactNode {
  const ctx = useTimePickerContext()
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

export interface XhTimePickerClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTimePickerClearTrigger({ children, ...rest }: XhTimePickerClearTriggerProps): ReactNode {
  const ctx = useTimePickerContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTimePickerPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhTimePickerPositioner({ children, container, ...rest }: XhTimePickerPositionerProps): ReactNode {
  const ctx = useTimePickerContext()
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

export interface XhTimePickerContentProps extends ComponentPropsWithRef<'div'> {}
export function XhTimePickerContent({ children, ...rest }: XhTimePickerContentProps): ReactNode {
  const ctx = useTimePickerContext()
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

export interface XhTimePickerPresetGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
  children?: SlotChildren<TimePickerPresetsSlotProps>
}
export function XhTimePickerPresetGroup({ children, ...rest }: XhTimePickerPresetGroupProps): ReactNode {
  const ctx = useTimePickerContext()
  const api = ctx.api
  const presetGroupRef = useRef<HTMLDivElement | null>(null)
  // 快捷选项列定高自己竖滚：条子贴在它的盒子上、紧跟在它后面（浮层 4px 档）
  const bars = useScrollbars({
    scrollable: () => presetGroupRef.current,
    anchor: 'layer',
    props: () => ({ dir: (api.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
  })
  useEffect(() => bars.measure())
  const authored = children == null ? null : renderSlot(children, { presets: api.presets })
  return (
    <>
      <div {...mergeReactProps(api.getPresetGroupProps() as Record<string, unknown>, rest as Record<string, unknown>, { ref: presetGroupRef })}>
        {slotPaints(authored)
          ? authored
          : api.presets.map(preset => (
              <div key={preset.value} {...api.getPresetProps({ value: preset.value }) as Record<string, unknown>}>
                {preset.label}
              </div>
            ))}
      </div>
      {bars.render()}
    </>
  )
}

export interface XhTimePickerPresetProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
  value: string
}
/** 有内容时使用内容，否则使用数据中的 label。 */
export function XhTimePickerPreset({ value, children, ...rest }: XhTimePickerPresetProps): ReactNode {
  const ctx = useTimePickerContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getPresetProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : api.presets.find(p => p.value === value)?.label}
    </div>
  )
}

export interface XhTimePickerColumnProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  unit: TimePickerColumnUnit
  children?: SlotChildren<TimePickerColumnSlotProps>
}
export function XhTimePickerColumn({ unit, children, ...rest }: XhTimePickerColumnProps): ReactNode {
  const ctx = useTimePickerContext()
  const api = ctx.api
  const columnRef = useRef<HTMLDivElement | null>(null)
  // 定高的时间列自己竖滚：条子贴在本列的盒子上、紧跟在它后面（浮层 4px 档）
  const bars = useScrollbars({
    scrollable: () => columnRef.current,
    anchor: 'layer',
    props: () => ({ dir: (api.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
  })
  useEffect(() => bars.measure())
  return (
    // 下传单位，供列内选项取到自己归哪一列
    <TimePickerColumnProvider value={unit}>
      <div {...mergeReactProps(api.getColumnProps({ unit }) as Record<string, unknown>, rest as Record<string, unknown>, { ref: columnRef })}>
        {children == null
          ? null
          : renderSlot(children, { options: api.columns.find(c => c.unit === unit)?.options ?? [] })}
      </div>
      {bars.render()}
    </TimePickerColumnProvider>
  )
}

export interface XhTimePickerItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 两位补零的显示串（'09' / '30'）；上下午列写 '00' / '01'。 */
  value: string
}
/** 有内容时使用内容，否则显示该格应显示的文字（上下午列按 locale 译为「上午 / 下午」）。 */
export function XhTimePickerItem({ value, children, ...rest }: XhTimePickerItemProps): ReactNode {
  const ctx = useTimePickerContext()
  const unit = useTimePickerColumnContext()
  const api = ctx.api
  // 选项的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(api.getItemProps({ unit, value }) as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children ?? api.getItemText({ unit, value })}
    </div>
  )
}

export interface XhTimePickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhTimePickerHiddenInput({ ...rest }: XhTimePickerHiddenInputProps): ReactNode {
  const ctx = useTimePickerContext()
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
