// 减弱动效偏好：系统媒体查询探测，叠一层应用级 override。

/** 解析后的动效偏好。 */
export type MotionPreference = 'no-preference' | 'reduce'

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

let override: MotionPreference | null = null
const overrideListeners = new Set<() => void>()

/**
 * 系统偏好。无 matchMedia 的宿主返回 `'reduce'`——JS 动画在这种宿主里没有可推进的帧，
 * 报告成不降级会让调用方去跑一段永远不动的动画。
 */
export function getMotionPreference(win: Window | undefined = globalThis.window): MotionPreference {
  if (typeof win?.matchMedia !== 'function')
    return 'reduce'
  return win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference'
}

/** 应用级强制偏好，优先级高于系统设置；传 null 交还给系统。 */
export function setMotionOverride(preference: MotionPreference | null): void {
  if (override === preference)
    return
  override = preference
  for (const notify of [...overrideListeners]) notify()
}

/** 当前的应用级强制偏好，未设置为 null。 */
export function getMotionOverride(): MotionPreference | null {
  return override
}

/** 最终偏好：应用级 override 优先，否则取系统偏好。 */
export function resolveMotionPreference(win?: Window): MotionPreference {
  return override ?? getMotionPreference(win)
}

/** 订阅最终偏好的变化（系统改动与 override 改动都算）；值不变不回调。返回取消订阅。 */
export function onMotionPreferenceChange(
  fn: (preference: MotionPreference) => void,
  win: Window | undefined = globalThis.window,
): () => void {
  let last = resolveMotionPreference(win)
  const emit = (): void => {
    const next = resolveMotionPreference(win)
    if (next === last)
      return
    last = next
    fn(next)
  }
  overrideListeners.add(emit)
  const offSystem = onReducedMotionChange(emit, win)
  return () => {
    overrideListeners.delete(emit)
    offSystem()
  }
}
