import type { InjectionKey } from 'vue'
import type { ImageCropperContext } from './use-image-cropper'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ImageCropperContext> = Symbol('xh-image-cropper')

export function provideImageCropper(ctx: ImageCropperContext): void {
  provide(KEY, ctx)
}

export function useImageCropperContext(): ImageCropperContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ImageCropper 部件必须用在 XhImageCropperRoot 内')
  return ctx
}
