import type { Direction, Placement, Size } from '@xihan-ui/core'
import type {
  ColorPickerApi,
  ColorPickerChannel,
  ColorPickerFormat,
  ColorPickerInputChannel,
  ColorPickerSchema,
  ColorPickerTranslations,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { colorPickerToChannel, colorPickerToInputChannel } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { ColorPickerChannelProvider, ColorPickerProvider, useColorPickerChannelContext, useColorPickerContext } from './context'
import { useColorPicker } from './use-color-picker'

type ColorPickerProps = ColorPickerSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：展开态、当前颜色的各式表示、预设色板、屏幕取色状态，以及改展开与改值两个动作。 */
export type ColorPickerRootSlotProps = Pick<
  ColorPickerApi,
  'open' | 'value' | 'rgba' | 'hsva' | 'swatches' | 'picking' | 'eyeDropperSupported' | 'setOpen' | 'setValue'
>

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children' | 'color'>

export interface XhColorPickerRootProps extends RootElementProps {
  /** 受控颜色值串；给定即受控。 */
  value?: string
  /** 非受控初值。 */
  defaultValue?: string
  /** 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 */
  format?: ColorPickerFormat
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 只读：浮层照开（看得见当前颜色），但任何改值的动作都不发生。 */
  readOnly?: boolean
  /** 带透明度，默认关。 */
  alpha?: boolean
  /** 预设色板。作者据此渲染 swatch-item，组件只标出哪一格正被选中。 */
  swatches?: string[]
  /** 表单字段名；给了表单影子才带 name 并参与提交。 */
  name?: string
  size?: Size
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  placement?: Placement
  offset?: number
  translations?: Partial<ColorPickerTranslations>
  onValueChange?: ColorPickerProps['onValueChange']
  onOpenChange?: ColorPickerProps['onOpenChange']
  children?: SlotChildren<ColorPickerRootSlotProps>
}

export function XhColorPickerRoot({
  value,
  defaultValue,
  format,
  open,
  defaultOpen,
  disabled,
  readOnly,
  alpha,
  swatches,
  name,
  size,
  dir,
  placement,
  offset,
  translations,
  onValueChange,
  onOpenChange,
  children,
  ...rest
}: XhColorPickerRootProps): ReactNode {
  const ctx = useColorPicker(withXhConfig('color-picker', {
    value,
    defaultValue,
    format,
    open,
    defaultOpen,
    disabled,
    readOnly,
    alpha,
    swatches,
    name,
    size,
    dir,
    placement,
    offset,
    translations,
    onValueChange,
    onOpenChange,
  }) as ColorPickerProps)
  const api = ctx.api

  return (
    <ColorPickerProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          open: api.open,
          value: api.value,
          rgba: api.rgba,
          hsva: api.hsva,
          swatches: api.swatches,
          picking: api.picking,
          eyeDropperSupported: api.eyeDropperSupported,
          setOpen: api.setOpen,
          setValue: api.setValue,
        })}
      </div>
    </ColorPickerProvider>
  )
}

XhColorPickerRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhColorPickerLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhColorPickerLabel({ children, ...rest }: XhColorPickerLabelProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhColorPickerControlProps extends ComponentPropsWithRef<'div'> {}

/** 描边、底色与聚焦环所在的那一层，触发按钮与尾部动作钮在里面并排。 */
export function XhColorPickerControl({ children, ...rest }: XhColorPickerControlProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhColorPickerTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 原生 button，激活交给平台；同时是浮层的定位锚点。 */
export function XhColorPickerTrigger({ children, ...rest }: XhColorPickerTriggerProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getTriggerProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLButtonElement | null) => { ctx.triggerRef.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhColorPickerValueTextProps extends ComponentPropsWithRef<'span'> {}

/** 没给内容就显示当前值串。 */
export function XhColorPickerValueText({ children, ...rest }: XhColorPickerValueTextProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.value}
    </span>
  )
}

export interface XhColorPickerSwatchProps extends ComponentPropsWithRef<'span'> {}

export function XhColorPickerSwatch({ children, ...rest }: XhColorPickerSwatchProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getSwatchProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhColorPickerPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}

/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhColorPickerPositioner({ children, container, ...rest }: XhColorPickerPositionerProps): ReactNode {
  const ctx = useColorPickerContext()
  // 面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhColorPickerContentProps extends ComponentPropsWithRef<'div'> {}

export function XhColorPickerContent({ children, ...rest }: XhColorPickerContentProps): ReactNode {
  const ctx = useColorPickerContext()
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

export interface XhColorPickerSaturationAreaProps extends ComponentPropsWithRef<'div'> {}

/** 区域节点交给机器，矩形在指针事件里现量。 */
export function XhColorPickerSaturationArea({ children, ...rest }: XhColorPickerSaturationAreaProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getSaturationAreaProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.areaRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhColorPickerAreaThumbProps extends ComponentPropsWithRef<'div'> {}

export function XhColorPickerAreaThumb({ children, ...rest }: XhColorPickerAreaThumbProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div {...mergeReactProps(ctx.api.getAreaThumbProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhColorPickerChannelSliderProps extends ComponentPropsWithRef<'div'> {
  /** 这条滑杆调的是哪一路，缺省或不识别时按色相处理。 */
  channel?: ColorPickerChannel
}

export function XhColorPickerChannelSlider({ channel, children, ...rest }: XhColorPickerChannelSliderProps): ReactNode {
  const ctx = useColorPickerContext()
  const resolved = colorPickerToChannel(channel)
  return (
    <ColorPickerChannelProvider value={resolved}>
      <div
        {...mergeReactProps(
          ctx.api.getChannelSliderProps({ channel: resolved }) as Record<string, unknown>,
          rest as Record<string, unknown>,
        )}
      >
        {children}
      </div>
    </ColorPickerChannelProvider>
  )
}

export interface XhColorPickerChannelSliderTrackProps extends ComponentPropsWithRef<'div'> {}

/** 轨道节点按通道逐条登记给机器，矩形在指针事件里现量。 */
export function XhColorPickerChannelSliderTrack({ children, ...rest }: XhColorPickerChannelSliderTrackProps): ReactNode {
  const ctx = useColorPickerContext()
  const channel = useColorPickerChannelContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getChannelSliderTrackProps({ channel }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        // 节点摘掉时登记为空，避免留下已离开文档的节点
        { ref: (el: HTMLDivElement | null) => { ctx.setChannelTrack(channel, el) } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhColorPickerChannelSliderThumbProps extends ComponentPropsWithRef<'div'> {}

export function XhColorPickerChannelSliderThumb({ children, ...rest }: XhColorPickerChannelSliderThumbProps): ReactNode {
  const ctx = useColorPickerContext()
  const channel = useColorPickerChannelContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getChannelSliderThumbProps({ channel }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhColorPickerChannelInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {
  /** 这个框编辑的是哪一路：hex 是整串，r/g/b 是分量，a 是透明度百分数；缺省或不识别时按 hex 处理。 */
  channel?: ColorPickerInputChannel
}

/** 通道身份由本部件自己声明，不必嵌在通道滑杆内。 */
export function XhColorPickerChannelInput({ channel, ...rest }: XhColorPickerChannelInputProps): ReactNode {
  const ctx = useColorPickerContext()
  const resolved = colorPickerToInputChannel(channel)
  return (
    <input
      {...mergeReactProps(
        ctx.api.getChannelInputProps({ channel: resolved }) as Record<string, unknown>,
        // 草稿攥在机器里，写回走连接层的 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警；真正的写回不经它
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhColorPickerEyeDropperTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhColorPickerEyeDropperTrigger({ children, ...rest }: XhColorPickerEyeDropperTriggerProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <button {...mergeReactProps(ctx.api.getEyeDropperTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhColorPickerSwatchGroupProps extends ComponentPropsWithRef<'div'> {}

export function XhColorPickerSwatchGroup({ children, ...rest }: XhColorPickerSwatchGroupProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div {...mergeReactProps(ctx.api.getSwatchGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhColorPickerSwatchItemProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  /** 这一格的颜色。 */
  value?: string
}

export function XhColorPickerSwatchItem({ value = '', children, ...rest }: XhColorPickerSwatchItemProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getSwatchItemProps({ value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}

export interface XhColorPickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}

/** 表单出口：颜色随这份原生输入提交，对键盘与读屏不可见。 */
export function XhColorPickerHiddenInput({ ...rest }: XhColorPickerHiddenInputProps): ReactNode {
  const ctx = useColorPickerContext()
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
