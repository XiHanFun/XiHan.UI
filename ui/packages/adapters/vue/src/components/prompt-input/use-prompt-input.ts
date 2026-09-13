/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use prompt input 相关实现。

import type { PromptInputApi, PromptInputSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectPromptInput, promptInputMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = PromptInputSchema['props']

export interface PromptInputCallbacks {
  onValueChange?: Props['onValueChange']
  onSubmit?: Props['onSubmit']
  onStop?: Props['onStop']
}

export interface PromptInputContext {
  api: ComputedRef<PromptInputApi>
}

export function usePromptInput(props: Props, callbacks: PromptInputCallbacks = {}): PromptInputContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 回调由组件外壳或调用方提供，随 props 一并传给机器；整台机器不碰 DOM，不需要 RuntimeConfig
  const service = useMachine(promptInputMachine, () => ({ ...props, ...callbacks }), scope)
  const api = computed(() => connectPromptInput(service, vueNormalize))
  return { api }
}
