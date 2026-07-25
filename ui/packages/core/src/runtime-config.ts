import type { IdGenerator } from './id-generator'
import type { Scope } from './scope'
import type { LayerRegistry } from './structure/layer-registry'
// RuntimeConfig：环境包。适配器解析后以纯对象传入；core 不关心它怎么来的。
import type { Direction } from './types'
import { isSSR } from './guards'
import { createCounterIdGenerator } from './id-generator'
import { createScope } from './scope'
import { getLayerRegistry } from './structure/layer-registry'

export interface RuntimeConfig {
  readonly scope: Scope
  readonly dir: Direction
  readonly locale: string // BCP 47
  readonly idGenerator: IdGenerator
  /** Portal 默认容器解析器；返回 null 表示用 top layer、不搬运。 */
  readonly portalContainer: () => Element | null
  /** 读 prefers-reduced-motion，供 Presence 短路。 */
  readonly reducedMotion: () => boolean
  readonly layerRegistry: LayerRegistry
}

/**
 * 构造 RuntimeConfig，未提供的字段用 CSR 默认值补全。
 * SSR 期不应调用（依赖 document/window）；适配器负责时机。
 */
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
    locale: partial.locale ?? 'zh-CN',
    portalContainer: partial.portalContainer ?? (() => null),
    reducedMotion:
      partial.reducedMotion
      ?? (() => !isSSR() && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  }
}

function undefinedLayerRegistry(): LayerRegistry {
  throw new Error('[xh] createRuntimeConfig 在 SSR 环境需显式传入 layerRegistry')
}
