/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { GridListRowProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { GridListContext } from './use-grid-list'
import { inject, provide } from 'vue'

const KEY: InjectionKey<GridListContext> = Symbol.for('xh-grid-list')
const ROW_KEY: InjectionKey<ComputedRef<GridListRowProps>> = Symbol.for('xh-grid-list-row')

export function provideGridList(context: GridListContext): void {
  provide(KEY, context)
}

export function useGridListContext(): GridListContext {
  const context = inject(KEY, null)
  if (!context)
    throw new Error('[xh] GridList 部件必须用在 XhGridListRoot 内')
  return context
}

export function provideGridListRow(row: ComputedRef<GridListRowProps>): void {
  provide(ROW_KEY, row)
}

export function useGridListRow(): ComputedRef<GridListRowProps> {
  const row = inject(ROW_KEY, null)
  if (!row)
    throw new Error('[xh] GridList 行子部件必须用在 XhGridListRow 内')
  return row
}
