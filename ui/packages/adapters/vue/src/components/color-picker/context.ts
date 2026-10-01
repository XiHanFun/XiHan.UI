/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ColorPickerContext } from './use-color-picker'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ColorPickerContext> = Symbol.for('xh-color-picker')

export function provideColorPicker(ctx: ColorPickerContext): void {
  provide(KEY, ctx)
}

export function useColorPickerContext(): ColorPickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorPicker 部件必须用在 XhColorPickerRoot 内')
  return ctx
}

/** 标签声明的值，供标签中的删除按钮复用同一份声明。 */
export interface ColorPickerTagContext {
  value: () => string
}

const TAG_KEY: InjectionKey<ColorPickerTagContext> = Symbol.for('xh-color-picker-tag')

export function provideColorPickerTag(ctx: ColorPickerTagContext): void {
  provide(TAG_KEY, ctx)
}

export function useColorPickerTagContext(): ColorPickerTagContext {
  const ctx = inject(TAG_KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorPicker 标签子部件必须用在 XhColorPickerTag 内')
  return ctx
}
