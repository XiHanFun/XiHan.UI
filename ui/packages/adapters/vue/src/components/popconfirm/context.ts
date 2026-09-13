/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { PopconfirmContext } from './use-popconfirm'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PopconfirmContext> = Symbol.for('xh-popconfirm')

export function providePopconfirm(ctx: PopconfirmContext): void {
  provide(KEY, ctx)
}

export function usePopconfirmContext(): PopconfirmContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Popconfirm 部件必须用在 XhPopconfirmRoot 内')
  return ctx
}
