/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use citation 相关实现。

import type { Service } from '@xihan-ui/core'
import type { CitationApi, CitationSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { citationMachine, connectCitation } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface CitationContext {
  api: ComputedRef<CitationApi>
  service: Service<CitationSchema>
}

export function useCitation(props: CitationSchema['props']): CitationContext {
  const service = useMachine(citationMachine, () => props)
  return { api: computed(() => connectCitation(service, vueNormalize)), service }
}
