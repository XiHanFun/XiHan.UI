/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { NavigationMenuContext } from './use-navigation-menu'
import { inject, provide } from 'vue'

const KEY: InjectionKey<NavigationMenuContext> = Symbol.for('xh-navigation-menu')

export function provideNavigationMenu(ctx: NavigationMenuContext): void {
  provide(KEY, ctx)
}

export function useNavigationMenuContext(): NavigationMenuContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] NavigationMenu 部件必须用在 XhNavigationMenuRoot 内')
  return ctx
}
