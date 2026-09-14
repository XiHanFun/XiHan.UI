/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ColorSwatchPickerContext } from './use-color-swatch-picker'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ColorSwatchPickerContext> = Symbol.for('xh-color-swatch-picker')

export function provideColorSwatchPicker(ctx: ColorSwatchPickerContext): void {
  provide(KEY, ctx)
}

export function useColorSwatchPickerContext(): ColorSwatchPickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorSwatchPicker 部件必须用在 XhColorSwatchPickerRoot 内')
  return ctx
}
