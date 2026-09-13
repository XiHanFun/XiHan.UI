/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { LogContext } from './use-log'
import { inject, provide } from 'vue'

const KEY: InjectionKey<LogContext> = Symbol.for('xh-log')

export function provideLog(ctx: LogContext): void {
  provide(KEY, ctx)
}

export function useLogContext(): LogContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Log 部件必须用在 XhLogRoot 内')
  return ctx
}
