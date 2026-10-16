/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 form control host 相关实现。

import type { FormControlState } from '@xihan-ui/headless'

/** 能接收最近 Form/Field 状态的非 Portal 表单控件宿主。 */
export interface FormControlHost extends HTMLElement {
  setFormControlState: (state: FormControlState | undefined) => void
}

/**
 * 库内控件声明的字段接线目标：放进 `<xh-field>` 时字段接线并进哪几个部件。
 * state 并进描述链与校验、必填、只读三态，group 只并进描述链；两种都把字段标签并进名字链。
 */
export interface FieldTarget {
  readonly parts: readonly string[]
  readonly kind: 'state' | 'group'
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
  'xh-date-picker',
  'xh-date-range-picker',
  'xh-time-picker',
  'xh-time-range-picker',
  'xh-color-picker',
  'xh-color-field',
  'xh-color-slider',
  'xh-color-swatch-picker',
  'xh-mention',
  'xh-password-input',
  'xh-pin-input',
  'xh-date-field',
  'xh-time-field',
  'xh-editable',
  'xh-tags-input',
  'xh-checkbox-group',
  'xh-slider',
  'xh-rating',
  'xh-toggle-group',
  'xh-transfer',
  'xh-field-array',
  'xh-file-upload',
  'xh-image-cropper',
  'xh-signature-pad',
  'xh-listbox',
  'xh-tag-group',
].join(', ')
