import { createAnatomy } from '@xihan-ui/kernel'

// area：preview 与 input 的容器，两者同时挂载，非当前形态的那个带 hidden。
// control：按钮容器，预览态露出 edit-trigger，编辑态露出 submit/cancel-trigger。
// 两者均不承担行为，只作排版落点。
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
