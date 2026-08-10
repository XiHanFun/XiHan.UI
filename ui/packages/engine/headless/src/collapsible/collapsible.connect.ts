import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { CollapsibleApi, CollapsibleSchema } from './collapsible.types'
import { dataAttr } from '@xihan-ui/kernel'
import { collapsibleAnatomy } from './collapsible.anatomy'

const parts = collapsibleAnatomy.build()

export function connectCollapsible<T extends PropTypes>(
  service: Service<CollapsibleSchema>,
  normalize: NormalizeProps<T>,
): CollapsibleApi<T> {
  const { state, prop, send, scope } = service
  const open = state.get() === 'open'
  const disabled = !!prop('disabled')
  const ids = scope.ids('collapsible', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-controls': ids.content,
      'aria-expanded': open ? 'true' : 'false',
      // 单体控件用原生 disabled，只留 data-disabled 的话禁用态只是样式
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'data-state': stateAttr,
      'hidden': !open || undefined,
    }),
  }
}
