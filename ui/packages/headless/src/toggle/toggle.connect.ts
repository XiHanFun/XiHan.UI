import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ToggleApi, ToggleSchema } from './toggle.types'
import { dataAttr } from '@xihan-ui/core'
import { toggleAnatomy } from './toggle.anatomy'

const parts = toggleAnatomy.build()

export function connectToggle<T extends PropTypes>(
  service: Service<ToggleSchema>,
  normalize: NormalizeProps<T>,
): ToggleApi<T> {
  const { state, prop, send } = service
  const pressed = state.get() === 'on'
  const disabled = !!prop('disabled')

  const setPressed = (next: boolean): void => {
    if (next !== pressed)
      send({ type: 'TOGGLE' })
  }

  return {
    pressed,
    setPressed,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'aria-pressed': pressed ? 'true' : 'false',
      'disabled': disabled || undefined,
      'data-state': pressed ? 'on' : 'off',
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),
  }
}
