/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ColorChannel, ColorFormat, ColorSliderApi, ColorSliderSchema, ColorSliderTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useFormControlProps } from '../form/use-form-control'
import { ColorSliderProvider, useColorSliderContext } from './context'
import { useColorSlider } from './use-color-slider'

type ColorSliderProps = ColorSliderSchema['props']

export type ColorSliderRootSlotProps = Pick<
  ColorSliderApi,
  'value' | 'channel' | 'channelValue' | 'percent' | 'dragging' | 'setValue' | 'setChannelValue'
>

type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children'>

export interface XhColorSliderRootProps extends RootElementProps {
  /** 受控的颜色值串。给定即受控。 */
  value?: string
  /** 非受控初值。 */
  defaultValue?: string
  /** 推的是哪一路：hue / saturation / brightness / alpha / red / green / blue，默认 hue。 */
  channel?: ColorChannel
  /** 值串的写法：hex / rgba / hsla，默认 hex。 */
  format?: ColorFormat
  /** 值串带不带透明度；缺省时推透明度那一路带、其余不带。 */
  alpha?: boolean
  orientation?: Orientation
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  size?: Size
  /** 表单字段名；给了表单影子才带 name 并参与提交。 */
  name?: string
  translations?: Partial<ColorSliderTranslations>
  /** 每次推动都发；拖动过程中会连续发很多次。 */
  onValueChange?: ColorSliderProps['onValueChange']
  /** 只在一次操作结束时发一次，适合拿来发请求。 */
  onValueChangeEnd?: ColorSliderProps['onValueChangeEnd']
  children?: SlotChildren<ColorSliderRootSlotProps>
}

export function XhColorSliderRoot({
  value,
  defaultValue,
  channel,
  format,
  alpha,
  orientation,
  dir,
  disabled,
  readOnly,
  invalid,
  size,
  name,
  translations,
  onValueChange,
  onValueChangeEnd,
  children,
  ...rest
}: XhColorSliderRootProps): ReactNode {
  const ctx = useColorSlider(withXhConfig('color-slider', useFormControlProps({
    value,
    defaultValue,
    channel,
    format,
    alpha,
    orientation,
    dir,
    disabled,
    readOnly,
    invalid,
    size,
    name,
    translations,
    onValueChange,
    onValueChangeEnd,
  })))
  const api = ctx.api

  return (
    <ColorSliderProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          value: api.value,
          channel: api.channel,
          channelValue: api.channelValue,
          percent: api.percent,
          dragging: api.dragging,
          setValue: api.setValue,
          setChannelValue: api.setChannelValue,
        })}
      </div>
    </ColorSliderProvider>
  )
}

XhColorSliderRoot.xhEvents = ['value-change', 'value-change-end'] as const

export interface XhColorSliderLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhColorSliderLabel({ children, ...rest }: XhColorSliderLabelProps): ReactNode {
  const ctx = useColorSliderContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhColorSliderControlProps extends ComponentPropsWithRef<'div'> {}

export function XhColorSliderControl({ children, ...rest }: XhColorSliderControlProps): ReactNode {
  const ctx = useColorSliderContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhColorSliderTrackProps extends ComponentPropsWithRef<'div'> {}

export function XhColorSliderTrack({ children, ...rest }: XhColorSliderTrackProps): ReactNode {
  const ctx = useColorSliderContext()
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

export interface XhColorSliderThumbProps extends ComponentPropsWithRef<'div'> {}

export function XhColorSliderThumb({ children, ...rest }: XhColorSliderThumbProps): ReactNode {
  const ctx = useColorSliderContext()
  // 拇指上的 onFocus 是不冒泡的 DOM focus，React 的同名合成事件挂的是冒泡的 focusin：
  // 后代得焦会被算成拇指自己得焦。装成原生监听器，到达路径才与另外两家一致
  const bind = useNativeEvents(ctx.api.getThumbProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhColorSliderValueTextProps extends ComponentPropsWithRef<'span'> {}

/** 值气泡：没给内容就填本通道的当前数值。 */
export function XhColorSliderValueText({ children, ...rest }: XhColorSliderValueTextProps): ReactNode {
  const ctx = useColorSliderContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? String(ctx.api.channelValue)}
    </span>
  )
}

export interface XhColorSliderHiddenInputProps extends ComponentPropsWithRef<'input'> {}

export function XhColorSliderHiddenInput(props: XhColorSliderHiddenInputProps): ReactNode {
  const ctx = useColorSliderContext()
  return <input {...mergeReactProps(ctx.api.getHiddenInputProps() as Record<string, unknown>, props as Record<string, unknown>)} />
}
