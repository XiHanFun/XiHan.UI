/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { DialogContext } from './use-dialog'
import { inject, provide } from 'vue'

const KEY: InjectionKey<DialogContext> = Symbol.for('xh-dialog')

export function provideDialog(ctx: DialogContext): void {
  provide(KEY, ctx)
}

export function useDialogContext(): DialogContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Dialog 部件必须用在 XhDialogRoot 内')
  return ctx
}
