import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
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
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
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
      // 只读不能用原生 disabled 表达：那会连焦点一起拿掉，且不再提交值
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-state': stateAttr,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      'onClick': () => {
        if (!disabled && !readOnly)
          send({ type: 'TOGGLE' })
      },
    }),
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'data-state': stateAttr,
      'aria-hidden': true,
    }),

    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // 半选按未勾处理：原生里 indeterminate 只是外观，提交与否看 checked
      name: checked === true ? prop('name') : undefined,
      value: prop('value') ?? 'on',
      // 单体控件用原生 disabled，禁用时不提交值
      disabled: disabled || undefined,
    }),
    // <label> 包住 <button>：button 是 labelable 元素，点文字即激活它，可及名也从这里取
    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'data-state': stateAttr,
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
    }),
  }
}
