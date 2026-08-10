import { createNormalizer } from '@xihan-ui/kernel'

// 事件名归一为 on + 首字母大写 + 其余小写（onKeyDown → onKeydown），与 WC 适配器对齐
function normalizeEventKey(key: string): string {
  if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z')
    return `on${key[2]}${key.slice(3).toLowerCase()}`
  return key
}

// 其余属性原样透传
export const vueNormalize = createNormalizer((props) => {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(props)) out[normalizeEventKey(key)] = props[key]
  return out
})
