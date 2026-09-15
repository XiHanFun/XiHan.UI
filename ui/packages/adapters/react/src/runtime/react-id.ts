/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 react id 相关实现。

import type { IdGenerator, Scope } from '@xihan-ui/core'
import { createScope } from '@xihan-ui/core'
import { useId, useMemo } from 'react'

/** 用 React 的 useId 作为 scope 的基名。 */
export function useReactIdGenerator(): IdGenerator {
  const base = useId()
  return useMemo<IdGenerator>(() => ({
    scopeId: () => base,
    partId: (component, scopeId, part) => `${component}:${scopeId}:${part}`,
  }), [base])
}

/**
 * 组件该实例的 scope。
 * createScope 在构造时就固定 scopeId，因此必须记住该实例，
 * 每帧新建会使 aria-controls / aria-labelledby 每帧改变指向。
 */
export function useReactScope(): Scope {
  const idGen = useReactIdGenerator()
  return useMemo(() => createScope(null, idGen), [idGen])
}
