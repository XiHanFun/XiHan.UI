import type { InjectionKey } from 'vue'
import type { FormContext } from './use-form'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FormContext> = Symbol.for('xh-form')

export function provideForm(ctx: FormContext): void {
  provide(KEY, ctx)
}

export function useFormContext(): FormContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Form 部件必须用在 XhFormRoot 内')
  return ctx
}

/** 表单外也能用的部件（如 Field）从这里拿：不在表单里就是 null。 */
export function useOptionalFormContext(): FormContext | null {
  return inject(KEY, null)
}

/** 字段容器把字段名交给后代：Field 据此从表单上下文自取校验态。 */
export interface FormFieldHandle {
  name: () => string
}

const FIELD_KEY: InjectionKey<FormFieldHandle> = Symbol.for('xh-form-field')

export function provideFormField(handle: FormFieldHandle): void {
  provide(FIELD_KEY, handle)
}

export function useOptionalFormField(): FormFieldHandle | null {
  return inject(FIELD_KEY, null)
}
