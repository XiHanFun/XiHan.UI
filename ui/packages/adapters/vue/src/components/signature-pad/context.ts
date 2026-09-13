/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { SignaturePadContext } from './use-signature-pad'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SignaturePadContext> = Symbol.for('xh-signature-pad')

export function provideSignaturePad(ctx: SignaturePadContext): void {
  provide(KEY, ctx)
}

export function useSignaturePadContext(): SignaturePadContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] SignaturePad 部件必须用在 XhSignaturePadRoot 内')
  return ctx
}
