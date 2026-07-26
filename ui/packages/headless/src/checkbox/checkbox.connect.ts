import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CheckboxApi, CheckboxSchema } from './checkbox.types'
import { dataAttr } from '@xihan-ui/core'
import { checkboxAnatomy } from './checkbox.anatomy'

const parts = checkboxAnatomy.build()

export function connectCheckbox<T extends PropTypes>(
  service: Service<CheckboxSchema>,
  normalize: NormalizeProps<T>,
): CheckboxApi<T> {
  const { state, prop, send } = service
  const checked = state.get() === 'on'
  const disabled = !!prop('disabled')
  const stateAttr = checked ? 'checked' : 'unchecked'

  const setChecked = (next: boolean): void => {
    if (next !== checked)
      send({ type: 'TOGGLE' })
  }

  return {
    checked,
    setChecked,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'role': 'checkbox',
      'aria-checked': checked ? 'true' : 'false',
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'data-state': stateAttr,
      'aria-hidden': 'true',
    }),
  }
}
