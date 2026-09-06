import type { FormContext } from './use-form'
import { createContext, useContext } from 'react'

const Ctx = createContext<FormContext | undefined>(undefined)

export const FormProvider = Ctx

export function useFormContext(): FormContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhForm 的部件要放在 XhFormRoot 里')
  return ctx
}

/** 表单外也能用的部件（如 Field）从这里拿：不在表单里就是 undefined。 */
export function useOptionalFormContext(): FormContext | undefined {
  return useContext(Ctx)
}

/** 字段容器把字段名交给后代：Field 据此从表单上下文自取校验态。 */
export interface FormFieldHandle {
  name: string
}

const FieldCtx = createContext<FormFieldHandle | undefined>(undefined)

export const FormFieldProvider = FieldCtx

export function useOptionalFormField(): FormFieldHandle | undefined {
  return useContext(FieldCtx)
}
