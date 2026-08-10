import type { InjectionKey } from 'vue'
import type { ImageContext } from './use-image'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ImageContext> = Symbol('xh-image')

export function provideImage(ctx: ImageContext): void {
  provide(KEY, ctx)
}

export function useImageContext(): ImageContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Image 部件必须用在 XhImageRoot 内')
  return ctx
}
