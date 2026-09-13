/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { AvatarGroupApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface AvatarGroupContext {
  api: ComputedRef<AvatarGroupApi>
}

const KEY: InjectionKey<AvatarGroupContext> = Symbol.for('xh-avatar-group')

export function provideAvatarGroup(ctx: AvatarGroupContext): void {
  provide(KEY, ctx)
}

export function useAvatarGroupContext(): AvatarGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] AvatarGroup 部件必须用在 XhAvatarGroupRoot 内')
  return ctx
}
