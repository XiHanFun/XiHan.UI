/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use markdown stream 相关实现。

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
