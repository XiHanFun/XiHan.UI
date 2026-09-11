// LayerRegistry：逻辑层栈，记录栈顶、层序，以及节点的层归属（node/branch/surface）。
import type { Cleanup } from '../types'
import { reportDiagnostic } from '../diagnostics/channel'
import { DIAGNOSTIC_CODES } from '../diagnostics/codes'
import { contains } from '../guards'
import { createPerDocumentRegistry } from './per-document-registry'

export type LayerKind = 'modal' | 'popover' | 'inline'

/** 同一 Document 内由逻辑栈派生的视觉层级。 */
export interface LayerVisual {
  /** 当前逻辑栈中的零基序号；释放下层后会随新快照收紧。 */
  readonly visualIndex: number
  /** kind 与当前模态性共同决定的槽内 lane。 */
  readonly visualLane: number
  /** 可直接写入 CSS z-index 自定义属性的值。 */
  readonly visualLayer: string
}

/** Core 写给皮肤的统一私有视觉层级槽。 */
export const LAYER_VISUAL_PROPERTY = '--xh-_layer'

const VISUAL_STRIDE = 8
const KIND_LANE: Readonly<Record<LayerKind, number>> = Object.freeze({
  inline: 0,
  popover: 2,
  modal: 4,
})

export interface Layer {
  readonly id: string
  readonly kind: LayerKind
  /** 层的根 DOM 节点；用于 contains 判定。 */
  readonly node: () => HTMLElement | null
  /** 逻辑上属于本层、但 DOM 在别处的节点（嵌套 portal）。 */
  readonly branches: () => Element[]
  /** 模态性，生命周期内可变。 */
  readonly isModal: () => boolean
  /** 点击即应关闭本层的表面，如 backdrop。 */
  readonly surfaces: () => Element[]
  /** 应消费视觉层级的宿主节点；缺省由 node、同 scope 父节点与 surfaces 推出。 */
  readonly visuals?: () => Element[]
}

export interface LayerRegistry {
  /** 该层栈唯一归属的 Document。 */
  readonly ownerDocument: Document
  register: (layer: Omit<Layer, 'id'>) => { layer: Layer, dispose: Cleanup }
  /** 按创建序返回冻结快照；索引即层级。 */
  list: () => readonly Layer[]
  top: () => Layer | undefined
  indexOf: (layer: Layer) => number
  /** 读取当前快照为该层派生的视觉序号、lane 与 CSS 值。 */
  visualOf: (layer: Layer) => LayerVisual
  /** isModal 等动态 getter 改变后显式发布同一快照，让视觉消费者重新读取。 */
  sync: (layer: Layer) => void
  /** 给定 DOM 节点，返回它归属的最高层。 */
  layerOf: (node: Node) => { layer: Layer, via: 'node' | 'branch' | 'surface' } | undefined
  /** 栈中位于给定层之上的各层的全部节点（node + branches + surfaces）。 */
  elementsAbove: (layer: Layer) => Element[]
  /** 订阅栈变化；回调参数是冻结快照。 */
  subscribe: (fn: (layers: readonly Layer[]) => void) => Cleanup
}

