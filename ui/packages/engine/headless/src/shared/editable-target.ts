// 按键落在可编辑控件上时，不归外层那个键盘处理器管。
import { isHTMLElement } from '@xihan-ui/kernel'

/**
 * 这个事件目标是不是可编辑控件（或它的后代）。
 *
 * 集合型组件的键盘处理器常挂在容器上，容器里的输入框冒上来的按键也会经过它。
 * 不放行的话，在树节点或表格单元格里打一个空格会被当成「选中这一项」吞掉，
 * 打字会被连打检索吃掉。
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!isHTMLElement(target))
    return false
  return target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]') != null
}
