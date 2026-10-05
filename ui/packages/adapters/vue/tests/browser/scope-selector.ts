import { SCOPE_CLASS_PREFIX } from '@xihan-ui/core'

const MOUNT_CLASS = new RegExp(`\\.${SCOPE_CLASS_PREFIX}([a-z][a-z0-9-]*)`, 'g')

/**
 * 样式表里读出的选择器换回皮肤源文件的写法：产物把 `[data-scope='x']` 换成了挂载类 `.xh-scope-x`，
 * 按源文件写法解析的推导（与静态门禁同一份键）先换回 `[data-scope="x"]`。
 * 挂载类与 data-scope 一一对应，换回去命中的还是同一批节点。
 */
export function sourceSelector(selectorText: string): string {
  return selectorText.replace(MOUNT_CLASS, '[data-scope="$1"]')
}