export function createLayerRegistry(doc: Document): LayerRegistry {
  type Subscriber = (layers: readonly Layer[]) => void
  type CollectedError = { found: false } | { found: true, error: unknown }

  let layers: readonly Layer[] = Object.freeze([])
  const subs = new Set<Subscriber>()
  let seq = 0
  let changing = false
  let notifying = false

  const frozenSnapshot = (next: Layer[]): readonly Layer[] => Object.freeze(next)

  const collectedError = (errors: unknown[], message: string): CollectedError => {
    if (errors.length === 1)
      return { found: true, error: errors[0] }
    if (errors.length > 1)
      return { found: true, error: new AggregateError(errors, message, { cause: errors[0] }) }
    return { found: false }
  }

  const notify = (participants: Subscriber[], snapshot: readonly Layer[], phase: string): CollectedError => {
    const errors: unknown[] = []
    notifying = true
    try {
      for (const fn of participants) {
        try {
          fn(snapshot)
        }
        catch (error) {
          errors.push(error)
        }
      }
    }
    finally {
      notifying = false
    }
    return collectedError(errors, `[xh] LayerRegistry ${phase}通知出现多个异常`)
  }

  const assertCanChange = (): void => {
    if (notifying)
      throw new Error('[xh] LayerRegistry 通知期间禁止嵌套 register/dispose')
    if (changing)
      throw new Error('[xh] LayerRegistry 状态变更期间禁止嵌套 register/dispose')
  }

  const runChange = <T>(change: () => T): T => {
    assertCanChange()
    changing = true
    try {
      return change()
    }
    finally {
      changing = false
    }
  }

  const publishRegistration = (next: readonly Layer[]): void => {
    const previous = layers
    const participants = [...subs]
    layers = next
    const changeResult = notify(participants, next, '注册变更')
    if (!changeResult.found)
      return

    layers = previous
    const rollbackResult = notify(participants, previous, '注册补偿')
    if (!rollbackResult.found)
      throw changeResult.error
    throw new AggregateError(
      [changeResult.error, rollbackResult.error],
      '[xh] LayerRegistry 注册通知与补偿通知同时失败',
      { cause: changeResult.error },
    )
  }

  const register: LayerRegistry['register'] = input => runChange(() => {
    const id = `layer-${++seq}`
    const layer: Layer = Object.freeze({ ...input, id })
    publishRegistration(frozenSnapshot([...layers, layer]))

    let disposed = false
    const dispose: Cleanup = () => {
      if (disposed)
        return
      runChange(() => {
        const idx = layers.indexOf(layer)
        if (idx === -1)
          throw new Error(`[xh] LayerRegistry 无法释放未登记的层: ${layer.id}`)
        const participants = [...subs]
        let diagnosticResult: CollectedError = { found: false }
        if (idx !== layers.length - 1) {
          try {
            reportDiagnostic({
              code: DIAGNOSTIC_CODES.layerDisposeNotTop,
              level: 'error',
              message: `dispose 的层不是栈顶（可能与 top layer 顺序不一致）: ${layer.id}`,
              detail: { layerId: layer.id, index: idx, depth: layers.length },
            })
          }
          catch (error) {
            diagnosticResult = { found: true, error }
          }
        }
        layers = frozenSnapshot([
          ...layers.slice(0, idx),
          ...layers.slice(idx + 1),
        ])
        disposed = true
        const notificationResult = notify(participants, layers, '释放')
        if (diagnosticResult.found && notificationResult.found) {
          throw new AggregateError(
            [diagnosticResult.error, notificationResult.error],
            '[xh] LayerRegistry 非栈顶诊断与释放通知同时失败',
            { cause: diagnosticResult.error },
          )
        }
        if (diagnosticResult.found)
          throw diagnosticResult.error
        if (notificationResult.found)
          throw notificationResult.error
      })
    }
    return { layer, dispose }
  })

  const indexOf = (layer: Layer): number => layers.indexOf(layer)

  const visualOf: LayerRegistry['visualOf'] = (layer) => {
    const visualIndex = indexOf(layer)
    if (visualIndex === -1)
      throw new Error(`[xh] LayerRegistry 无法读取未登记层的视觉层级: ${layer.id}`)
    const visualLane = KIND_LANE[layer.kind] + (layer.isModal() ? 1 : 0)
    return Object.freeze({
      visualIndex,
      visualLane,
      // 逻辑序号占高位，kind/modal 只占当前序号内的 lane；后来登记的 modal
      // 因此仍高于更早的 popover，嵌套 popover 也必然高于所属 modal。
      visualLayer: `calc(var(--xh-layer-modal, 1100) + ${visualIndex * VISUAL_STRIDE + visualLane})`,
    })
  }

  const sync: LayerRegistry['sync'] = layer => runChange(() => {
    if (indexOf(layer) === -1)
      throw new Error(`[xh] LayerRegistry 无法同步未登记的层: ${layer.id}`)
    const result = notify([...subs], layers, '动态同步')
    if (result.found)
      throw result.error
  })

  const layerOf: LayerRegistry['layerOf'] = (node) => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]!
      if (contains(layer.node(), node))
        return { layer, via: 'node' }
      if (layer.surfaces().some(s => contains(s, node)))
        return { layer, via: 'surface' }
      if (layer.branches().some(b => contains(b, node)))
        return { layer, via: 'branch' }
    }
    return undefined
  }

  const elementsAbove: LayerRegistry['elementsAbove'] = (layer) => {
    const from = layers.indexOf(layer)
    if (from === -1)
      return []
    const out: Element[] = []
    for (let i = from + 1; i < layers.length; i++) {
      const above = layers[i]!
      const node = above.node()
      if (node)
        out.push(node)
      out.push(...above.branches(), ...above.surfaces())
    }
    return out
  }

  const publicRegistry: LayerRegistry = {
    ownerDocument: doc,
    register,
    list: () => layers,
    top: () => layers[layers.length - 1],
    indexOf,
    visualOf,
    sync,
    layerOf,
    elementsAbove,
    subscribe: (fn) => {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
  }
  return Object.freeze(publicRegistry)
}

