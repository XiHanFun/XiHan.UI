/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ColorSliderContext } from './use-color-slider'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ColorSliderContext> = Symbol.for('xh-color-slider')

export function provideColorSlider(ctx: ColorSliderContext): void {
  provide(KEY, ctx)
}

export function useColorSliderContext(): ColorSliderContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorSlider 部件必须用在 XhColorSliderRoot 内')
  return ctx
}
