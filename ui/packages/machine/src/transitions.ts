import type { MachineConfig, MachineSchema, StateChainItem, Transition } from './types'
// 转移解析：把一个事件解析为一条命中的 transition，并算出退出/进入的状态集合。
import { MachineError } from './errors'
import { ensureStateIndex } from './state'

function toArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v]
}

/** 从根到指定叶子路径的状态链（含所有中间层）。 */
export function getStateChain<T extends MachineSchema>(machine: MachineConfig<T>, path: string): Array<StateChainItem<T>> {
  const { index } = ensureStateIndex(machine)
  const parts = path.split('.')
  const chain: Array<StateChainItem<T>> = []
  let acc = ''
  for (const part of parts) {
    acc = acc ? `${acc}.${part}` : part
    const node = index.get(acc)
    if (node)
      chain.push({ path: acc, node })
  }
  return chain
}

/** 复合状态沿 initial 逐级下钻到叶子路径。 */
export function resolveToLeaf<T extends MachineSchema>(machine: MachineConfig<T>, path: string): string {
  const { index } = ensureStateIndex(machine)
  let cur = path
  let node = index.get(cur)
  while (node?.states && node.initial) {
    cur = `${cur}.${node.initial}`
    node = index.get(cur)
  }
  return cur
}

/** 从叶子沿祖先链向上找第一个声明了该事件的状态；找不到再看根级 on。 */
export function findTransition<T extends MachineSchema>(
  machine: MachineConfig<T>,
  from: string,
  eventType: string,
): { transitions: Array<Transition<T>>, source: string | undefined } {
  const chain = getStateChain(machine, from)
  for (let i = chain.length - 1; i >= 0; i--) {
    const item = chain[i]!
    const on = item.node.on as Record<string, Transition<T> | Array<Transition<T>>> | undefined
    const entry = on?.[eventType]
    if (entry)
      return { transitions: toArray(entry), source: item.path }
  }
  const rootOn = machine.on as Record<string, Transition<T> | Array<Transition<T>>> | undefined
  const rootEntry = rootOn?.[eventType]
  if (rootEntry)
    return { transitions: toArray(rootEntry), source: undefined }
  return { transitions: [], source: undefined }
}

/** 逐条求 guard，取首个命中的 transition。 */
export function choose<T extends MachineSchema>(
  transitions: Array<Transition<T>>,
  evalGuard: (t: Transition<T>) => boolean,
): Transition<T> | undefined {
  for (const t of transitions) {
    if (evalGuard(t))
      return t
  }
  return undefined
}

/** 解析 transition 的 target 为一条合法叶子路径。支持 #id / .child / 兄弟裸名 / 全路径。 */
export function resolveStateValue<T extends MachineSchema>(
  machine: MachineConfig<T>,
  target: string,
  source: string | undefined,
): string {
  const { index, idIndex } = ensureStateIndex(machine)

  // 绝对 id 跳转
  if (target.startsWith('#')) {
    const path = idIndex.get(target.slice(1))
    if (!path)
      throw new MachineError('BAD_TARGET', `unknown state id "${target}"`, machine.name)
    return resolveToLeaf(machine, path)
  }

  // 相对子状态：source 之下的后代
  if (target.startsWith('.')) {
    const base = source ?? ''
    const path = base ? `${base}${target}` : target.slice(1)
    if (!index.has(path))
      throw new MachineError('BAD_TARGET', `unknown relative target "${target}" from "${source}"`, machine.name)
    return resolveToLeaf(machine, path)
  }

  // 全路径命中
  if (index.has(target))
    return resolveToLeaf(machine, target)

  // 兄弟裸名：与 source 同父
  if (source) {
    const parent = source.includes('.') ? source.slice(0, source.lastIndexOf('.')) : ''
    const sibling = parent ? `${parent}.${target}` : target
    if (index.has(sibling))
      return resolveToLeaf(machine, sibling)
  }

  throw new MachineError('BAD_TARGET', `cannot resolve target "${target}" from "${source}"`, machine.name)
}

/** 以 from/to 的最近公共祖先为界，算出退出集合（内→外）与进入集合（外→内）。 */
export function getExitEnterStates<T extends MachineSchema>(
  machine: MachineConfig<T>,
  from: string,
  to: string,
  reenter?: boolean,
): { exiting: Array<StateChainItem<T>>, entering: Array<StateChainItem<T>> } {
  const fromChain = getStateChain(machine, from)
  const toChain = getStateChain(machine, to)

  // 强制重入同一叶子：整条退出、整条进入
  if (reenter && from === to) {
    return { exiting: [...fromChain].reverse(), entering: toChain }
  }

  // 最长公共前缀（按路径逐项比）
  let common = 0
  while (
    common < fromChain.length
    && common < toChain.length
    && fromChain[common]!.path === toChain[common]!.path
  ) {
    common++
  }

  const exiting = fromChain.slice(common).reverse()
  const entering = toChain.slice(common)
  return { exiting, entering }
}

/** 供内部工具复用。 */
export function transitionsToArray<T>(v: T | T[]): T[] {
  return toArray(v)
}
