import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { DialogApi, DialogSchema } from './dialog.types'
import { dialogAnatomy } from './dialog.anatomy'

const parts = dialogAnatomy.build()

export function connectDialog<T extends PropTypes>(
  service: Service<DialogSchema>,
  normalize: NormalizeProps<T>,
): DialogApi<T> {
  const { state, prop, send, scope } = service
  const open = state.get() === 'open'
  const modal = prop('modal') ?? true
  const role = prop('role') ?? 'dialog'
  const ids = scope.ids('dialog', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'TOGGLE' }),
    }),
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'data-state': stateAttr,
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-position': 'center',
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': role,
      'tabindex': -1,
      'aria-modal': modal ? 'true' : undefined,
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
    }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),
  }
}
