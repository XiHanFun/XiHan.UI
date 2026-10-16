/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use fieldset 相关实现。

import type { FieldsetApi, FieldsetProps, FieldsetRenderedParts } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectFieldset } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, onMounted, onUpdated, reactive, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { createVueIdGenerator } from '../../runtime/vue-id'

/** 字段集里登记在场的部件名。 */
export type FieldsetPartName = keyof FieldsetRenderedParts

export interface FieldsetContext {
  api: ComputedRef<FieldsetApi>
  /** 已挂载的 description / error-text 各几个，由部件自行登记。 */
  partCounts: Record<FieldsetPartName, number>
}

// Fieldset 无状态机，只用一份实例级 scope 派生 part id，props 变了由 computed 重算属性
export function useFieldset(props: FieldsetProps): FieldsetContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const partCounts = reactive<Record<FieldsetPartName, number>>({ description: 0, errorText: 0 })
  // 挂载前（含服务端直出）不知道部件在不在场，按在场处理；子部件先于根挂载，根挂载时登记已齐
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  const parts = computed<FieldsetRenderedParts | undefined>(() => mounted.value
    ? { description: partCounts.description > 0, errorText: partCounts.errorText > 0 }
    : undefined)
  const api = computed(() => connectFieldset({ ...props, parts: parts.value }, scope, vueNormalize))
  return { api, partCounts }
}

/** 部件挂载期间登记在场，卸载时撤销；present 给出时每次渲染后现判（说明读不出一句话时不算在场）。 */
export function useFieldsetPartPresence(ctx: FieldsetContext, part: FieldsetPartName, present: () => boolean = () => true): void {
  let counted = false
  const sync = (): void => {
    const next = present()
    if (next === counted)
      return
    ctx.partCounts[part] += next ? 1 : -1
    counted = next
  }
  onMounted(sync)
  onUpdated(sync)
  onBeforeUnmount(() => {
    if (counted)
      ctx.partCounts[part]--
    counted = false
  })
}
