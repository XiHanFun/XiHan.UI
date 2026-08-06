import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CheckboxApi, CheckboxCheckedState, CheckboxSchema } from './checkbox.types'
import { dataAttr } from '@xihan-ui/core'
import { checkboxAnatomy } from './checkbox.anatomy'

const parts = checkboxAnatomy.build()

export function connectCheckbox<T extends PropTypes>(
  service: Service<CheckboxSchema>,
  normalize: NormalizeProps<T>,
): CheckboxApi<T> {
  const { state, prop, send } = service
  const current = state.get()
  const checked: CheckboxCheckedState = current === 'indeterminate' ? 'indeterminate' : current === 'on'
  const disabled = !!prop('disabled')
  const stateAttr = current === 'indeterminate' ? 'indeterminate' : current === 'on' ? 'checked' : 'unchecked'

  // 半选态下 TOGGLE 只表达得了「走向全选」，所以命令式设值走 CHECK / UNCHECK
  const setChecked = (next: boolean): void => {
    if (next !== checked)
      send({ type: next ? 'CHECK' : 'UNCHECK' })
  }

  return {
    checked,
    setChecked,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'role': 'checkbox',
      // 三态：勾了一部分的父项报 mixed，读屏才念得出「部分选中」
      'aria-checked': checked === 'indeterminate' ? 'mixed' : checked ? 'true' : 'false',
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
