import type { ImageCropperContext } from './use-image-cropper'
import { createContext, useContext } from 'react'

const Ctx = createContext<ImageCropperContext | undefined>(undefined)

export const ImageCropperProvider = Ctx

export function useImageCropperContext(): ImageCropperContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhImageCropper 的部件要放在 XhImageCropperRoot 里')
  return ctx
}
