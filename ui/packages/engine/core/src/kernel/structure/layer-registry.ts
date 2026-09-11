// LayerRegistry：逻辑层栈，记录栈顶、层序，以及节点的层归属（node/branch/surface）。
import type { Cleanup } from '../types'
import { reportDiagnostic } from '../diagnostics/channel'
import { DIAGNOSTIC_CODES } from '../diagnostics/codes'
import { contains } from '../guards'
import { createPerDocumentRegistry } from './per-document-registry'

export type LayerKind = 'modal' | 'popover' | 'inline'

export interface Layer {
  readonly id: string
  readonly kind: LayerKind
  /** 层的根 DOM 节点；用于 contains 判定。 */
  readonly node: () => HTMLElement | null
  /** 逻辑上属于本层、但 DOM 在别处的节点（嵌套 portal）。 */
  readonly branches: () => Element[]
  /** 模态性，生命周期内可变。 */
  readonly isModal: () => boolean
  readonly setModal: (v: boolean) => void
  /** 点击即应关闭本层的表面，如 backdrop。 */
  readonly surfaces: () => Element[]
}

export interface LayerRegistry {
  /** 该层栈唯一归属的 Document。 */
  readonly ownerDocument: Document
  register: (layer: Omit<Layer, 'id'>) => { layer: Layer, dispose: Cleanup }
  /** 按创建序返回冻结快照；索引即层级。 */
  list: () => readonly Layer[]
  top: () => Layer | undefined
  indexOf: (layer: Layer) => number
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
    indexOf: layer => layers.indexOf(layer),
    layerOf,
    elementsAbove,
    subscribe: (fn) => {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
  }
  return Object.freeze(publicRegistry)
}

const registry = createPerDocumentRegistry(createLayerRegistry)

/** 取该 document 的共享 LayerRegistry。 */
export function getLayerRegistry(doc: Document): LayerRegistry {
  return registry.get(doc)
}
