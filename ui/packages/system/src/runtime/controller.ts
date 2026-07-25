import type { EnvSignals } from './env'
import type { ThemePreference, ThemeState } from './types'
import { applyThemeAttrs } from './apply'
import { createEnvSignals, SSR_ENV } from './env'
import { resolveTheme } from './resolve'

type Cleanup = () => void

function isSSR(): boolean {
  return typeof document === 'undefined' || typeof window === 'undefined'
}

export interface ThemeControllerOptions {
  /** 应用属性的根元素，默认 document.documentElement。 */
  root?: Element
  /** 持久化偏好的 storage 键；不传则不持久化。 */
  storageKey?: string
  /** 初始偏好。 */
  initial?: ThemePreference
  win?: Window
}

export interface ThemeController {
  getState: () => ThemeState
  getPreference: () => Readonly<ThemePreference>
  setPreference: (patch: ThemePreference) => void
  subscribe: (fn: (state: ThemeState) => void) => Cleanup
  dispose: () => void
}

function readStored(win: Window | undefined, key: string | undefined): ThemePreference {
  if (!key || !win)
    return {}
  try {
    const raw = win.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ThemePreference) : {}
  }
  catch {
    return {}
  }
}

function writeStored(win: Window | undefined, key: string | undefined, pref: ThemePreference): void {
  if (!key || !win)
    return
  try {
    win.localStorage.setItem(key, JSON.stringify(pref))
  }
  catch {
    // 隐私模式 / 配额满：忽略
  }
}

export function createThemeController(opts: ThemeControllerOptions = {}): ThemeController {
  const ssr = isSSR()
  const win = ssr ? undefined : (opts.win ?? window)
  const root = opts.root ?? (ssr ? undefined : document.documentElement)
  const env: EnvSignals = win ? createEnvSignals(win) : SSR_ENV

  let preference: ThemePreference = { ...readStored(win, opts.storageKey), ...opts.initial }
  let state = resolveTheme(preference, env)
  const subs = new Set<(s: ThemeState) => void>()

  function commit(): void {
    if (root)
      applyThemeAttrs(root, state)
    for (const fn of [...subs]) fn(state)
  }

  function recompute(): void {
    const next = resolveTheme(preference, env)
    // 五维全等则不触发（避免系统信号变化但结果不变的空转）
    if (
      next.mode === state.mode && next.brand === state.brand
      && next.density === state.density && next.dir === state.dir && next.contrast === state.contrast
    ) {
      return
    }
    state = next
    commit()
  }

  if (root)
    applyThemeAttrs(root, state)

  const unsub = env.subscribe(recompute)

  return {
    getState: () => state,
    getPreference: () => preference,
    setPreference(patch) {
      preference = { ...preference, ...patch }
      writeStored(win, opts.storageKey, preference)
      recompute()
    },
    subscribe(fn) {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
    dispose() {
      unsub()
      subs.clear()
    },
  }
}
