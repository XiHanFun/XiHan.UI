/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use fieldset 相关实现。

import type { FieldsetApi, FieldsetProps, FieldsetRenderedParts } from '@xihan-ui/headless'
import { connectFieldset } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'

/** 字段集里登记在场的部件名。 */
export type FieldsetPartName = keyof FieldsetRenderedParts

export interface FieldsetContext {
  api: FieldsetApi
  /** 部件登记在场，返回撤销函数。 */
  registerPart: (part: FieldsetPartName) => () => void
}

const NO_PARTS: Record<FieldsetPartName, number> = { description: 0, errorText: 0 }

/**
 * Fieldset 无状态机：一份实例级 scope 派生 part id，属性每帧由 connect 现算。
 * 部件在 layout effect 里登记，子部件先于根；根的 layout effect 跑过之前（首帧、服务端直出）按都在场处理。
 */
export function useFieldset(props: FieldsetProps): FieldsetContext {
  const scope = useReactScope()
  const [counts, setCounts] = useState(NO_PARTS)
  const [mounted, setMounted] = useState(false)
  useIsomorphicLayoutEffect(() => setMounted(true), [])
  const registerPart = useCallback((part: FieldsetPartName) => {
    setCounts(c => ({ ...c, [part]: c[part] + 1 }))
    return () => setCounts(c => ({ ...c, [part]: c[part] - 1 }))
  }, [])
  const parts: FieldsetRenderedParts | undefined = mounted
    ? { description: counts.description > 0, errorText: counts.errorText > 0 }
    : undefined
  return { api: connectFieldset({ ...props, parts }, scope, reactNormalize), registerPart }
}

/** 部件挂载期间登记在场，卸载时撤销；present 给出时每次渲染后现判（说明读不出一句话时不算在场）。 */
export function useFieldsetPartPresence(ctx: FieldsetContext, part: FieldsetPartName, present: () => boolean = () => true): void {
  const release = useRef<(() => void) | null>(null)
  const { registerPart } = ctx
  useIsomorphicLayoutEffect(() => {
    const next = present()
    if (next && !release.current) {
      release.current = registerPart(part)
    }
    else if (!next && release.current) {
      release.current()
      release.current = null
    }
  })
  useIsomorphicLayoutEffect(() => () => {
    release.current?.()
    release.current = null
  }, [registerPart, part])
}
