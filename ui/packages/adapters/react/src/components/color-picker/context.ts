import type { ColorPickerChannel } from '@xihan-ui/headless'
import type { ColorPickerContext } from './use-color-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<ColorPickerContext | undefined>(undefined)
/** 通道滑杆自报的身份，供它内部的轨道与拇指复用同一份声明。 */
const ChannelCtx = createContext<ColorPickerChannel | undefined>(undefined)

export const ColorPickerProvider = Ctx
export const ColorPickerChannelProvider = ChannelCtx

export function useColorPickerContext(): ColorPickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhColorPicker 的部件要放在 XhColorPickerRoot 里')
  return ctx
}

export function useColorPickerChannelContext(): ColorPickerChannel {
  const channel = useContext(ChannelCtx)
  if (!channel)
    throw new Error('通道轨道与拇指要放在 XhColorPickerChannelSlider 里')
  return channel
}
