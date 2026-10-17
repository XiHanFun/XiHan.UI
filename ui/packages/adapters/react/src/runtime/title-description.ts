/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标题与说明两个可选部件的在场统计：部件自行登记，根把结果交给 connect。

import type { TitleDescriptionParts } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { hasNamingContent } from '@xihan-ui/headless'
import { useCallback, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from './layout-effect'

export type TitleDescriptionPart = keyof TitleDescriptionParts

export interface TitleDescriptionPresence {
  /** 交给 connect 的在场情况；根的 layout effect 跑过之前（首帧、服务端直出）为 undefined，按都在场处理。 */
  parts: TitleDescriptionParts | undefined
  /** 部件登记在场，返回撤销函数。 */
  register: (part: TitleDescriptionPart) => () => void
}

const NO_PARTS: Record<TitleDescriptionPart, number> = { title: 0, description: 0 }

/** 在根的 hook 里调用；部件在 layout effect 里登记，子部件先于根。 */
export function useTitleDescriptionPresence(): TitleDescriptionPresence {
  const [counts, setCounts] = useState(NO_PARTS)
  const [mounted, setMounted] = useState(false)
  useIsomorphicLayoutEffect(() => setMounted(true), [])
  const register = useCallback((part: TitleDescriptionPart) => {
    setCounts(c => ({ ...c, [part]: c[part] + 1 }))
    return () => setCounts(c => ({ ...c, [part]: c[part] - 1 }))
  }, [])
  const parts = mounted ? { title: counts.title > 0, description: counts.description > 0 } : undefined
  return { parts, register }
}

/** 部件挂载期间登记在场，卸载时撤销；present 给出时每次渲染后现判。 */
export function useTitleDescriptionPart(presence: TitleDescriptionPresence, part: TitleDescriptionPart, present: () => boolean = () => true): void {
  const release = useRef<(() => void) | null>(null)
  const { register } = presence
  useIsomorphicLayoutEffect(() => {
    const next = present()
    if (next && !release.current) {
      release.current = register(part)
    }
    else if (!next && release.current) {
      release.current()
      release.current = null
    }
  })
  useIsomorphicLayoutEffect(() => () => {
    release.current?.()
    release.current = null
  }, [register, part])
}

/** 说明部件登记在场：读不出一句话的说明按不在场处理。返回要挂到说明节点上的 ref。 */
export function useDescriptionPart<E extends HTMLElement>(presence: TitleDescriptionPresence): RefObject<E | null> {
  const el = useRef<E | null>(null)
  useTitleDescriptionPart(presence, 'description', () => el.current != null && hasNamingContent(el.current))
  return el
}
