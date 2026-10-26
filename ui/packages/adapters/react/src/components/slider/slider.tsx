/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 slider 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { SliderApi, SliderMark, SliderMarkMeta, SliderSchema, StructureChild } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { normalizeItemIndex } from '@xihan-ui/core'
import { sliderStructure } from '@xihan-ui/headless'
import { Fragment, useEffect } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { SliderProvider, SliderThumbProvider, useSliderContext, useSliderThumbContext } from './context'
import { useSlider } from './use-slider'

type SliderProps = SliderSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：当前值、逐个滑块的状态、已选区间与拖动标记，以及整份改值与单个滑块改值。 */
export type SliderRootSlotProps = Pick<
  SliderApi,
  'value' | 'thumbs' | 'range' | 'dragging' | 'setValue' | 'setThumbValue'
>

/** 刻度函数式 children 的载荷：该档刻度的呈现数据。 */
export interface SliderTickSlotProps {
  tick: SliderMarkMeta
}

/** 根上自有的取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children'>

export interface XhSliderRootProps extends RootElementProps {
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  /** 受控值；值恒为数组，单滑块即长度 1。给定即受控。 */
  value?: number[]
  /** 非受控初值。 */
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  /** PageUp / PageDown 的步长，默认 10 倍 step。 */
  largeStep?: number
  /** 相邻滑块至少间隔几格，默认 0。 */
  minStepsBetweenThumbs?: number
  /** 刻度表：轨道上的圆点与文案，点击文案即跳转到该值。 */
  marks?: SliderMark[]
  /** 只接受刻度落点：拖动、点按与键盘都吸附到最近的刻度。 */
  snapToMarks?: boolean
  /** 反向：min 落在轨道末端，方向键跟随屏幕方向。 */
  inverted?: boolean
  /** 多拇指时按住两端之间的轨道整段平移。 */
  draggableRange?: boolean
  /** 画出已选区间，默认 true。 */
  trackFill?: boolean
  orientation?: Orientation
  /** 文字方向，默认 ltr。 */
  dir?: Direction
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  /** 必填：根与标题带 data-required；拇指是 role=slider，不收 aria-required。 */
  required?: boolean
  tone?: Tone
  size?: Size
  /** 表单字段名；多滑块时逐个 append。 */
  name?: string
  /** 把值转换为可读文本，产出写入拇指的 aria-valuetext。 */
  getValueText?: SliderProps['getValueText']
  /** 每次推动都触发；拖动过程中会连续触发多次。 */
  onValueChange?: SliderProps['onValueChange']
  /** 只在一次操作结束时触发一次，适合用于发起请求。 */
  onValueChangeEnd?: SliderProps['onValueChangeEnd']
  children?: SlotChildren<SliderRootSlotProps>
}

export function XhSliderRoot({
  label,
  ariaLabel,
  value,
  defaultValue,
  min,
  max,
  step,
  largeStep,
  minStepsBetweenThumbs,
  marks,
  snapToMarks,
  inverted,
  draggableRange,
  trackFill,
  orientation,
  dir,
  disabled,
  readOnly,
  invalid,
  required,
  tone,
  size,
  name,
  getValueText,
  onValueChange,
  onValueChangeEnd,
  children,
  ...rest
}: XhSliderRootProps): ReactNode {
  const ctx = useSlider(useFormControlProps({
    ariaLabel,
    value,
    defaultValue,
    min,
    max,
    step,
    largeStep,
    minStepsBetweenThumbs,
    marks,
    snapToMarks,
    inverted,
    draggableRange,
    trackFill,
    orientation,
    dir,
    disabled,
    readOnly,
    invalid,
    required,
    tone,
    size,
    name,
    getValueText,
    onValueChange,
    onValueChangeEnd,
  }))
  const api = ctx.api

  return (
    <SliderProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps(),
          rest,
          { ref: ctx.rootRef },
        )}
      >
        {children != null
          ? renderSlot(children, {
              value: api.value,
              thumbs: api.thumbs,
              range: api.range,
              dragging: api.dragging,
              setValue: api.setValue,
              setThumbValue: api.setThumbValue,
            })
          : renderDefaultStructure(api, label, name !== undefined)}
      </div>
    </SliderProvider>
  )
}

XhSliderRoot.xhEvents = ['value-change', 'value-change-end'] as const

export interface XhSliderLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhSliderLabel({ children, ...rest }: XhSliderLabelProps): ReactNode {
  const ctx = useSliderContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
      {children}
    </label>
  )
}

export interface XhSliderControlProps extends ComponentPropsWithRef<'div'> {}

