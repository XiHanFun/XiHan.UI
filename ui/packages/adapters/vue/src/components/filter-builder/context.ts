/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现：根的上下文，以及组与条件交给里面部件的路径。

import type { FilterPath } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { FilterBuilderContext } from './use-filter-builder'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FilterBuilderContext> = Symbol.for('xh-filter-builder')
const GROUP_KEY: InjectionKey<ComputedRef<FilterPath>> = Symbol.for('xh-filter-builder-group')
const CONDITION_KEY: InjectionKey<ComputedRef<FilterPath>> = Symbol.for('xh-filter-builder-condition')

export function provideFilterBuilder(ctx: FilterBuilderContext): void {
  provide(KEY, ctx)
}

export function useFilterBuilderContext(): FilterBuilderContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FilterBuilder 部件必须用在 XhFilterBuilderRoot 内')
  return ctx
}

/** 组把自己的路径交给组头、条目、组尾与里面的触发钮。 */
export function provideFilterBuilderGroup(path: ComputedRef<FilterPath>): void {
  provide(GROUP_KEY, path)
}

export function useFilterBuilderGroup(): ComputedRef<FilterPath> {
  const path = inject(GROUP_KEY, null)
  if (!path)
    throw new Error('[xh] 组头、条目、组尾与组的触发钮必须用在 XhFilterBuilderGroup 内')
  return path
}

/** 条件把自己的路径交给行里的部件。 */
export function provideFilterBuilderCondition(path: ComputedRef<FilterPath>): void {
  provide(CONDITION_KEY, path)
}

export function useFilterBuilderCondition(): ComputedRef<FilterPath> {
  const path = inject(CONDITION_KEY, null)
  if (!path)
    throw new Error('[xh] 条件行里的部件必须用在 XhFilterBuilderCondition 内')
  return path
}
