// 多行输入的自动高度：按内容量高，行数上下限换算成像素后夹取。纯 DOM 运算，不看状态机。
import type { TextFieldAutoSize } from './text-field.types'

/**
 * 量一次并写回 block-size：先归零再读 scrollHeight，行数界限按当下行高换算。
 * autoSize 为 false 时什么都不做；顶到 maxRows 后内部滚动。
 */
export function autoSizeTextarea(el: HTMLTextAreaElement, autoSize: boolean | TextFieldAutoSize | undefined): void {
  if (!autoSize)
    return
  const opts = autoSize === true ? {} : autoSize
  const view = el.ownerDocument.defaultView
  if (!view)
    return
  const style = view.getComputedStyle(el)
  const line = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2 || 20
  const padding = (Number.parseFloat(style.paddingBlockStart) || 0) + (Number.parseFloat(style.paddingBlockEnd) || 0)
  const border = (Number.parseFloat(style.borderBlockStartWidth) || 0) + (Number.parseFloat(style.borderBlockEndWidth) || 0)

  el.style.blockSize = 'auto'
  const content = el.scrollHeight + border
  const min = opts.minRows != null ? opts.minRows * line + padding + border : null
  const max = opts.maxRows != null ? opts.maxRows * line + padding + border : null
  let next = content
  if (min != null)
    next = Math.max(next, min)
  if (max != null)
    next = Math.min(next, max)
  el.style.blockSize = `${next}px`
  el.style.overflowY = max != null && content > max ? 'auto' : 'hidden'
}
