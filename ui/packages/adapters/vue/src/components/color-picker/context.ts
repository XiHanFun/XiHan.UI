import type { ColorPickerChannel } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ColorPickerContext } from './use-color-picker'
import { inject, provide } from 'vue'

/** 通道滑杆自报的身份，供它内部的轨道与拇指复用同一份声明。 */
export interface ColorPickerChannelContext {
  channel: ComputedRef<ColorPickerChannel>
}

const KEY: InjectionKey<ColorPickerContext> = Symbol('xh-color-picker')
const CHANNEL_KEY: InjectionKey<ColorPickerChannelContext> = Symbol('xh-color-picker-channel')

export function provideColorPicker(ctx: ColorPickerContext): void {
  provide(KEY, ctx)
}

export function useColorPickerContext(): ColorPickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorPicker 部件必须用在 XhColorPickerRoot 内')
  return ctx
}

export function provideColorPickerChannel(ctx: ColorPickerChannelContext): void {
  provide(CHANNEL_KEY, ctx)
}

export function useColorPickerChannelContext(): ColorPickerChannelContext {
  const ctx = inject(CHANNEL_KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorPicker 通道轨道与拇指必须用在 XhColorPickerChannelSlider 内')
  return ctx
}
