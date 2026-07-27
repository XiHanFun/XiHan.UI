import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
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
 * 打开系统文件选择框只能靠 `input.click()`，那是一次 DOM 操作，连接层是纯函数做不了，
 * 只能放在机器的 action 里按 id 把节点找回来。连接层写这个 id、机器读这个 id，
 * 两处各写一遍迟早写歪，因此收口成同一个函数。
 */
export function fileUploadHiddenInputId(scope: Scope): string {
  return scope.partId(fileUploadAnatomy.name, 'hidden-input')
}
