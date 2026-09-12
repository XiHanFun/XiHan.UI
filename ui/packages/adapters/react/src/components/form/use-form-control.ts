import type { FormControlState } from '@xihan-ui/headless'
import { resolveFormControlState } from '@xihan-ui/headless'
import { useOptionalFieldContext } from '../field/context'
import { useOptionalFormContext, useOptionalFormField } from './context'

/**
 * 只负责 React Context 接线；四轴优先级由 headless 的 resolveFormControlState 统一定义。
 * Field 是最近一层继承源；没有 Field 时，FormFieldGroup 才直接把 Form 状态下传给控件。
 */
export function useFormControlProps<T extends FormControlState>(props: T): T {
  const form = useOptionalFormContext()
  const handle = useOptionalFormField()
  const field = useOptionalFieldContext()

  const fieldState: FormControlState | undefined = field
    ? {
        disabled: field.api.disabled,
        readOnly: field.api.readOnly,
        required: field.api.required,
        invalid: field.api.invalid,
      }
    : undefined
  const formState: FormControlState | undefined = form && handle
    ? {
        disabled: form.api.disabled,
        readOnly: form.api.readOnly,
        required: form.api.isFieldRequired(handle.name),
        invalid: form.api.isFieldInvalid(handle.name),
      }
    : undefined

  return { ...props, ...resolveFormControlState(props, fieldState, formState) }
}
