/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 懒分支：按需取子项，树与树选择共用一套。
//
// 节点写了 hasChildren: true、children 缺席即为懒分支。首次展开时调 loadChildren 取它的直接子项，
// 取回的子项按父节点 value 暂存在组件 context 里，作者不必为一个分支的结果重建整棵 collection。
// 每一轮请求带递增的 token 与自己的 AbortController：旧一轮的兑现或拒绝不会覆盖新一轮，
// 分支从 collection 移除或换了节点对象时，在途请求被中止、已取回的结果作废。
// 失败与「成功但没有子项」是两个独立终态；失败后不随再次展开自动重试，只有显式的重试才再发。

/** 懒加载用到的节点形状；树与树选择的节点都满足它。 */
export interface LazyTreeNode {
  value: string
  children?: LazyTreeNode[]
  hasChildren?: boolean
}

export type BranchLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

/** 分支异步相位；成功空结果与失败是两个独立终态，不能互相降级。 */
export type BranchLoadSnapshot
  = | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'loaded', empty: boolean }
    | { status: 'error', error: unknown }

/** 一次分支取数。signal 会在重试、分支收起、节点从 collection 移除或组件卸载时中止。 */
export interface BranchLoadRequest<N> {
  node: N
  signal: AbortSignal
}

export interface BranchLoadStartDetails<N> {
  value: string
  node: N
  reason: 'expand' | 'retry'
}

export interface BranchLoadDetails<N> {
  value: string
  node: N
  children: N[]
}

export interface BranchLoadErrorDetails<N> {
  value: string
  node: N
  error: unknown
}

export type BranchLoadChildren<N> = (request: BranchLoadRequest<N>) => Promise<N[] | undefined | void> | N[] | undefined | void

/** 在途请求与结果归属；只存运行时资源，不进可渲染的 context。实例私有，不能放模块变量。 */
export interface BranchLoadRuntime<N> {
  /** 仍在途的分支请求。 */
  controllers: Map<string, { controller: AbortController, token: number, node: N }>
  /** 每次开新请求递增，用于拒绝过期回调。 */
  sequence: { n: number }
  /** load 状态与成功 children 所属的原始节点对象；同 value 换节点时据此作废旧结果。 */
  owners: Map<string, N>
}

export function createBranchLoadRuntime<N>(): BranchLoadRuntime<N> {
  return { controllers: new Map(), sequence: { n: 0 }, owners: new Map() }
}

/** 节点是懒分支的唯一判据：明确有孩子但孩子尚未在 collection 里。 */
export function isLazyBranch(node: LazyTreeNode): boolean {
  return node.hasChildren === true && node.children === undefined
}

/** 按 value 找节点，取回的子项一并算进去；value 重复时以先出现的为准。 */
export function findLazyNode<N extends LazyTreeNode>(
  nodes: readonly N[],
  value: string,
  loadedChildren: Readonly<Record<string, N[]>> = {},
): N | null {
  for (const node of nodes) {
    if (node.value === value)
      return node
    const children = (node.children as N[] | undefined) ?? loadedChildren[node.value]
    if (children) {
      const found = findLazyNode(children, value, loadedChildren)
      if (found)
        return found
    }
  }
  return null
}

/**
 * 连接层与动作共用的有效树。只在懒分支上补 children（取回的或空数组），所以空目录与叶子不会混淆；
 * 没有懒分支的子树原样返回同一个对象。
 */
export function resolveLazyCollection<N extends LazyTreeNode>(
  collection: readonly N[],
  loadedChildren: Readonly<Record<string, N[]>>,
): N[] {
  return collection.map((node) => {
    const own = node.children as N[] | undefined
    if (own === undefined && !isLazyBranch(node))
      return node
    const children = resolveLazyCollection(own ?? loadedChildren[node.value] ?? [], loadedChildren)
    if (own && children.length === own.length && children.every((child, index) => child === own[index]))
      return node
    return { ...node, children }
  })
}

/** 树里此刻所有的懒分支（取回的子项里的也算），按 value 建表。 */
export function lazyBranches<N extends LazyTreeNode>(
  nodes: readonly N[],
  loadedChildren: Readonly<Record<string, N[]>>,
  values = new Map<string, N>(),
): Map<string, N> {
  for (const node of nodes) {
    if (isLazyBranch(node))
      values.set(node.value, node)
    const children = (node.children as N[] | undefined) ?? loadedChildren[node.value]
    if (children)
      lazyBranches(children, loadedChildren, values)
  }
  return values
}

/** 某个分支此刻的取数相位；不是懒分支时为 null。 */
export function branchLoadSnapshotOf<N extends LazyTreeNode>(
  collection: readonly N[],
  loadedChildren: Readonly<Record<string, N[]>>,
  loads: Readonly<Record<string, BranchLoadSnapshot>>,
  value: string,
): BranchLoadSnapshot | null {
  const node = findLazyNode(collection, value, loadedChildren)
  if (!node || !isLazyBranch(node))
    return null
  return loads[value] ?? { status: 'idle' }
}