/** 按下即跳转的层：拇指常浮出轨道，指针接在这里才能抓住它。 */
export function XhSliderControl({ children, ...rest }: XhSliderControlProps): ReactNode {
  const ctx = useSliderContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhSliderTrackProps extends ComponentPropsWithRef<'div'> {}

/** 轨道节点交给状态机，矩形在指针事件中现测。 */
export function XhSliderTrack({ children, ...rest }: XhSliderTrackProps): ReactNode {
  const ctx = useSliderContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getTrackProps(),
        rest,
        { ref: ctx.trackRef },
      )}
    >
      {children}
    </div>
  )
}

export interface XhSliderRangeProps extends ComponentPropsWithRef<'div'> {}

export function XhSliderRange({ children, ...rest }: XhSliderRangeProps): ReactNode {
  const ctx = useSliderContext()
  return (
    <div {...mergeReactProps(ctx.api.getRangeProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhSliderTickGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 逐档刻度的文案接管口；未提供时填入刻度自带的 label。 */
  tick?: SlotChildren<SliderTickSlotProps>
}

/** 刻度整组自动铺设：圆点 + 文案（点击文案跳转）。 */
export function XhSliderTickGroup({ tick, ...rest }: XhSliderTickGroupProps): ReactNode {
  const ctx = useSliderContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getTickGroupProps(), rest)}>
      {api.marks.map(mark => (
        <Fragment key={mark.value}>
          <span {...api.getTickProps({ value: mark.value })} />
          <span {...api.getTickLabelProps({ value: mark.value })}>
            {tick == null ? mark.label : renderSlot(tick, { tick: mark })}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

export interface XhSliderThumbProps extends ComponentPropsWithRef<'div'> {
  /** 第几个滑块，多滑块时必须逐个写明；兼收字符串。 */
  index?: number | string
}

export function XhSliderThumb({ index = 0, children, ...rest }: XhSliderThumbProps): ReactNode {
  const ctx = useSliderContext()
  const at = normalizeItemIndex(index)
  // 拇指上的 onFocus 是不冒泡的 DOM focus，React 的同名合成事件挂的是冒泡的 focusin：
  // 后代得焦会被算成拇指自己得焦，活动下标于是指错人。装成原生监听器，到达路径才与另外两家一致
  // 放进表单字段时，字段的标题与说明接到拇指上：焦点落在拇指，读屏在这里念名字与说明
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const bind = useNativeEvents(fieldLabel({ ...fieldWiring, ...ctx.api.getThumbProps(at) }), ['onFocus'])
  return (
    <SliderThumbProvider value={at}>
      <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest)}>
        {children}
      </div>
    </SliderThumbProvider>
  )
}

export interface XhSliderValueTextProps extends ComponentPropsWithRef<'span'> {}

/** 值气泡：写在拇指中，未提供内容时填入该拇指的值文本。 */
export function XhSliderValueText({ children, ...rest }: XhSliderValueTextProps): ReactNode {
  const ctx = useSliderContext()
  const index = useSliderThumbContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getValueTextProps(index),
        rest,
      )}
    >
      {children ?? ctx.api.valueText(index)}
    </span>
  )
}

export interface XhSliderHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}

/** 表单出口：值随该原生输入提交，多滑块时逐个同名 append。 */
export function XhSliderHiddenInput({ ...rest }: XhSliderHiddenInputProps): ReactNode {
  const ctx = useSliderContext()
  const index = useSliderThumbContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps(index),
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest,
      )}
    />
  )
}

/** 标准结构里各部件对应的组件；刻度的圆点与文案由 XhSliderTickGroup 自己铺。 */
const SLIDER_PARTS = {
  'label': XhSliderLabel,
  'control': XhSliderControl,
  'track': XhSliderTrack,
  'range': XhSliderRange,
  'tick-group': XhSliderTickGroup,
  'thumb': XhSliderThumb,
  'hidden-input': XhSliderHiddenInput,
}

/** 刻度组自己按 marks 铺圆点与文案，铺结构时去掉这两格。 */
function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.flatMap((node): StructureChild[] => {
    if (!('part' in node))
      return [node]
    if (node.part === 'tick' || node.part === 'tick-label')
      return []
    return [node.children ? { ...node, children: withoutSelfAssembled(node.children) } : node]
  })
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 sliderStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件。
 */
function renderDefaultStructure(api: SliderApi, label: ReactNode, hiddenInput: boolean): ReactNode[] {
  const slotted = label != null && typeof label !== 'string'
  const nodes = sliderStructure(api, { label: typeof label === 'string' ? label : undefined, hiddenInput, slotted: name => name === 'label' && slotted })
  return renderStructure(withoutSelfAssembled(nodes), SLIDER_PARTS, node => (node.slot ? label : undefined))
}
