/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FloatingPanelContext } from './use-floating-panel'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FloatingPanelContext> = Symbol.for('xh-floating-panel')

export function provideFloatingPanel(ctx: FloatingPanelContext): void {
  provide(KEY, ctx)
}

export function useFloatingPanelContext(): FloatingPanelContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FloatingPanel 部件必须用在 XhFloatingPanelRoot 内')
  return ctx
}
