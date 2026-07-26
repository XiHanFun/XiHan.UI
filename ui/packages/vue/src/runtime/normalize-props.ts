import { createNormalizer } from '@xihan-ui/core'

// 事件名归一：IR 里写 onKeyDown 还是 onKeydown，都必须落到同一个 DOM 事件。
// Vue 用 hyphenate 推导事件名（onKeyDown → 'key-down'，该事件永不触发），
// WC 的 spreader 取 on 之后全小写（onKeyDown → 'keydown'）——同一份 IR 在两个适配器上
// 绑到不同事件，且 Vue 侧是静默失效。这里按 WC 的规则对齐：首字母保留大写
// （Vue 判定事件 prop 要求 on 后接非小写字母），其余小写，hyphenate 结果即与 WC 一致。
function normalizeEventKey(key: string): string {
  if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z')
    return `on${key[2]}${key.slice(3).toLowerCase()}`
  return key
}

// 其余（class / data-* / aria-* / tabindex / style）Vue 直接接受 IR，透传即可。
export const vueNormalize = createNormalizer((props) => {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(props)) out[normalizeEventKey(key)] = props[key]
  return out
})
