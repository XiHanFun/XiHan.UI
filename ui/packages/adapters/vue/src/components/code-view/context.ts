/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { CodeViewContext } from './use-code-view'
import { inject, provide } from 'vue'

const KEY: InjectionKey<CodeViewContext> = Symbol.for('xh-code-view')

export function provideCodeView(ctx: CodeViewContext): void {
  provide(KEY, ctx)
}

export function useCodeViewContext(): CodeViewContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] CodeView 部件必须用在 XhCodeViewRoot 内')
  return ctx
}
