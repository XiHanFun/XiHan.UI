// prefers-reduced-motion 探测。SSR 期返回 false（不降级）。
export function prefersReducedMotion(win: Window = window): boolean {
  if (typeof win?.matchMedia !== 'function')
    return false
  return win.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 订阅 reduced-motion 变化；返回取消订阅。 */
export function onReducedMotionChange(fn: (reduced: boolean) => void, win: Window = window): () => void {
  if (typeof win?.matchMedia !== 'function')
    return () => {}
  const mql = win.matchMedia('(prefers-reduced-motion: reduce)')
  const handler = (): void => fn(mql.matches)
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}
