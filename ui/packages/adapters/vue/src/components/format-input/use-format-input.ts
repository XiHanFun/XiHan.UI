/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use format input 相关实现。

import type { Service } from '@xihan-ui/core'
import type { FormatInputApi, FormatInputSchema, FormatInputTranslations } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectFormatInput, formatInputMachine, formatInputTranslations } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface FormatInputContext {
  /** 已渲染的 label 部件数量，由 XhFormatInputLabel 在 setup 里同步登记、卸载时撤销；根的 aria-labelledby 据此决定指不指过去。 */
  labelCount: Ref<number>
  service: Service<FormatInputSchema>
  api: ComputedRef<FormatInputApi>
  /** 解析后的文案，给标准结构里的名字与说明用。 */
  translations: ComputedRef<FormatInputTranslations>
}

export function useFormatInput(
  props: FormatInputSchema['props'],
  onValueChange?: FormatInputSchema['props']['onValueChange'],
): FormatInputContext {
  const labelCount = ref(0)
  const service = useMachine(formatInputMachine, () => ({ ...props, labelled: labelCount.value > 0, onValueChange }))
  const api = computed(() => connectFormatInput(service, vueNormalize))
  const translations = computed(() => {
    void api.value
    return formatInputTranslations(service.prop)
  })
  return { labelCount, service, api, translations }
}
