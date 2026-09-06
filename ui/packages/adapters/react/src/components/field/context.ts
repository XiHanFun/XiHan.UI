import type { FieldApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface FieldContextValue {
  api: FieldApi
}

const FieldContext = createContext<FieldContextValue | undefined>(undefined)

export const FieldContextProvider = FieldContext

/** 不在字段里时返回 undefined，薄封装照样能单独用。 */
export function useOptionalFieldContext(): FieldContextValue | undefined {
  return useContext(FieldContext)
}
