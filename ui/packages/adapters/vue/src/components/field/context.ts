import type { InjectionKey } from 'vue'
import type { FieldContext } from './use-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FieldContext> = Symbol('xh-field')

export function provideField(ctx: FieldContext): void {
  provide(KEY, ctx)
}

/** 字段外调用时返回 null，供薄封装在字段内外都能安全使用。 */
export function useOptionalFieldContext(): FieldContext | null {
  return inject(KEY, null)
}

export function useFieldContext(): FieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Field 部件必须用在 XhFieldRoot 内')
  return ctx
}
