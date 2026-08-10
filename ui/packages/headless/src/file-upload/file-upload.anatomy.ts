import type { Scope } from '@xihan-ui/kernel'
import { createAnatomy } from '@xihan-ui/kernel'

// data-part 用 kebab-case，与 CSS 选择器一致。
export const fileUploadAnatomy = createAnatomy('file-upload', [
  'root',
  'label',
  'dropzone',
  'trigger',
  'hidden-input',
  'item-group',
  'item',
  'item-name',
  'item-size-text',
  'item-preview',
  'item-delete-trigger',
  'clear-trigger',
])

/**
 * 隐藏输入的 id。
 *
 * 连接层写入此 id，机器的 openFilePicker action 按此 id 找回节点，两处必须同源。
 */
export function fileUploadHiddenInputId(scope: Scope): string {
  return scope.partId(fileUploadAnatomy.name, 'hidden-input')
}
