import { createNormalizer } from '@xihan-ui/core'

// 事件名归一为 on + 首字母大写 + 其余小写（onKeyDown → onKeydown），与 WC 适配器对齐
function normalizeEventKey(key: string): string {
  if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z')
    return `on${key[2]}${key.slice(3).toLowerCase()}`
  return key
}

// Vue 内建的布尔属性表里没有 inert，true 会被写成 inert="true"，而 WC 侧走 toggleAttribute
// 得到的是空串。属性在场即生效，两种写法行为一致，但两个适配器的 DOM 必须逐字一样。
const BOOLEAN_ATTRS = new Set(['inert'])

// 其余属性原样透传
export const vueNormalize = createNormalizer((props) => {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(props)) {
    const value = props[key]
    out[normalizeEventKey(key)] = BOOLEAN_ATTRS.has(key) && value === true ? '' : value
  }
  return out
})
