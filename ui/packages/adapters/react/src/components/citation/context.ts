/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 上下文。

import type { CitationSourceItemProps } from '@xihan-ui/headless'
import type { CitationContext } from './use-citation'
import { createContext, useContext } from 'react'

const Context = createContext<CitationContext | undefined>(undefined)
const SourceContext = createContext<CitationSourceItemProps | undefined>(undefined)

export const CitationProvider = Context
export const CitationSourceProvider = SourceContext

export function useCitationContext(): CitationContext {
  const context = useContext(Context)
  if (!context)
    throw new Error('XhCitation 的部件要放在 XhCitationRoot 内')
  return context
}

export function useCitationSource(): CitationSourceItemProps {
  const source = useContext(SourceContext)
  if (!source)
    throw new Error('Citation 来源子部件要放在 XhCitationSource 内')
  return source
}
