/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

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

/** 系统偏好。无 matchMedia 的宿主返回 `'no-preference'`（不降级），与 prefersReducedMotion 同向。 */
export function getMotionPreference(win: Window | undefined = globalThis.window): MotionPreference {
  if (typeof win?.matchMedia !== 'function')
    return 'no-preference'
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

function isElement(target: Window | Element): target is Element {
  return (target as Node).nodeType === 1 && typeof (target as Element).closest === 'function'
}

/**
 * 最终偏好。
 *
 * 传入元素时，最近祖先上的 `data-motion`（`reduce` / `default`）优先，与 CSS 的作用域一致；
 * 其次是应用级 override，最后是元素所在窗口的系统偏好。传入窗口或不传时不看 DOM。
 */
export function resolveMotionPreference(target?: Window | Element | null): MotionPreference {
  if (target != null && isElement(target)) {
    const scoped = target.closest('[data-motion]')?.getAttribute('data-motion')
    if (scoped === 'reduce')
      return 'reduce'
    if (scoped === 'default')
      return 'no-preference'
    return override ?? getMotionPreference(target.ownerDocument?.defaultView ?? undefined)
  }
  return override ?? getMotionPreference(target ?? undefined)
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
