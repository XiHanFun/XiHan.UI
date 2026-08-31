import type { MarkdownStreamApi, MarkdownStreamProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectMarkdownStream } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface MarkdownStreamContext {
  api: ComputedRef<MarkdownStreamApi>
}

// 无状态机，也没有 part id 要派生：props 变了由 computed 重算属性
export function useMarkdownStream(props: MarkdownStreamProps): MarkdownStreamContext {
  const api = computed(() => connectMarkdownStream(props, vueNormalize))
  return { api }
}
