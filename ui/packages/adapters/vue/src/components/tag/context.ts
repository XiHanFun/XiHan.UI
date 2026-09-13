/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { TagContext } from './use-tag'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TagContext> = Symbol.for('xh-tag')

export function provideTag(ctx: TagContext): void {
  provide(KEY, ctx)
}

export function useTagContext(): TagContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tag 部件必须用在 XhTagRoot 内')
  return ctx
}
