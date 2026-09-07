import type { ImageContext } from './use-image'
import { createContext, useContext } from 'react'

const Ctx = createContext<ImageContext | undefined>(undefined)

export const ImageProvider = Ctx

export function useImageContext(): ImageContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhImage 的部件要放在 XhImageRoot 里')
  return ctx
}
