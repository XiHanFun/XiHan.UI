import type { NormalizeProps, PropTypes, Scope } from '@xihan-ui/core'
import type { FieldsetApi, FieldsetProps } from './fieldset.types'
import { dataAttr } from '@xihan-ui/core'
import { fieldsetAnatomy } from './fieldset.anatomy'

const parts = fieldsetAnatomy.build()

// Fieldset 无状态机：把整组的禁用/无效/必填铺成属性，并把说明与错误文案接进 root 的描述链。
export function connectFieldset<T extends PropTypes>(
  props: FieldsetProps,
  scope: Scope,
  normalize: NormalizeProps<T>,
): FieldsetApi<T> {
  const disabled = !!props.disabled
  const invalid = !!props.invalid
  const required = !!props.required
  const ids = scope.ids('fieldset', 'description', 'error-text')
  // 错误文案只在 invalid 时进描述链
  const describedBy = invalid ? `${ids.description} ${ids['error-text']}` : ids.description

  return {
    disabled,
    invalid,
    required,
    // root 上的原生 disabled 会连坐组内每个表单控件，这条是浏览器给的，不用 aria-disabled 代替
    // （那只是说给读屏听，控件照样点得动）。aria-invalid / aria-required 在 group 角色上不被支持，
    // 一律不产出：无效与必填只走 data-*，读屏那一侧由错误文案与描述链承担。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'disabled': disabled || undefined,
      'aria-describedby': describedBy,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
    }),
    // 组名由原生 <legend> 给，不再另发 aria-labelledby：
    // 多写一份名字来源会与原生那份叠加，读屏把组名念两遍
    getLegendProps: () => normalize.element({
      ...parts.legend.attrs,
      'data-disabled': dataAttr(disabled),
    }),
    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      'id': ids.description,
      'data-disabled': dataAttr(disabled),
    }),
    getErrorTextProps: () => normalize.element({
      ...parts['error-text'].attrs,
      'id': ids['error-text'],
      // invalid 翻转时排队播报，不打断当前朗读：一次提交失败会有多组同时翻转，
      // 打断式活区只留给表单那一处错误摘要。这段文案同时挂在 root 的描述链上，
      // 焦点进组时读屏会再念一遍。
      // live 值显式写出：role 隐含的 live 各家读屏落实并不一致
      'role': 'status',
      'aria-live': 'polite',
      // 整句一起念，否则用户只听到半截
      'aria-atomic': 'true',
      'hidden': !invalid || undefined,
    }),
  }
}
