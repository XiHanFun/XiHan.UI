import type { IdGenerator } from '@xihan-ui/core'
import { useId } from 'vue'

let fallbackSeq = 0

// 用 Vue 3.5 的 useId 提供 SSR 安全的 scope id。必须在 setup 期调用。
export function createVueIdGenerator(): IdGenerator {
  const base = useId() ?? `xh-f${++fallbackSeq}`
  return {
    scopeId: () => base,
    partId: (component, scopeId, part) => `${component}:${scopeId}:${part}`,
  }
}
