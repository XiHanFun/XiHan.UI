// prefers-reduced-motion 探测。SSR 期返回 false（不降级）。
// 默认窗口走 globalThis.window 而不是裸 window：默认参数在函数体守卫之前求值，
// 无 window 的宿主里裸 window 会抛 ReferenceError 而不是走到下面的守卫。
export function prefersReducedMotion(win: Window | undefined = globalThis.window): boolean {
  if (typeof win?.matchMedia !== 'function')
    return false
  return win.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 订阅 reduced-motion 变化；返回取消订阅。 */
export function onReducedMotionChange(fn: (reduced: boolean) => void, win: Window | undefined = globalThis.window): () => void {
  if (typeof win?.matchMedia !== 'function')
    return () => {}
  const mql = win.matchMedia('(prefers-reduced-motion: reduce)')
  const handler = (): void => fn(mql.matches)
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}
