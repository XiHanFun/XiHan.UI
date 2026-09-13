/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use diff view 相关实现。

import type { DiffViewApi, DiffViewSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectDiffView, diffViewMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = DiffViewSchema['props']

export interface DiffViewContext {
  api: ComputedRef<DiffViewApi>
}

export function useDiffView(props: Props, onExpandedValueChange?: Props['onExpandedValueChange']): DiffViewContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(diffViewMachine, () => ({ ...props, onExpandedValueChange }), scope)
  const api = computed(() => connectDiffView(service, vueNormalize))
  return { api }
}
