import type { EmptyStateApi, EmptyStateProps } from '@xihan-ui/headless'
import { connectEmptyState } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'

export interface EmptyStateContext {
  api: EmptyStateApi
}

// EmptyState 没有状态机也不派生部件 id，props 变了就整份重算属性
export function useEmptyState(props: EmptyStateProps): EmptyStateContext {
  return { api: connectEmptyState(props, reactNormalize) }
}
