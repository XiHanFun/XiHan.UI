import type { InjectionKey } from 'vue'
import type { ImageViewerContext } from './use-image-viewer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ImageViewerContext> = Symbol.for('xh-image-viewer')

export function provideImageViewer(ctx: ImageViewerContext): void {
  provide(KEY, ctx)
}

export function useImageViewerContext(): ImageViewerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ImageViewer 部件必须用在 XhImageViewerRoot 内')
  return ctx
}
