/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 vue id 相关实现。

import type { IdGenerator } from '@xihan-ui/core'
import { useId } from 'vue'

let fallbackSeq = 0

// 基于 Vue useId 生成 scope id，须在 setup 期调用
export function createVueIdGenerator(): IdGenerator {
  const base = useId() ?? `xh-f${++fallbackSeq}`
  return {
    scopeId: () => base,
    partId: (component, scopeId, part) => `${component}:${scopeId}:${part}`,
  }
}
