import type { InjectionKey } from 'vue'
import type { EditableContext } from './use-editable'
import { inject, provide } from 'vue'

const KEY: InjectionKey<EditableContext> = Symbol.for('xh-editable')

export function provideEditable(ctx: EditableContext): void {
  provide(KEY, ctx)
}

export function useEditableContext(): EditableContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Editable 部件必须用在 XhEditableRoot 内')
  return ctx
}
