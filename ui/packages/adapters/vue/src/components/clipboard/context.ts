/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ClipboardContext } from './use-clipboard'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ClipboardContext> = Symbol.for('xh-clipboard')

export function provideClipboard(ctx: ClipboardContext): void {
  provide(KEY, ctx)
}

export function useClipboardContext(): ClipboardContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Clipboard 部件必须用在 XhClipboardRoot 内')
  return ctx
}
