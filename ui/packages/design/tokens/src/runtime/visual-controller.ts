import type { EnvSignals } from './env'
import type {
  VisualEnvironmentPreference,
  VisualEnvironmentState,
  VisualMotion,
} from './types'
import { applyVisualEnvironmentAttrs, VISUAL_ENVIRONMENT_ATTRIBUTES } from './apply'
import { createEnvSignals, SSR_ENV } from './env'
import { resolveVisualEnvironment } from './resolve'

type Cleanup = () => void
type PreferenceKey = keyof VisualEnvironmentPreference

const PREFERENCE_KEYS = [
  'mode',
  'brand',
  'density',
  'dir',
  'contrast',
  'motion',
  'transparency',
] as const satisfies readonly PreferenceKey[]

const VALUES: Record<PreferenceKey, readonly string[]> = {
  mode: ['light', 'dark', 'system'],
  brand: [],
  density: ['comfortable', 'compact'],
  dir: ['ltr', 'rtl'],
  contrast: ['default', 'more', 'system'],
  motion: ['default', 'reduce', 'system'],
  transparency: ['default', 'reduce', 'system'],
}

export interface VisualEnvironmentStorageError {
  readonly operation: 'read' | 'write'
  readonly key: string
  readonly error: unknown
}

export type VisualMotionSink = (motion: VisualMotion | null) => void
export type MotionOverrideSetter = (motion: 'no-preference' | 'reduce' | null) => void

/** 显式把 tokens 的 default/reduce 轴接到 @xihan-ui/motion 的 override 值域。 */
export function createMotionOverrideSink(setOverride: MotionOverrideSetter): VisualMotionSink {
  return motion => setOverride(motion === 'default' ? 'no-preference' : motion)
}

interface VisualEnvironmentControllerBaseOptions {
  /** 应用七轴属性的作用域根；省略时取传入 Window 的 documentElement。 */
  root?: Element
  /** 本作用域的初始偏好；undefined 的轴继承 parent。 */
  initial?: VisualEnvironmentPreference
  /** 显式父作用域。父状态变化时，未覆盖的轴同步继承。 */
  parent?: VisualEnvironmentController
  /** 显式 realm；若同时传 root，必须是 root.ownerDocument.defaultView。 */
  win?: Window
  /**
   * 仅根作用域可注入的 JS motion 接口。提交时同步 resolved motion，dispose 时传 null 交还系统。
   * 局部作用域禁止传入，避免嵌套 Provider 污染全局 Presence/scroll 行为。
   */
  motionSink?: VisualMotionSink
}

/** 启用持久化必须同时提供错误出口；失败会回调并继续维持内存态。 */
export type VisualEnvironmentControllerOptions = VisualEnvironmentControllerBaseOptions & (
  | { storageKey?: undefined, onStorageError?: undefined }
  | { storageKey: string, onStorageError: (detail: VisualEnvironmentStorageError) => void }
)

