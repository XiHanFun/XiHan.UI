/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { VirtualizerContext } from './use-virtualizer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<VirtualizerContext> = Symbol.for('xh-virtualizer')

export function provideVirtualizer(ctx: VirtualizerContext): void {
  provide(KEY, ctx)
}

export function useVirtualizerContext(): VirtualizerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Virtualizer 部件必须用在 XhVirtualizerRoot 内')
  return ctx
}