/** 组件状态与回调的接口：每次动作现取现读，请求回来时读到的也是那一刻的 prop。 */
export interface BranchLoadPort<N extends LazyTreeNode> {
  /** 组件名，只用于缺 loadChildren 时的报错。 */
  readonly component: string
  readonly collection: () => readonly N[]
  readonly loadedChildren: () => Readonly<Record<string, N[]>>
  readonly setLoadedChildren: (next: Record<string, N[]>) => void
  readonly loads: () => Readonly<Record<string, BranchLoadSnapshot>>
  readonly setLoads: (next: Record<string, BranchLoadSnapshot>) => void
  readonly loadChildren: () => BranchLoadChildren<N> | undefined
  readonly onStart: (details: BranchLoadStartDetails<N>) => void
  readonly onLoad: (details: BranchLoadDetails<N>) => void
  readonly onError: (details: BranchLoadErrorDetails<N>) => void
  readonly runtime: BranchLoadRuntime<N>
  readonly createAbortController: () => AbortController
}

function setLoad<N extends LazyTreeNode>(port: BranchLoadPort<N>, value: string, snapshot: BranchLoadSnapshot): void {
  port.setLoads({ ...port.loads(), [value]: snapshot })
}

/**
 * 为一个懒分支发起取数。已取回、正在取（非强制）、上一轮失败（非强制）时什么都不做；
 * force 是显式重试：中止在途的一轮，重新发。缺 loadChildren 直接落到失败态并回调，不静默。
 */
export function beginBranchLoad<N extends LazyTreeNode>(port: BranchLoadPort<N>, value: string, force: boolean): void {
  const node = findLazyNode(port.collection(), value, port.loadedChildren())
  if (!node || !isLazyBranch(node))
    return
  if (value in port.loadedChildren())
    return
  if (!force && port.loads()[value]?.status === 'error')
    return
  const { controllers, owners, sequence } = port.runtime
  const loadChildren = port.loadChildren()
  if (!loadChildren) {
    const error = new Error(`${port.component} lazy branch "${value}" requires loadChildren`)
    owners.set(value, node)
    setLoad(port, value, { status: 'error', error })
    port.onError({ value, node, error })
    return
  }

  const previous = controllers.get(value)
  if (previous && !force)
    return
  previous?.controller.abort()

  const token = ++sequence.n
  const controller = port.createAbortController()
  controllers.set(value, { controller, token, node })
  owners.set(value, node)
  setLoad(port, value, { status: 'loading' })
  port.onStart({ value, node, reason: force ? 'retry' : 'expand' })

  const current = (): boolean => {
    const entry = controllers.get(value)
    return entry?.controller === controller
      && entry.token === token
      && findLazyNode(port.collection(), value, port.loadedChildren()) === node
      && isLazyBranch(node)
  }

  Promise.resolve()
    .then(() => loadChildren({ node, signal: controller.signal }))
    .then((children) => {
      if (!current() || controller.signal.aborted)
        return
      const resolved = children ? [...children] : []
      controllers.delete(value)
      port.setLoadedChildren({ ...port.loadedChildren(), [value]: resolved })
      setLoad(port, value, { status: 'loaded', empty: resolved.length === 0 })
      port.onLoad({ value, node, children: resolved })
    }, (error: unknown) => {
      if (!current() || controller.signal.aborted)
        return
      controllers.delete(value)
      setLoad(port, value, { status: 'error', error })
      port.onError({ value, node, error })
    })
}

/** 中止一个分支的在途请求，相位回到 idle；没有在途请求时什么都不做。 */
export function cancelBranchLoad<N extends LazyTreeNode>(port: BranchLoadPort<N>, value: string): void {
  const entry = port.runtime.controllers.get(value)
  if (!entry)
    return
  entry.controller.abort()
  port.runtime.controllers.delete(value)
  setLoad(port, value, { status: 'idle' })
}

/** 中止 except 以外所有分支的在途请求。 */
export function cancelBranchLoads<N extends LazyTreeNode>(port: BranchLoadPort<N>, except: ReadonlySet<string> = new Set()): void {
  for (const value of [...port.runtime.controllers.keys()]) {
    if (!except.has(value))
      cancelBranchLoad(port, value)
  }
}

/** 卸载时中止全部在途请求；不再写状态，组件已经不在了。 */
export function abortBranchLoads<N>(runtime: BranchLoadRuntime<N>): void {
  for (const { controller } of runtime.controllers.values())
    controller.abort()
  runtime.controllers.clear()
}

/**
 * collection 变了之后对账：已移除或换了节点对象的分支，中止在途请求、作废取回的子项与相位。
 * 只做清理，不发新请求——要不要为仍展开的分支补发由调用方决定。
 */
export function syncBranchLoads<N extends LazyTreeNode>(port: BranchLoadPort<N>): void {
  const source = port.collection()
  const { controllers, owners } = port.runtime
  const currentChildren = port.loadedChildren()
  const initialLive = lazyBranches(source, currentChildren)
  const children = Object.fromEntries(
    Object.entries(currentChildren).filter(([value]) => initialLive.get(value) === owners.get(value)),
  )
  const live = lazyBranches(source, children)
  for (const [value, entry] of controllers) {
    if (live.get(value) !== entry.node) {
      entry.controller.abort()
      controllers.delete(value)
    }
  }
  const keep = (value: string): boolean => live.get(value) === owners.get(value)
  const loads = Object.fromEntries(Object.entries(port.loads()).filter(([value]) => keep(value)))
  if (Object.keys(loads).length !== Object.keys(port.loads()).length)
    port.setLoads(loads)
  if (Object.keys(children).length !== Object.keys(currentChildren).length)
    port.setLoadedChildren(children)
  for (const value of [...owners.keys()]) {
    if (!keep(value))
      owners.delete(value)
  }
}
