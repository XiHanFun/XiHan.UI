import type { FormControlState } from '@xihan-ui/headless'

/** 能接收最近 Form/Field 状态的非 Portal 表单控件宿主。 */
export interface FormControlHost extends HTMLElement {
  setFormControlState: (state: FormControlState | undefined) => void
}

/** Form/Field 只发现这一组已接入 FormControlContext 的 Light-DOM 宿主。 */
export const FORM_CONTROL_HOST_SELECTOR = [
  'xh-text-field',
  'xh-checkbox',
  'xh-switch',
  'xh-radio-group',
  'xh-number-field',
  'xh-select',
  'xh-cascader',
  'xh-combobox',
  'xh-tree-select',
  'xh-password-input',
  'xh-pin-input',
  'xh-date-field',
  'xh-time-field',
  'xh-editable',
  'xh-tags-input',
  'xh-checkbox-group',
  'xh-slider',
].join(', ')
