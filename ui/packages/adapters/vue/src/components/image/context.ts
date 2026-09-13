/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ImageContext } from './use-image'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ImageContext> = Symbol.for('xh-image')

export function provideImage(ctx: ImageContext): void {
  provide(KEY, ctx)
}

export function useImageContext(): ImageContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Image 部件必须用在 XhImageRoot 内')
  return ctx
}
