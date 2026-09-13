/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ToggleGroupContext } from './use-toggle-group'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToggleGroupContext> = Symbol.for('xh-toggle-group')

export function provideToggleGroup(ctx: ToggleGroupContext): void {
  provide(KEY, ctx)
}

export function useToggleGroupContext(): ToggleGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ToggleGroup 部件必须用在 XhToggleGroupRoot 内')
  return ctx
}
