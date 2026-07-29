import type { NormalizeProps, PropTypes, Scope } from '@xihan-ui/core'
import type { FieldApi, FieldProps } from './field.types'
import { dataAttr } from '@xihan-ui/core'
import { fieldAnatomy } from './field.anatomy'

const parts = fieldAnatomy.build()

// Field 无状态机：把 label / description / error-text 的 id 串到控件上。
export function connectField<T extends PropTypes>(
  props: FieldProps,
  scope: Scope,
  normalize: NormalizeProps<T>,
): FieldApi<T> {
  const invalid = !!props.invalid
  const required = !!props.required
  const disabled = !!props.disabled
  const ids = scope.ids('field', 'label', 'control', 'description', 'error-text')
  // 作者接管 id 时以作者的为准，label 的 for 随之改写
  const controlId = props.controlId ?? ids.control
  // 错误文案只在 invalid 时进描述链
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
      // 自带 id，供 for 不生效时改用 aria-labelledby 指过来
      'id': ids.label,
      'for': controlId,
      'data-disabled': dataAttr(disabled),
    }),
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'id': controlId,
      'aria-describedby': describedBy,
      // 显式 true/false，不靠属性缺席表达
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
      // role=alert：invalid 翻转时读屏立即播报
      role: 'alert',
      hidden: !invalid || undefined,
    }),
  }
}
