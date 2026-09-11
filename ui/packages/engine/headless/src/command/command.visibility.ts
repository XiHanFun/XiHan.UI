import { itemValue, queryItems } from '@xihan-ui/core'
import { commandItemQuery } from './command.anatomy'

/** 只记录已有条目在本列表内声明的 hidden；未挂载、虚拟化或面板外层的关闭状态不作推断。 */
export function hiddenCommandValues(list: HTMLElement | null): Set<string> {
  const hidden = new Set<string>()
  for (const item of queryItems(list, commandItemQuery)) {
    let node: HTMLElement | null = item
    while (node) {
      if (node.hidden) {
        const value = itemValue(item)
        if (value != null)
          hidden.add(value)
        break
      }
      if (node === list)
        break
      node = node.parentElement
    }
  }
  return hidden
}