interface InlineStyleTarget extends Element {
  readonly style: CSSStyleDeclaration
}

interface PreviousLayerStyle {
  readonly value: string
  readonly priority: string
  applied: string
}

export interface LayerVisualBindingOptions {
  registry: LayerRegistry
  layer: Layer
  /** 框架提交调度；不给时同步写入。 */
  flush?: (fn: () => void) => void
}

function hasInlineStyle(element: Element): element is InlineStyleTarget {
  return 'style' in element
}

/**
 * 把 Registry 派生的视觉层级写入本层宿主；栈变化、动态 modal 与节点换代均走同一同步入口。
 */
export function bindLayerVisual(options: LayerVisualBindingOptions): Cleanup {
  const { registry, layer } = options
  const initialNode = layer.node()
  if (initialNode && registry.ownerDocument !== initialNode.ownerDocument)
    throw new Error('[xh] Layer 视觉绑定的 Registry 与节点必须属于同一 Document')

  let active = true
  let queued = false
  const applied = new Map<InlineStyleTarget, PreviousLayerStyle>()

  const targets = (): InlineStyleTarget[] => {
    const explicit = layer.visuals?.()
    const values: Element[] = explicit ? [...explicit] : []
    if (!explicit) {
      const node = layer.node()
      if (node) {
        values.push(node)
        const parent = node.parentElement
        if (parent && parent.dataset.scope === node.dataset.scope)
          values.push(parent)
      }
      // branches 里通常还含 trigger；trigger 不是视觉层宿主，不能把私有层变量写上去。
      // 标准浮层的 positioner 是 content 的同 scope 直属父节点，特殊结构可显式给 visuals。
      values.push(...layer.surfaces())
    }
    return [...new Set(values)].filter((element): element is InlineStyleTarget => {
      if (element.ownerDocument !== registry.ownerDocument)
        throw new Error('[xh] Layer 视觉宿主必须属于 Registry 的 Document')
      return hasInlineStyle(element)
    })
  }

  const restore = (element: InlineStyleTarget, previous: PreviousLayerStyle): void => {
    if (element.style.getPropertyValue(LAYER_VISUAL_PROPERTY) !== previous.applied)
      return
    if (previous.value)
      element.style.setProperty(LAYER_VISUAL_PROPERTY, previous.value, previous.priority)
    else
      element.style.removeProperty(LAYER_VISUAL_PROPERTY)
  }

  const apply = (): void => {
    queued = false
    if (!active)
      return
    const visualLayer = registry.visualOf(layer).visualLayer
    const next = new Set(targets())
    for (const element of next) {
      let previous = applied.get(element)
      if (!previous) {
        previous = {
          value: element.style.getPropertyValue(LAYER_VISUAL_PROPERTY),
          priority: element.style.getPropertyPriority(LAYER_VISUAL_PROPERTY),
          applied: visualLayer,
        }
        applied.set(element, previous)
      }
      previous.applied = visualLayer
      element.style.setProperty(LAYER_VISUAL_PROPERTY, visualLayer)
    }
    for (const [element, previous] of applied) {
      if (next.has(element))
        continue
      applied.delete(element)
      restore(element, previous)
    }
  }

  const schedule = (): void => {
    if (!active || queued)
      return
    queued = true
    if (options.flush)
      options.flush(apply)
    else
      apply()
  }

  const unsubscribe = registry.subscribe(schedule)
  try {
    schedule()
  }
  catch (error) {
    active = false
    unsubscribe()
    for (const [element, previous] of applied)
      restore(element, previous)
    applied.clear()
    throw error
  }
  return () => {
    if (!active)
      return
    active = false
    unsubscribe()
    for (const [element, previous] of applied)
      restore(element, previous)
    applied.clear()
  }
}

const registry = createPerDocumentRegistry(createLayerRegistry)

/** 取该 document 的共享 LayerRegistry。 */
export function getLayerRegistry(doc: Document): LayerRegistry {
  return registry.get(doc)
}
