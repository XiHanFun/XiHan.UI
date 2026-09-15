/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use accordion 相关实现。

import type { RuntimeConfig } from '@xihan-ui/core'
import type { AccordionApi, AccordionSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { accordionMachine, connectAccordion } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface AccordionContext {
  api: ComputedRef<AccordionApi>
  /** 每个面板各自建立退场闸门，共用这一份运行期配置；服务端为 null，闸门退化为跟随展开态。 */
  config: RuntimeConfig | null
}

export function useAccordion(
  props: AccordionSchema['props'],
  onValueChange?: AccordionSchema['props']['onValueChange'],
): AccordionContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(accordionMachine, () => ({ ...props, onValueChange }), scope)
  const api = computed(() => connectAccordion(service, vueNormalize))

  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined')
    config = createRuntimeConfig({ scope, idGenerator: idGen })

  return { api, config }
}
