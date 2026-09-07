import type { ImageViewerContext } from './use-image-viewer'
import { createContext, useContext } from 'react'

const Ctx = createContext<ImageViewerContext | undefined>(undefined)

export const ImageViewerProvider = Ctx

export function useImageViewerContext(): ImageViewerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhImageViewer 的部件要放在 XhImageViewerRoot 里')
  return ctx
}
