import type { NormalizeProps, PropTypes, Scope } from '@xihan-ui/core'
import type { FieldApi, FieldProps } from './field.types'
import { dataAttr } from '@xihan-ui/core'
import { fieldAnatomy } from './field.anatomy'

const parts = fieldAnatomy.build()

// Field 无状态机：纯装配，属性全部来自 props。
// 把 label / description / error-text 的 id 串到控件上，表单页不必再逐个手写 aria-describedby。
export function connectField<T extends PropTypes>(
  props: FieldProps,
  scope: Scope,
  normalize: NormalizeProps<T>,
): FieldApi<T> {
  const invalid = !!props.invalid
  const required = !!props.required
  const disabled = !!props.disabled
  const ids = scope.ids('field', 'label', 'control', 'description', 'error-text')
  // 作者接管 id 时以作者的为准，label 的 for 随之改写，两者始终对得上
  const controlId = props.controlId ?? ids.control
  // 错误文案只在 invalid 时进描述链：非 invalid 时它是 hidden 的空节点，
  // 常挂进 aria-describedby 会让读屏念出一段并不存在的错误
  const describedBy = invalid ? `${ids.description} ${ids['error-text']}` : ids.description

  return {
    invalid,
    required,
    disabled,
    controlId,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
    }),
    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      // 自带 id：控件不是原生表单元素时（for 不生效）作者可改用 aria-labelledby 指过来
      'id': ids.label,
      'for': controlId,
      'data-disabled': dataAttr(disabled),
    }),
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'id': controlId,
      'aria-describedby': describedBy,
      // 显式 true/false：读屏对"属性缺席"与"值为 false"的播报不同，缺席会被当成未声明
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
    }),
    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      'id': ids.description,
      'data-disabled': dataAttr(disabled),
    }),
    getErrorTextProps: () => normalize.element({
      ...parts['error-text'].attrs,
      id: ids['error-text'],
      // role=alert：invalid 翻转那刻节点显出，读屏立即播报错误
      role: 'alert',
      hidden: !invalid || undefined,
    }),
  }
}
