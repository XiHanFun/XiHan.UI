/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ToolbarContext } from './use-toolbar'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToolbarContext> = Symbol.for('xh-toolbar')

export function provideToolbar(ctx: ToolbarContext): void {
  provide(KEY, ctx)
}

export function useToolbarContext(): ToolbarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Toolbar 部件必须用在 XhToolbarRoot 内')
  return ctx
}
