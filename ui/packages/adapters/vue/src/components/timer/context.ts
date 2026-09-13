/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { TimerContext } from './use-timer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TimerContext> = Symbol.for('xh-timer')

export function provideTimer(ctx: TimerContext): void {
  provide(KEY, ctx)
}

export function useTimerContext(): TimerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Timer 部件必须用在 XhTimerRoot 内')
  return ctx
}
