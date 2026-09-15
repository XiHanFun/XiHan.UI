/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { Direction, Placement, Size } from '@xihan-ui/core'
import type {
  ColorFormat,
  ColorPickerApi,
  ColorPickerInputChannel,
  ColorPickerSchema,
  ColorPickerTranslations,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { colorPickerToInputChannel } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhColorSliderControl, XhColorSliderThumb, XhColorSliderTrack } from '../color-slider/color-slider'
import { ColorSliderProvider } from '../color-slider/context'
import { XhColorSwatchPickerItem } from '../color-swatch-picker/color-swatch-picker'
import { ColorSwatchPickerProvider } from '../color-swatch-picker/context'
import { useFormControlProps } from '../form/use-form-control'
import { ColorPickerProvider, useColorPickerContext } from './context'
import { useColorPicker } from './use-color-picker'

type ColorPickerProps = ColorPickerSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：展开态、当前颜色的各种表示、预设色板、屏幕取色状态，以及修改展开与修改值两个动作。 */
export type ColorPickerRootSlotProps = Pick<
  ColorPickerApi,
  'open' | 'value' | 'rgba' | 'hsva' | 'swatches' | 'picking' | 'eyeDropperSupported' | 'errors' | 'setOpen' | 'setValue' | 'clearError'
>

/** 根上自有的取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children' | 'color'>

export interface XhColorPickerRootProps extends RootElementProps {
  /** 受控颜色值串；给定即受控。 */
  value?: string
  /** 非受控初值。 */
  defaultValue?: string
  /** 值串的写法，默认 hex。修改它只改变对外的序列化，工作色恒为 HSVA。 */
  format?: ColorFormat
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 只读：浮层照常展开（可查看当前颜色），但任何改值的动作都不发生。 */
  readOnly?: boolean
  /** 带透明度，默认关闭。 */
  alpha?: boolean
  /** 预设色板：交给内嵌的色块选择器铺设格子，选中的格子按颜色比较。 */
  swatches?: string[]
  /** 表单字段名；提供后表单影子才带 name 并参与提交。 */
  name?: string
  size?: Size
  /** 文字方向，默认 ltr。 */
  dir?: Direction
  placement?: Placement
  offset?: number
  translations?: Partial<ColorPickerTranslations>
  onValueChange?: ColorPickerProps['onValueChange']
  onOpenChange?: ColorPickerProps['onOpenChange']
  onColorError?: ColorPickerProps['onColorError']
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
  onColorError,
  children,
  ...rest
}: XhColorPickerRootProps): ReactNode {
  const ctx = useColorPicker(withXhConfig('color-picker', useFormControlProps({
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
    onColorError,
  })) as ColorPickerProps)
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
          errors: api.errors,
          setOpen: api.setOpen,
          setValue: api.setValue,
          clearError: api.clearError,
        })}
      </div>
    </ColorPickerProvider>
  )
}

XhColorPickerRoot.xhEvents = ['value-change', 'open-change', 'color-error'] as const

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

/** 描边、底色与聚焦环所在的层，触发按钮与尾部动作按钮在其中并排。 */
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

/** 未提供内容时显示当前值串。 */
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
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}

/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhColorPickerPositioner({ children, container, ...rest }: XhColorPickerPositionerProps): ReactNode {
  const ctx = useColorPickerContext()
  // 面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef}>
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

/** 区域节点交给状态机，矩形在指针事件中现测。 */
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

export interface XhColorPickerHueSliderProps extends ComponentPropsWithRef<'div'> {}

/**
 * 色相滑块的挂载点，同时充当该滑块的根节点：其中放置的是 XhColorSlider* 普通部件
 * （control / track / thumb / label / value-text），DOM 带 data-scope="color-slider"。
 * 未写 children 时铺开最简结构：一条轨道加一个拇指。
 */
export function XhColorPickerHueSlider({ children, ...rest }: XhColorPickerHueSliderProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <ColorSliderProvider value={ctx.hueSlider}>
      <div {...mergeReactProps(ctx.api.getHueSliderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children ?? <SliderTree />}
      </div>
    </ColorSliderProvider>
  )
}

export interface XhColorPickerAlphaSliderProps extends ComponentPropsWithRef<'div'> {}

/** 透明度滑块的挂载点，同上；alpha 关闭时整条禁用。 */
export function XhColorPickerAlphaSlider({ children, ...rest }: XhColorPickerAlphaSliderProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <ColorSliderProvider value={ctx.alphaSlider}>
      <div {...mergeReactProps(ctx.api.getAlphaSliderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children ?? <SliderTree />}
      </div>
    </ColorSliderProvider>
  )
}

/** 未写 children 时的滑块内部：control 中一条 track 与一个 thumb，与手写部件产出的 DOM 一致。 */
function SliderTree(): ReactNode {
  return (
    <XhColorSliderControl>
      <XhColorSliderTrack />
      <XhColorSliderThumb />
    </XhColorSliderControl>
  )
}

export interface XhColorPickerChannelInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {
  /** 该输入框编辑的通道：hex 是整串，r/g/b 是分量，a 是透明度百分数；默认或无法识别时按 hex 处理。 */
  channel?: ColorPickerInputChannel
}

/** 通道身份由本部件自行声明，不必嵌在通道滑杆内。 */
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

export interface XhColorPickerSwatchPickerProps extends ComponentPropsWithRef<'div'> {}

/**
 * 预设色板的挂载点，同时充当色板的根节点（role=radiogroup、方向键与 roving tabindex 都在它上面）：
 * 其中放置的是 XhColorSwatchPickerItem，DOM 带 data-scope="color-swatch-picker"。
 * 未写 children 时按 swatches 自动铺开格子。
 */
export function XhColorPickerSwatchPicker({ children, ...rest }: XhColorPickerSwatchPickerProps): ReactNode {
  const ctx = useColorPickerContext()
  // 挂载点的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，格子得焦也会把它叫起来，那一下会把焦点从格子抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致
  const bind = useNativeEvents(ctx.api.getSwatchPickerProps() as Record<string, unknown>, ['onFocus'])
  return (
    <ColorSwatchPickerProvider value={ctx.swatchPicker}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {children ?? ctx.api.swatchPicker.swatches.map(node => <XhColorSwatchPickerItem key={node.value} value={node.value} />)}
      </div>
    </ColorSwatchPickerProvider>
  )
}

export interface XhColorPickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}

/** 表单出口：颜色随该原生输入提交，对键盘与读屏不可见。 */
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
