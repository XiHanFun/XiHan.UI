import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { SliderApi, SliderMark, SliderMarkMeta, SliderSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { Fragment } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { SliderProvider, SliderThumbProvider, useSliderContext, useSliderThumbContext } from './context'
import { useSlider } from './use-slider'

type SliderProps = SliderSchema['props']

function noop(): void {}

/** 把作者写的下标收成数字；不是数字就当第一个。 */
function toIndex(raw: number | string): number {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

/** 函数式 children 的载荷：当前值、逐个滑块的状态、已选区间与拖动标记，以及整份改值与单个滑块改值。 */
export type SliderRootSlotProps = Pick<
  SliderApi,
  'value' | 'thumbs' | 'range' | 'dragging' | 'setValue' | 'setThumbValue'
>

/** 刻度函数式 children 的载荷：这一档刻度的呈现数据。 */
export interface SliderTickSlotProps {
  tick: SliderMarkMeta
}

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children'>

export interface XhSliderRootProps extends RootElementProps {
  /** 受控值；值恒是数组，单滑块即长度 1。给定即受控。 */
  value?: number[]
  /** 非受控初值。 */
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  /** PageUp / PageDown 的步长，默认 10 倍 step。 */
  largeStep?: number
  /** 相邻滑块至少隔几格，默认 0。 */
  minStepsBetweenThumbs?: number
  /** 刻度表：轨道上的圆点与文案，点文案即跳值。 */
  marks?: SliderMark[]
  /** 只认刻度落点：拖动、点按与键盘都吸到最近的刻度。 */
  snapToMarks?: boolean
  orientation?: Orientation
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  tone?: Tone
  size?: Size
  /** 表单字段名；多滑块时逐个 append。 */
  name?: string
  /** 把值翻成人话，产出写进拇指的 aria-valuetext。 */
  getValueText?: SliderProps['getValueText']
  /** 每次推动都发；拖动过程中会连续发很多次。 */
  onValueChange?: SliderProps['onValueChange']
  /** 只在一次操作结束时发一次，适合拿来发请求。 */
  onValueChangeEnd?: SliderProps['onValueChangeEnd']
  children?: SlotChildren<SliderRootSlotProps>
}

export function XhSliderRoot({
  value,
  defaultValue,
  min,
  max,
  step,
  largeStep,
  minStepsBetweenThumbs,
  marks,
  snapToMarks,
  orientation,
  dir,
  disabled,
  readOnly,
  invalid,
  tone,
  size,
  name,
  getValueText,
  onValueChange,
  onValueChangeEnd,
  children,
  ...rest
}: XhSliderRootProps): ReactNode {
  const ctx = useSlider({
    value,
    defaultValue,
    min,
    max,
    step,
    largeStep,
    minStepsBetweenThumbs,
    marks,
    snapToMarks,
    orientation,
    dir,
    disabled,
    readOnly,
    invalid,
    tone,
    size,
    name,
    getValueText,
    onValueChange,
    onValueChangeEnd,
  })
  const api = ctx.api

  return (
    <SliderProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          value: api.value,
          thumbs: api.thumbs,
          range: api.range,
          dragging: api.dragging,
          setValue: api.setValue,
          setThumbValue: api.setThumbValue,
        })}
      </div>
    </SliderProvider>
  )
}

XhSliderRoot.xhEvents = ['value-change', 'value-change-end'] as const

export interface XhSliderLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhSliderLabel({ children, ...rest }: XhSliderLabelProps): ReactNode {
  const ctx = useSliderContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhSliderControlProps extends ComponentPropsWithRef<'div'> {}

/** 按下即跳的那一层：拇指常浮出轨道，指针接在这里才抓得住它。 */
export function XhSliderControl({ children, ...rest }: XhSliderControlProps): ReactNode {
  const ctx = useSliderContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhSliderTrackProps extends ComponentPropsWithRef<'div'> {}

/** 轨道节点交给机器，矩形在指针事件里现量。 */
export function XhSliderTrack({ children, ...rest }: XhSliderTrackProps): ReactNode {
  const ctx = useSliderContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getTrackProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
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
    <div {...mergeReactProps(ctx.api.getRangeProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhSliderTickGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 逐档刻度的文案接管口；不给就填刻度自带的 label。 */
  tick?: SlotChildren<SliderTickSlotProps>
}

/** 刻度整组自动铺：圆点 + 文案（点文案跳值）。 */
export function XhSliderTickGroup({ tick, ...rest }: XhSliderTickGroupProps): ReactNode {
  const ctx = useSliderContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getTickGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.marks.map(mark => (
        <Fragment key={mark.value}>
          <span {...api.getTickProps({ value: mark.value }) as Record<string, unknown>} />
          <span {...api.getTickLabelProps({ value: mark.value }) as Record<string, unknown>}>
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
  const at = toIndex(index)
  // 拇指上的 onFocus 是不冒泡的 DOM focus，React 的同名合成事件挂的是冒泡的 focusin：
  // 后代得焦会被算成拇指自己得焦，活动下标于是指错人。装成原生监听器，到达路径才与另外两家一致
  const bind = useNativeEvents(ctx.api.getThumbProps(at) as Record<string, unknown>, ['onFocus'])
  return (
    <SliderThumbProvider value={at}>
      <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
        {children}
      </div>
    </SliderThumbProvider>
  )
}

export interface XhSliderValueTextProps extends ComponentPropsWithRef<'span'> {}

/** 值气泡：写在拇指里，没给内容就填这一个拇指的值文本。 */
export function XhSliderValueText({ children, ...rest }: XhSliderValueTextProps): ReactNode {
  const ctx = useSliderContext()
  const index = useSliderThumbContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getValueTextProps(index) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children ?? ctx.api.valueText(index)}
    </span>
  )
}

export interface XhSliderHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}

/** 表单出口：值随这份原生输入提交，多滑块时逐个同名 append。 */
export function XhSliderHiddenInput({ ...rest }: XhSliderHiddenInputProps): ReactNode {
  const ctx = useSliderContext()
  const index = useSliderThumbContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps(index) as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
