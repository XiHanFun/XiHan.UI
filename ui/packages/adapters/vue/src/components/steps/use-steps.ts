/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use steps 相关实现。

import type { Service } from '@xihan-ui/core'
import type { StepsApi, StepsSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectSteps, stepsMachine } from '@xihan-ui/headless'
import { computed, onMounted, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface StepsContext {
  api: ComputedRef<StepsApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<StepsSchema>
  /** 已挂载的步骤面板块数：面板自行登记，一块都没有时触发器不写 aria-controls。 */
  contents: Ref<number>
}

export function useSteps(
  props: StepsSchema['props'],
  onValueChange?: StepsSchema['props']['onValueChange'],
): StepsContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const contents = ref(0)
  // 根挂上之前（含服务端直出）还数不出面板，按在场处理
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  const service = useMachine(stepsMachine, () => ({ ...props, onValueChange, parts: mounted.value ? { content: contents.value > 0 } : undefined }), scope)
  const api = computed(() => connectSteps(service, vueNormalize))
  return { api, service, contents }
}
