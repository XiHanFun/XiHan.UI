/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SegmentedItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { SegmentedContext } from './use-segmented'
import { inject, provide } from 'vue'

/** 条目声明的值与禁用，供 item-text 等子部件复用同一份声明。 */
export interface SegmentedItemContext {
  item: ComputedRef<SegmentedItemProps>
}

const KEY: InjectionKey<SegmentedContext> = Symbol.for('xh-segmented')
const ITEM_KEY: InjectionKey<SegmentedItemContext> = Symbol.for('xh-segmented-item')

export function provideSegmented(ctx: SegmentedContext): void {
  provide(KEY, ctx)
}

export function useSegmentedContext(): SegmentedContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Segmented 部件必须用在 XhSegmentedRoot 内')
  return ctx
}

export function provideSegmentedItem(ctx: SegmentedItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useSegmentedItemContext(): SegmentedItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Segmented 条目子部件必须用在 XhSegmentedItem 内')
  return ctx
}
