import type { WatermarkApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface WatermarkContext {
  api: WatermarkApi
}

const Ctx = createContext<WatermarkContext | undefined>(undefined)

export const WatermarkProvider = Ctx

export function useWatermarkContext(): WatermarkContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhWatermark 的部件要放在 XhWatermarkRoot 里')
  return ctx
}
