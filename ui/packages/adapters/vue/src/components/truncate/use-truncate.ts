/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use truncate 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TruncateApi, TruncateSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectTruncate, truncateMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

/** 对外的两个回调。 */
export type TruncateNotifiers = Pick<TruncateSchema['props'], 'onOpenChange' | 'onOverflowChange'>

export interface TruncateContext {
  api: ComputedRef<TruncateApi>
  service: Service<TruncateSchema>
  /** 限制文字的盒子：溢出与文字都测量它。 */
  rootRef: Ref<HTMLElement | null>
}

/** 测量与监听都在状态机的效应中运行，DOM 取值口经 refs 交入。 */
export function useTruncate(
  props: TruncateSchema['props'],
  notify?: TruncateNotifiers,
): TruncateContext {
  const rootRef = ref<HTMLElement | null>(null)
  // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
  const service = useMachine(truncateMachine, () => ({ ...props, ...notify }))

  service.refs.set('getRootEl', () => rootRef.value)

  const api = computed(() => connectTruncate(service, vueNormalize))
  return { api, service, rootRef }
}
