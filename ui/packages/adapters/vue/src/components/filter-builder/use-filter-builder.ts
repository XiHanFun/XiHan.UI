/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use filter builder 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FilterBuilderApi, FilterBuilderSchema, FilterBuilderTranslations } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectFilterBuilder, filterBuilderMachine, filterBuilderTranslations } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface FilterBuilderContext {
  /** 已渲染的 label 部件数量，由 XhFilterBuilderLabel 在 setup 里同步登记、卸载时撤销；根的 aria-labelledby 据此决定指不指过去。 */
  labelCount: Ref<number>
  service: Service<FilterBuilderSchema>
  api: ComputedRef<FilterBuilderApi>
  /** 解析后的文案，给标准结构里的文字用。 */
  translations: ComputedRef<FilterBuilderTranslations>
}

export function useFilterBuilder(
  props: FilterBuilderSchema['props'],
  onValueChange?: FilterBuilderSchema['props']['onValueChange'],
): FilterBuilderContext {
  const labelCount = ref(0)
  const service = useMachine(filterBuilderMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }))
  const api = computed(() => connectFilterBuilder(service, vueNormalize))
  const translations = computed(() => {
    void api.value
    return filterBuilderTranslations(service.prop)
  })
  return { labelCount, service, api, translations }
}
