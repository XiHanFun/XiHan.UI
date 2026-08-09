import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { SwitchApi, SwitchSchema } from './switch.types'
import { dataAttr } from '@xihan-ui/core'
import { switchAnatomy } from './switch.anatomy'

const parts = switchAnatomy.build()

export function connectSwitch<T extends PropTypes>(
  service: Service<SwitchSchema>,
  normalize: NormalizeProps<T>,
): SwitchApi<T> {
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
      'role': 'switch',
      'aria-checked': checked ? 'true' : 'false',
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),
    getThumbProps: () => normalize.element({
      ...parts.thumb.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
  }
}
