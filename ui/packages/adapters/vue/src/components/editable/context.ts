/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { EditableContext } from './use-editable'
import { inject, provide } from 'vue'

const KEY: InjectionKey<EditableContext> = Symbol.for('xh-editable')

export function provideEditable(ctx: EditableContext): void {
  provide(KEY, ctx)
}

export function useEditableContext(): EditableContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Editable 部件必须用在 XhEditableRoot 内')
  return ctx
}
