import type { SkeletonApi, SkeletonProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectSkeleton } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface SkeletonContext {
  api: ComputedRef<SkeletonApi>
}

// Skeleton 无状态机，props 变了由 computed 重算属性
export function useSkeleton(props: SkeletonProps): SkeletonContext {
  const api = computed(() => connectSkeleton(props, vueNormalize))
  return { api }
}
