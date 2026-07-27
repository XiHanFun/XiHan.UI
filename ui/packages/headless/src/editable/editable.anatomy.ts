import { createAnatomy } from '@xihan-ui/core'

// area 是"同一处的两种形态"的容器：preview 与 input 同时挂着，谁不当值谁带 hidden。
// control 是三个按钮的容器：预览态露出 edit-trigger，编辑态露出 submit/cancel-trigger。
// 两个容器都不承担行为，只是让作者有个稳定的排版落点——没有它们，
// 皮肤就得去假设作者自己写的那层包裹长什么样。
export const editableAnatomy = createAnatomy('editable', [
  'root',
  'label',
  'area',
  'preview',
  'input',
  'edit-trigger',
  'submit-trigger',
  'cancel-trigger',
  'control',
])
