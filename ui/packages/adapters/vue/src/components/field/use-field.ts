/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use field 相关实现。

import type { FieldApi, FieldProps, FieldRenderedParts } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectField } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, onMounted, onUpdated, reactive, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { createVueIdGenerator } from '../../runtime/vue-id'

/** 字段里登记在场的部件名。 */
export type FieldPartName = keyof FieldRenderedParts

export interface FieldContext {
  api: ComputedRef<FieldApi>
  /** 已挂载的 label / description / error-text 各几个，由部件自行登记。 */
  partCounts: Record<FieldPartName, number>
}

// Field 无状态机，只用一份实例级 scope 派生 part id，props 变了由 computed 重算属性
export function useField(props: FieldProps): FieldContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const partCounts = reactive<Record<FieldPartName, number>>({ label: 0, description: 0, errorText: 0, control: 0 })
  // 挂载前（含服务端直出）不知道部件在不在场，按在场处理；子部件先于根挂载，根挂载时登记已齐
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  const parts = computed<FieldRenderedParts | undefined>(() => mounted.value
    ? { label: partCounts.label > 0, description: partCounts.description > 0, errorText: partCounts.errorText > 0, control: partCounts.control > 0 }
    : undefined)
  const api = computed(() => connectField({ ...props, parts: parts.value }, scope, vueNormalize))
  return { api, partCounts }
}

/**
 * 部件挂载期间登记在场，卸载时撤销；present 给出时每次渲染后现判（说明没有文字时不算在场）。
 * 控件的名字链与描述链只收登记在场的部件 id。
 */
export function useFieldPartPresence(ctx: FieldContext, part: FieldPartName, present: () => boolean = () => true): void {
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
