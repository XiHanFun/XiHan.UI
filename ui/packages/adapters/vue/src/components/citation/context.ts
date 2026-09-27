/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 上下文。

import type { CitationSourceItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CitationContext } from './use-citation'
import { inject, provide } from 'vue'

const KEY: InjectionKey<CitationContext> = Symbol.for('xh-citation')
const SOURCE_KEY: InjectionKey<ComputedRef<CitationSourceItemProps>> = Symbol.for('xh-citation-source')

export function provideCitation(context: CitationContext): void {
  provide(KEY, context)
}

export function useCitationContext(): CitationContext {
  const context = inject(KEY, null)
  if (!context)
    throw new Error('[xh] Citation 部件必须用在 XhCitationRoot 内')
  return context
}

export function provideCitationSource(source: ComputedRef<CitationSourceItemProps>): void {
  provide(SOURCE_KEY, source)
}

export function useCitationSource(): ComputedRef<CitationSourceItemProps> {
  const source = inject(SOURCE_KEY, null)
  if (!source)
    throw new Error('[xh] Citation 来源子部件必须用在 XhCitationSource 内')
  return source
}
