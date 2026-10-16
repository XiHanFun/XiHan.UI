/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use field 相关实现。

import type { FieldApi, FieldProps, FieldRenderedParts } from '@xihan-ui/headless'
import { connectField } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'

/** 字段里登记在场的部件名。 */
export type FieldPartName = keyof FieldRenderedParts

export interface FieldContext {
  api: FieldApi
  /** 部件登记在场，返回撤销函数。 */
  registerPart: (part: FieldPartName) => () => void
}

const NO_PARTS: Record<FieldPartName, number> = { label: 0, description: 0, errorText: 0 }

/**
 * Field 没有状态机：一份实例级 scope 派生部件 id，属性每帧由 connect 现算。
 * 部件在 layout effect 里登记，子部件先于根；根的 layout effect 跑过之前（首帧、服务端直出）按都在场处理。
 */
export function useField(props: FieldProps): FieldContext {
  const scope = useReactScope()
  const [counts, setCounts] = useState(NO_PARTS)
  const [mounted, setMounted] = useState(false)
  useIsomorphicLayoutEffect(() => setMounted(true), [])
  const registerPart = useCallback((part: FieldPartName) => {
    setCounts(c => ({ ...c, [part]: c[part] + 1 }))
    return () => setCounts(c => ({ ...c, [part]: c[part] - 1 }))
  }, [])
  const parts: FieldRenderedParts | undefined = mounted
    ? { label: counts.label > 0, description: counts.description > 0, errorText: counts.errorText > 0 }
    : undefined
  return { api: connectField({ ...props, parts }, scope, reactNormalize), registerPart }
}

/**
 * 部件挂载期间登记在场，卸载时撤销；present 给出时每次渲染后现判（说明没有文字时不算在场）。
 * 控件的名字链与描述链只收登记在场的部件 id。
 */
export function useFieldPartPresence(ctx: FieldContext, part: FieldPartName, present: () => boolean = () => true): void {
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
