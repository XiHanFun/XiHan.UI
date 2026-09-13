/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use spinner 相关实现。

import type { SpinnerApi, SpinnerProps } from '@xihan-ui/headless'
import { connectSpinner } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'

export interface SpinnerContext {
  api: SpinnerApi
}

// Spinner 没有状态机也不派生部件 id，props 变了就整份重算属性
export function useSpinner(props: SpinnerProps): SpinnerContext {
  return { api: connectSpinner(props, reactNormalize) }
}
