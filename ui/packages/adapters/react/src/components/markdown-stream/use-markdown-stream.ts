import type { MarkdownStreamApi, MarkdownStreamProps } from '@xihan-ui/headless'
import { connectMarkdownStream } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'

export interface MarkdownStreamContext {
  api: MarkdownStreamApi
}

// 无状态机，也没有 part id 要派生：props 变了由重渲重算属性
export function useMarkdownStream(props: MarkdownStreamProps): MarkdownStreamContext {
  return { api: connectMarkdownStream(props, reactNormalize) }
}
