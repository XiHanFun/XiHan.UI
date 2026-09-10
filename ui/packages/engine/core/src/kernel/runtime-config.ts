import type { IdGenerator } from './id-generator'
import type { Scope } from './scope'
import type { LayerRegistry } from './structure/layer-registry'
// RuntimeConfig：环境包，由适配器解析后以纯对象传入。
import type { Direction } from './types'
import { resolveMotionPreference } from '@xihan-ui/motion'
import { isDocument, isShadowRoot, isSSR, isWindow } from './guards'
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

function resolveScopeRealm(scope: Scope): { doc: Document, win: Window & typeof globalThis } {
  let root: Document | ShadowRoot
  let doc: Document
  let win: Window & typeof globalThis
  try {
    root = scope.getRootNode()
    doc = scope.getDoc()
    win = scope.getWin()
  }
  catch (cause) {
    throw new Error('[xh] createRuntimeConfig 无法从 scope 解析有效的 Document/Window', { cause })
  }

  if (!isDocument(doc) || !isWindow(win))
    throw new Error('[xh] createRuntimeConfig 无法从 scope 解析有效的 Document/Window')
  const rootDocument = isDocument(root)
    ? root
    : isShadowRoot(root)
      ? root.ownerDocument
      : null
  if (rootDocument !== doc || doc.defaultView !== win || win.document !== doc)
    throw new Error('[xh] createRuntimeConfig 的 scope root、document 与 window 不一致')
  return { doc, win }
}

function defaultPortalContainer(doc: Document): HTMLElement {
  if (!doc.body)
    throw new Error('[xh] createRuntimeConfig 的默认 portalContainer 需要 scope Document.body')
  return ensurePortalRoot(doc)
}

/** 构造 RuntimeConfig；无全局 DOM 时必须显式提供能解析活动 Document/Window 的 Scope。 */
export function createRuntimeConfig(partial: Partial<RuntimeConfig> = {}): RuntimeConfig {
  const idGenerator = partial.idGenerator ?? createCounterIdGenerator()
  const ambientDocument = isSSR() ? undefined : document
  if (!partial.scope && !ambientDocument)
    throw new Error('[xh] createRuntimeConfig 在无 DOM 环境必须显式提供 scope')
  const scope = partial.scope ?? createScope(ambientDocument!.body, idGenerator)
  const { doc: scopedDocument, win: scopedWindow } = resolveScopeRealm(scope)
  const layerRegistry = partial.layerRegistry
    ?? getLayerRegistry(scopedDocument)

  return {
    scope,
    idGenerator,
    layerRegistry,
    dir: partial.dir ?? 'ltr',
    locale: resolveLocale(partial.locale, scope),
    portalContainer: partial.portalContainer
      ?? (() => defaultPortalContainer(scopedDocument)),
    scrollRoot: partial.scrollRoot ?? (() => null),
    reducedMotion:
      partial.reducedMotion
      ?? (() => resolveMotionPreference(scopedWindow) === 'reduce'),
  }
}
