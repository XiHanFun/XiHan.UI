/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { MatrixCodeApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface MatrixCodeContext {
  api: ComputedRef<MatrixCodeApi>
}

const KEY: InjectionKey<MatrixCodeContext> = Symbol.for('xh-matrix-code')

export function provideMatrixCode(ctx: MatrixCodeContext): void {
  provide(KEY, ctx)
}

export function useMatrixCodeContext(): MatrixCodeContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] MatrixCode 部件必须用在 XhMatrixCode 内')
  return ctx
}
