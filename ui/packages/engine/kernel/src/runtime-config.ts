import type { IdGenerator } from './id-generator'
import type { Scope } from './scope'
import type { LayerRegistry } from './structure/layer-registry'
// RuntimeConfig：环境包，由适配器解析后以纯对象传入。
import type { Direction } from './types'
import { resolveMotionPreference } from '@xihan-ui/motion'
import { isSSR } from './guards'
import { createCounterIdGenerator } from './id-generator'
import { resolveLocale } from './locale'
import { createScope } from './scope'
import { getLayerRegistry } from './structure/layer-registry'
import { ensurePortalRoot } from './structure/portal-root'

export interface RuntimeConfig {
  readonly scope: Scope
  readonly dir: Direction
  readonly locale: string // BCP 47
  readonly idGenerator: IdGenerator
  /** Portal 容器解析器；默认返回 body 末尾的 portal 落点，返回 null 表示用 top layer、不搬运。 */
  readonly portalContainer: () => Element | null
  /** 是否减弱动效：应用级 override 优先，其次系统 prefers-reduced-motion；供 Presence 短路。 */
  readonly reducedMotion: () => boolean
  readonly layerRegistry: LayerRegistry
  /** 滚动根解析器；返回 null 表示交给滚动锁自行探测。 */
  readonly scrollRoot?: () => HTMLElement | null
}

/** 构造 RuntimeConfig，未提供的字段用 CSR 默认值补全（依赖 document/window，勿在 SSR 期调用）。 */
export function createRuntimeConfig(partial: Partial<RuntimeConfig> = {}): RuntimeConfig {
  const idGenerator = partial.idGenerator ?? createCounterIdGenerator()
  const doc = isSSR() ? undefined : document
  const scope = partial.scope ?? createScope(doc?.body, idGenerator)
  const layerRegistry = partial.layerRegistry ?? (doc ? getLayerRegistry(doc) : undefinedLayerRegistry())

  return {
    scope,
    idGenerator,
    layerRegistry,
    dir: partial.dir ?? 'ltr',
    locale: resolveLocale(partial.locale, scope),
    portalContainer: partial.portalContainer ?? (doc ? () => ensurePortalRoot(doc) : () => null),
    scrollRoot: partial.scrollRoot ?? (() => null),
    reducedMotion:
      partial.reducedMotion
      ?? (() => !isSSR() && resolveMotionPreference(window) === 'reduce'),
  }
}

function undefinedLayerRegistry(): LayerRegistry {
  throw new Error('[xh] createRuntimeConfig 在 SSR 环境需显式传入 layerRegistry')
}
