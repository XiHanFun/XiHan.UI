// 状态索引构建与静态校验（§3.4.1）。四条校验全部 throw、不 warn（fail-closed）。
import type { MachineConfig, MachineSchema, StateIndex, StateNode } from './types'
import { MachineError } from './errors'

export function appendStatePath(base: string, key: string): string {
  return base ? `${base}.${key}` : key
}

const INDEX_CACHE = new WeakMap<MachineConfig<any>, StateIndex<any>>()

function buildStateIndex<T extends MachineSchema>(machine: MachineConfig<T>): StateIndex<T> {
  const index = new Map<string, StateNode<T>>()
  const idIndex = new Map<string, string>()
  const leaves: string[] = []

  const visit = (basePath: string, node: StateNode<T>): void => {
    index.set(basePath, node)
    if (node.id != null) {
      // ① state id 不得重复
      if (idIndex.has(node.id))
        throw new MachineError('DUPLICATE_STATE_ID', `duplicate state id "${node.id}" at "${basePath}"`)
      idIndex.set(node.id, basePath)
    }
    if (!node.states) {
      // ② 叶子状态不得声明 initial（比 Zag 多加：抓笔误）
      if (node.initial != null)
        throw new MachineError('ORPHAN_INITIAL', `leaf state "${basePath}" must not declare "initial"`)
      leaves.push(basePath)
      return
    }
    // ③ 复合状态必须有 initial
    if (node.initial == null)
      throw new MachineError('MISSING_INITIAL', `compound state "${basePath}" has child states but no "initial"`)
    // ④ initial 必须真的是它的子状态
    if (!(node.initial in node.states))
      throw new MachineError('BAD_INITIAL', `compound state "${basePath}" has initial "${node.initial}" which is not a child state`)
    const children = Object.entries(node.states) as Array<[string, StateNode<T>]>
    for (const [key, child] of children)
      visit(appendStatePath(basePath, key), child)
  }

  const roots = Object.entries(machine.states) as Array<[string, StateNode<T>]>
  for (const [key, node] of roots) visit(key, node)
  return { index, idIndex, leaves }
}

/** 构建并缓存状态索引（同一 config 只算一次）。 */
export function ensureStateIndex<T extends MachineSchema>(machine: MachineConfig<T>): StateIndex<T> {
  let idx = INDEX_CACHE.get(machine) as StateIndex<T> | undefined
  if (!idx) {
    idx = buildStateIndex(machine)
    INDEX_CACHE.set(machine, idx)
  }
  return idx
}
