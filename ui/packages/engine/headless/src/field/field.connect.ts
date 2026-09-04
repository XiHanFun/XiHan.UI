import type { NormalizeProps, PropTypes, Scope } from '@xihan-ui/kernel'
import type { FieldApi, FieldProps } from './field.types'
import { getTabbables } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
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
  const readOnly = !!props.readOnly
  const ids = scope.ids('field', 'label', 'control', 'description', 'error-text')
  // 作者接管 id 时以作者的为准，label 的 for 随之改写
  const controlId = props.controlId ?? ids.control
  // 错误文案只在 invalid 时进描述链
  const describedBy = invalid ? `${ids.description} ${ids['error-text']}` : ids.description

  return {
    invalid,
    required,
    disabled,
    readOnly,
    controlId,
    labelId: ids.label,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
    }),
    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      // 自带 id，供 for 不生效时改用 aria-labelledby 指过来
      'id': ids.label,
      'for': controlId,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      // for 只对可标注元素生效，而作者把 control 标在 div 上是常态（包一层再放真控件）。
      // 那种情形下点标题聚不了焦，且不报错——替它把焦点送给里面第一个可 tab 的节点。
      // 控件根本身就是真控件时这里查的是它的子节点，查不到东西，浏览器的 for 照旧管用。
      'onClick': () => {
        const control = scope.getById(controlId)
        if (control)
          getTabbables(control)[0]?.focus()
      },
    }),
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'id': controlId,
      // label 的 for 只对可标注元素生效，而作者把 control 标在 div 上是常态
      // （包一层再放原生控件）。那种情形下 for 静默失效，靠这条把名字接回来。
      'aria-labelledby': ids.label,
      'aria-describedby': describedBy,
      // 显式 true/false，不靠属性缺席表达
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),
    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      'id': ids.description,
      'data-disabled': dataAttr(disabled),
    }),
    getErrorTextProps: () => normalize.element({
      ...parts['error-text'].attrs,
      'id': ids['error-text'],
      // invalid 翻转时排队播报，不打断当前朗读：一次提交失败会有多个字段同时翻转，
      // 打断式活区只留给表单那一处错误摘要。这段文案同时挂在控件的描述链上，
      // 焦点落到控件时读屏会再念一遍。
      // live 值显式写出：role 隐含的 live 各家读屏落实并不一致
      'role': 'status',
      'aria-live': 'polite',
      // 整句一起念，否则用户只听到半截
      'aria-atomic': 'true',
      'hidden': !invalid || undefined,
    }),
  }
}
