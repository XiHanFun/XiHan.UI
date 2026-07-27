import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CollapsibleApi, CollapsibleSchema } from './collapsible.types'
import { dataAttr } from '@xihan-ui/core'
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
      'data-disabled': dataAttr(disabled),
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-controls': ids.content,
      'aria-expanded': open ? 'true' : 'false',
      // 披露按钮是单体控件，用原生 disabled（与 Switch/Checkbox/Toggle 同）：
      // 只留 data-disabled 的话禁用态就只是样式，读屏照念"可展开"、键盘照聚焦，
      // 按下去却什么都不发生
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
