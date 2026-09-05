import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
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
  const loading = !!prop('loading')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const stateAttr = checked ? 'checked' : 'unchecked'

  const setChecked = (next: boolean): void => {
    if (next !== checked)
      send({ type: 'TOGGLE' })
  }

  return {
    checked,
    loading,
    setChecked,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'role': 'switch',
      'aria-checked': checked ? 'true' : 'false',
      // 提交中不算禁用：仍可聚焦，读屏经 aria-busy 知道在忙
      'aria-busy': loading ? 'true' : undefined,
      'disabled': disabled || undefined,
      // 只读不能用原生 disabled 表达：那会连焦点一起拿掉，且不再提交值
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-state': stateAttr,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      'onClick': () => {
        if (!disabled && !loading && !readOnly)
          send({ type: 'TOGGLE' })
      },
    }),
    getThumbProps: () => normalize.element({
      ...parts.thumb.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
    }),

    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // 没勾上就不带 name，整条不参与提交——与原生复选框一致
      name: checked ? prop('name') : undefined,
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
    }),
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
  }
}
