// LayerRegistry：逻辑层栈。
// 不是 z-index 分配器 —— 视觉堆叠交给浏览器 top layer。本表回答：谁是栈顶、
// outside 交互关到第几层、某节点属于哪一层（含 branch/surface 归属）。
import type { Cleanup } from '../types'
import { contains } from '../guards'
import { isDev } from '../utils/dev'
import { createPerDocumentRegistry } from './per-document-registry'

export type LayerKind = 'modal' | 'popover' | 'inline'

export interface Layer {
  readonly id: string
  readonly kind: LayerKind
  /** 层的根 DOM 节点；用于 contains 判定。 */
  node: () => HTMLElement | null
  /** 逻辑上属于本层、但 DOM 在别处的节点（嵌套 portal）。 */
  branches: () => Element[]
  /** 模态性可在生命周期内变化（退出动画中应降级为 false）。 */
  isModal: () => boolean
  setModal: (v: boolean) => void
  /** 「点它就该关本层」的表面（Dialog 自渲染的 backdrop）。 */
  surfaces: () => Element[]
}

export interface LayerRegistry {
  register: (layer: Omit<Layer, 'id'>) => { layer: Layer, dispose: Cleanup }
  /** 按创建序返回；索引即层级。 */
  list: () => readonly Layer[]
  top: () => Layer | undefined
  indexOf: (layer: Layer) => number
  /** 给定 DOM 节点，返回它归属的最高层。 */
  layerOf: (node: Node) => { layer: Layer, via: 'node' | 'branch' | 'surface' } | undefined
  /** 订阅栈变化（FocusScope 用它做 pause/resume）。 */
  subscribe: (fn: (layers: readonly Layer[]) => void) => Cleanup
}

export function createLayerRegistry(_doc: Document): LayerRegistry {
  const layers: Layer[] = []
  const subs = new Set<(layers: readonly Layer[]) => void>()
  let seq = 0

  const notify = (): void => {
    const snapshot = [...layers]
    for (const fn of subs) fn(snapshot)
  }

  const register: LayerRegistry['register'] = (input) => {
    const layer: Layer = { id: `layer-${++seq}`, ...input }
    layers.push(layer)
    notify()
    let disposed = false
    const dispose: Cleanup = () => {
      if (disposed)
        return
      disposed = true
      const idx = layers.indexOf(layer)
      if (idx !== -1) {
        // 双栈一致性 dev 断言：dispose 的不是栈顶时告警。
        if (isDev() && idx !== layers.length - 1)
          console.error(`[xh:layer] dispose 的层不是栈顶（可能与 top layer 顺序不一致）: ${layer.id}`)
        layers.splice(idx, 1)
        notify()
      }
    }
    return { layer, dispose }
  }

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

  return {
    register,
    list: () => layers,
    top: () => layers[layers.length - 1],
    indexOf: layer => layers.indexOf(layer),
    layerOf,
    subscribe: (fn) => {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
  }
}

const registry = createPerDocumentRegistry(createLayerRegistry)

/** 取该 document 的共享 LayerRegistry。测试隔离用 createLayerRegistry 显式建。 */
export function getLayerRegistry(doc: Document): LayerRegistry {
  return registry.get(doc)
}
