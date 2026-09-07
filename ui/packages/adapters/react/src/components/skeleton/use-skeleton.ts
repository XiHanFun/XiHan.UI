import type { SkeletonApi, SkeletonProps } from '@xihan-ui/headless'
import { connectSkeleton } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'

export interface SkeletonContext {
  api: SkeletonApi
}

// Skeleton 没有状态机也不派生部件 id，props 变了就整份重算属性
export function useSkeleton(props: SkeletonProps): SkeletonContext {
  return { api: connectSkeleton(props, reactNormalize) }
}
