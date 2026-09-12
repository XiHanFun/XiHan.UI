import type {
  ThemePreference,
  ThemeState,
  VisualEnvironmentController,
  VisualEnvironmentStorageError,
} from '@xihan-ui/core/visual-environment'
import { createVisualEnvironmentController, pickThemeState } from '@xihan-ui/core/visual-environment'

type Cleanup = () => void

interface ThemeControllerBaseOptions {
  root?: Element
  initial?: ThemePreference
  parent?: ThemeController
  win?: Window
}

export type ThemeControllerOptions = ThemeControllerBaseOptions & (
  | { storageKey?: undefined, onStorageError?: undefined }
  | { storageKey: string, onStorageError: (detail: VisualEnvironmentStorageError) => void }
)

export interface ThemeController {
  getState: () => ThemeState
  getPreference: () => Readonly<ThemePreference>
  setPreference: (patch: ThemePreference) => void
  subscribe: (fn: (state: ThemeState) => void) => Cleanup
  dispose: () => void
}

const visualByTheme = new WeakMap<ThemeController, VisualEnvironmentController>()

/** 旧五轴 API 是 VisualEnvironmentController 的明确视图，不持有独立状态或解析器。 */
export function createThemeController(opts: ThemeControllerOptions = {}): ThemeController {
  const parent = opts.parent ? visualByTheme.get(opts.parent) : undefined
  if (opts.parent && !parent)
    throw new TypeError('parent 必须由 createThemeController 创建')
  const visualOptions = {
    root: opts.root,
    initial: opts.initial,
    parent,
    win: opts.win,
  }
  const visual = opts.storageKey
    ? createVisualEnvironmentController({
        ...visualOptions,
        storageKey: opts.storageKey,
        onStorageError: opts.onStorageError!,
      })
    : createVisualEnvironmentController(visualOptions)
  const controller: ThemeController = {
    getState: () => pickThemeState(visual.getState()),
    getPreference: () => {
      const preference = visual.getPreference()
      return {
        mode: preference.mode,
        brand: preference.brand,
        density: preference.density,
        dir: preference.dir,
        contrast: preference.contrast,
      }
    },
    setPreference: patch => visual.setPreference(patch),
    subscribe(fn) {
      let previous = pickThemeState(visual.getState())
      return visual.subscribe((nextVisual) => {
        const next = pickThemeState(nextVisual)
        if (
          next.mode === previous.mode && next.brand === previous.brand
          && next.density === previous.density && next.dir === previous.dir
          && next.contrast === previous.contrast
        ) {
          return
        }
        previous = next
        fn(next)
      })
    },
    dispose: () => visual.dispose(),
  }
  visualByTheme.set(controller, visual)
  return controller
}
