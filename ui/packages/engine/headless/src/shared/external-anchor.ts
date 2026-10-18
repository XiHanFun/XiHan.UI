/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供外部锚点相关实现。

import type { Cleanup, Dep } from '@xihan-ui/core'

/** 浮层在外部锚点上代写的读屏属性。 */
const ANCHOR_ARIA = ['aria-haspopup', 'aria-expanded', 'aria-controls'] as const

/** 外部锚点读屏属性效应的入参。 */
export interface ExternalAnchorAriaOptions {
  /** 当前的外部锚点；没给即不写。 */
  anchor: () => HTMLElement | null | undefined
  /** 浮层是否逻辑展开。 */
  open: () => boolean
  /** aria-haspopup 的值。 */
  haspopup: 'dialog' | 'menu'
  /** aria-controls 指向的浮层 id。 */
  controls: () => string
  /** 机器的依赖追踪，取效应参数里的 track。 */
  track: (deps: Dep[], fn: () => void) => void
}

/**
 * 外部锚点（anchor prop）上的读屏属性：展开期间写 aria-haspopup、aria-expanded="true" 与 aria-controls，
 * 收起、换锚点或效应拆除时把这三条还原成写之前的值（原先没有就撤掉）。
 * trigger 部件上的这三条照旧由 connect 产出，不归这里。
 */
export function trackExternalAnchorAria(o: ExternalAnchorAriaOptions): Cleanup {
  let held: { el: HTMLElement, saved: (string | null)[] } | null = null
  let disposed = false

  const release = (): void => {
    if (!held)
      return
    const { el, saved } = held
    held = null
    ANCHOR_ARIA.forEach((name, index) => {
      const value = saved[index]
      if (value == null)
        el.removeAttribute(name)
      else
        el.setAttribute(name, value)
    })
  }

  const sync = (): void => {
    if (disposed)
      return
    const el = o.open() ? (o.anchor() ?? null) : null
    if (held && held.el !== el)
      release()
    if (!el)
      return
    held ??= { el, saved: ANCHOR_ARIA.map(name => el.getAttribute(name)) }
    el.setAttribute('aria-haspopup', o.haspopup)
    el.setAttribute('aria-expanded', 'true')
    el.setAttribute('aria-controls', o.controls())
  }

  o.track([o.anchor, o.open], sync)
  sync()
  return () => {
    disposed = true
    release()
  }
}
