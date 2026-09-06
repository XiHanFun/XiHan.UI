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
 * 组件这一实例的 scope。
 * createScope 在构造时就把 scopeId 冻住，所以必须记住这一个实例，
 * 每帧新建会让 aria-controls / aria-labelledby 每帧改指向。
 */
export function useReactScope(): Scope {
  const idGen = useReactIdGenerator()
  return useMemo(() => createScope(null, idGen), [idGen])
}
