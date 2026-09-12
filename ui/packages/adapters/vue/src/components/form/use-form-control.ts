import type { FormControlState } from '@xihan-ui/headless'
import { resolveFormControlState } from '@xihan-ui/headless'
import { useOptionalFieldContext } from '../field/context'
import { useOptionalFormContext, useOptionalFormField } from './context'

const CONTROL_KEYS = new Set<keyof FormControlState>(['disabled', 'readOnly', 'required', 'invalid'])

/**
 * 只负责 Vue Context 接线；四轴优先级由 headless 的 resolveFormControlState 统一定义。
 * Field 是最近一层继承源；没有 Field 时，FormFieldGroup 才直接把 Form 状态下传给控件。
 */
export function useFormControlProps<T extends FormControlState>(props: T): T {
  const form = useOptionalFormContext()
  const handle = useOptionalFormField()
  const field = useOptionalFieldContext()

  const fieldState = (): FormControlState | undefined => {
    if (field) {
      const api = field.api.value
      return {
        disabled: api.disabled,
        readOnly: api.readOnly,
        required: api.required,
        invalid: api.invalid,
      }
    }
    return undefined
  }
  const formState = (): FormControlState | undefined => {
    if (!form || !handle)
      return undefined
    const api = form.api.value
    const name = handle.name()
    return {
      disabled: api.disabled,
      readOnly: api.readOnly,
      required: api.isFieldRequired(name),
      invalid: api.isFieldInvalid(name),
    }
  }

  return new Proxy(props, {
    get(target, key, receiver) {
      if (typeof key === 'string' && CONTROL_KEYS.has(key as keyof FormControlState))
        return resolveFormControlState(target, fieldState(), formState())[key as keyof FormControlState]
      return Reflect.get(target, key, receiver)
    },
  })
}
