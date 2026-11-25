/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 当前视口落在哪一档断点：读断点令牌、按 min-width 监听媒体查询，跨档时通知。

import type { Disposable } from '../../kernel'

/** 断点令牌的四档，由窄到宽。 */
export type BreakpointTier = 'sm' | 'md' | 'lg' | 'xl'

/** 当前所在的档：比 sm 还窄时是 base。 */
export type Breakpoint = 'base' | BreakpointTier

/** 断点令牌的四档，由窄到宽。 */
export const BREAKPOINT_TIERS: readonly BreakpointTier[] = ['sm', 'md', 'lg', 'xl']

export interface BreakpointObserverOptions {
  /** 读令牌与监听媒体查询的文档；不给即当前全局文档。 */
  doc?: Document
  /** 跨档时通知新的档；建立时不通知，初值读 current。 */
  onChange?: (breakpoint: Breakpoint) => void
}

export interface BreakpointObserver extends Disposable {
  /** 此刻所在的档。 */
  readonly current: Breakpoint
}

/**
 * 盯住视口宽度跨过断点令牌的那几下。宽度取文档根上的 `--xh-breakpoint-*` 计算值，与皮肤的断点同一份；
 * 令牌没引入（读到空串）时明确报错，不猜一个缺省宽度。媒体查询按 min-width 写，落在两档之间时取较窄那档，
 * 与皮肤「从窄到宽逐档覆盖」的写法一致。
 */
export function observeBreakpoint(options: BreakpointObserverOptions = {}): BreakpointObserver {
  const doc = options.doc ?? globalThis.document
  const win = doc?.defaultView
  if (!doc || !win)
    throw new Error('[xh] observeBreakpoint 需要带 Window 的 Document')
  if (typeof win.matchMedia !== 'function')
    throw new Error('[xh] observeBreakpoint 需要 Window.matchMedia')

  const style = win.getComputedStyle(doc.documentElement)
  const queries = BREAKPOINT_TIERS.map((tier) => {
    const width = style.getPropertyValue(`--xh-breakpoint-${tier}`).trim()
    if (!width)
      throw new Error(`[xh] 缺少断点令牌 --xh-breakpoint-${tier}：先引入 @xihan-ui/tokens/tokens.css`)
    return { tier, query: win.matchMedia(`(min-width: ${width})`) }
  })

  const read = (): Breakpoint => {
    let current: Breakpoint = 'base'
    for (const { tier, query } of queries) {
      if (query.matches)
        current = tier
    }
    return current
  }

  let current = read()
  let disposed = false
  const notify = (): void => {
    if (disposed)
      return
    const next = read()
    if (next === current)
      return
    current = next
    options.onChange?.(next)
  }
  for (const { query } of queries)
    query.addEventListener('change', notify)

  return {
    get current() {
      return current
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      for (const { query } of queries)
        query.removeEventListener('change', notify)
    },
  }
}