export interface VisualEnvironmentController {
  getState: () => VisualEnvironmentState
  getPreference: () => Readonly<VisualEnvironmentPreference>
  setPreference: (patch: VisualEnvironmentPreference) => void
  subscribe: (fn: (state: VisualEnvironmentState) => void) => Cleanup
  dispose: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validatePreference(value: unknown, label: string): VisualEnvironmentPreference {
  if (!isRecord(value))
    throw new TypeError(`${label} 必须是对象`)
  const allowed = new Set<string>(PREFERENCE_KEYS)
  const out: VisualEnvironmentPreference = {}
  for (const [key, candidate] of Object.entries(value)) {
    if (!allowed.has(key))
      throw new TypeError(`${label}.${key} 不是视觉环境轴`)
    if (candidate === undefined) {
      Object.assign(out, { [key]: undefined })
      continue
    }
    const preferenceKey = key as PreferenceKey
    if (preferenceKey === 'brand') {
      if (typeof candidate !== 'string' || candidate.trim() === '')
        throw new TypeError(`${label}.brand 必须是非空字符串`)
    }
    else if (!VALUES[preferenceKey].includes(candidate as string)) {
      throw new TypeError(`${label}.${preferenceKey} 的值无效`)
    }
    Object.assign(out, { [preferenceKey]: candidate })
  }
  return out
}

function readStored(
  win: Window | undefined,
  key: string | undefined,
  onError: VisualEnvironmentControllerOptions['onStorageError'],
): VisualEnvironmentPreference {
  if (!key)
    return {}
  if (!win) {
    onError?.({ operation: 'read', key, error: new Error('当前 realm 没有可用的 localStorage') })
    return {}
  }
  try {
    const raw = win.localStorage.getItem(key)
    return raw === null ? {} : validatePreference(JSON.parse(raw), 'storedPreference')
  }
  catch (error) {
    onError?.({ operation: 'read', key, error })
    return {}
  }
}

function writeStored(
  win: Window | undefined,
  key: string | undefined,
  preference: VisualEnvironmentPreference,
  onError: VisualEnvironmentControllerOptions['onStorageError'],
): void {
  if (!key)
    return
  if (!win) {
    onError?.({ operation: 'write', key, error: new Error('当前 realm 没有可用的 localStorage') })
    return
  }
  try {
    win.localStorage.setItem(key, JSON.stringify(preference))
  }
  catch (error) {
    onError?.({ operation: 'write', key, error })
  }
}

function sameState(a: VisualEnvironmentState, b: VisualEnvironmentState): boolean {
  return a.mode === b.mode
    && a.brand === b.brand
    && a.density === b.density
    && a.dir === b.dir
    && a.contrast === b.contrast
    && a.motion === b.motion
    && a.transparency === b.transparency
}

function mergePreference(
  base: VisualEnvironmentPreference,
  patch: VisualEnvironmentPreference,
): VisualEnvironmentPreference {
  const next = { ...base }
  for (const key of PREFERENCE_KEYS) {
    if (!Object.hasOwn(patch, key))
      continue
    const value = patch[key]
    if (value === undefined)
      delete next[key]
    else
      Object.assign(next, { [key]: value })
  }
  return next
}

function realmOf(root: Element | undefined): Window | undefined {
  return root?.ownerDocument?.defaultView ?? undefined
}

export function createVisualEnvironmentController(
  options: VisualEnvironmentControllerOptions = {},
): VisualEnvironmentController {
  if (options.storageKey && !options.onStorageError)
    throw new TypeError('启用 storageKey 必须提供 onStorageError')
  const rootRealm = realmOf(options.root)
  if (options.root && options.win && options.win !== rootRealm)
    throw new TypeError('VisualEnvironmentController 的 root 与 win 必须属于同一 realm')
  const win = options.win ?? (options.root ? rootRealm : globalThis.window)
  const root = options.root ?? win?.document.documentElement
  if (options.motionSink && root && root !== root.ownerDocument.documentElement)
    throw new TypeError('motionSink 只允许绑定 documentElement 根作用域')

  const env: EnvSignals = win ? createEnvSignals(win) : SSR_ENV
  const stored = readStored(win, options.storageKey, options.onStorageError)
  const initial = validatePreference(options.initial ?? {}, 'initial')
  let preference = mergePreference(stored, initial)
  let state = resolveVisualEnvironment(preference, env, options.parent?.getState())
  let disposed = false
  const subscribers = new Set<(value: VisualEnvironmentState) => void>()
  const previousAttrs = root
    ? new Map(VISUAL_ENVIRONMENT_ATTRIBUTES.map(name => [name, root.getAttribute(name)] as const))
    : null

  const project = (): void => {
    if (root)
      applyVisualEnvironmentAttrs(root, state)
    options.motionSink?.(state.motion)
  }

  const recompute = (): void => {
    if (disposed)
      return
    const next = resolveVisualEnvironment(preference, env, options.parent?.getState())
    if (sameState(next, state))
      return
    state = next
    project()
    for (const subscriber of [...subscribers])
      subscriber(state)
  }

  project()
  const offEnvironment = env.subscribe(recompute)
  const offParent = options.parent?.subscribe(recompute) ?? (() => {})

  return {
    getState: () => state,
    getPreference: () => ({ ...preference }),
    setPreference(patch) {
      if (disposed)
        throw new Error('VisualEnvironmentController 已 dispose')
      const validPatch = validatePreference(patch, 'preference')
      preference = mergePreference(preference, validPatch)
      writeStored(win, options.storageKey, preference, options.onStorageError)
      recompute()
    },
    subscribe(fn) {
      if (disposed)
        throw new Error('VisualEnvironmentController 已 dispose')
      subscribers.add(fn)
      return () => void subscribers.delete(fn)
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      offEnvironment()
      offParent()
      subscribers.clear()
      options.motionSink?.(null)
      if (root && previousAttrs) {
        for (const [name, value] of previousAttrs) {
          if (value === null)
            root.removeAttribute(name)
          else
            root.setAttribute(name, value)
        }
      }
    },
  }
}
