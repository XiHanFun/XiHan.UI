// 树形勾选的级联算法：向下传导、向上聚合（含半选）、回显收敛。
// 纯函数，节点结构上只认 value/disabled/children 三个键，tree / tree-select /
// cascader 的集合都可直接喂。值须全树唯一，重复值以先出现的那个为准。

/** 参与级联的最小节点形状。 */
export interface CascadeNodeLike {
  value: string
  /** 禁用节点的勾选态被冻结：级联传导跳过它，向上聚合仍按它当前的态计。 */
  disabled?: boolean
  children?: readonly CascadeNodeLike[]
}

/** 回显收敛策略：all = 全部勾中节点；parent = 收到最高的整枝；child = 只留叶。 */
export type CascadeStrategy = 'all' | 'parent' | 'child'

export interface CascadeState {
  /** 勾中集：叶按自身、分支按「有效叶后代全勾中」判。 */
  checked: Set<string>
  /** 半选集：分支的有效叶后代有勾有不勾。 */
  indeterminate: Set<string>
}

interface CascadeIndex {
  /** 文档序节点表；重复值只收首个。 */
  nodes: Map<string, CascadeNodeLike>
  parentOf: Map<string, string | null>
  /** 有效叶：没有子节点的节点（children 为空数组的分支同样按叶计）。 */
  leavesOf: Map<string, string[]>
}

function buildIndex(roots: readonly CascadeNodeLike[]): CascadeIndex {
  const nodes = new Map<string, CascadeNodeLike>()
  const parentOf = new Map<string, string | null>()
  const leavesOf = new Map<string, string[]>()

  const walk = (node: CascadeNodeLike, parent: string | null): string[] => {
    if (nodes.has(node.value))
      return []
    nodes.set(node.value, node)
    parentOf.set(node.value, parent)
    const kids = node.children ?? []
    let leaves: string[]
    if (kids.length === 0) {
      leaves = [node.value]
    }
    else {
      leaves = []
      for (const child of kids)
        leaves.push(...walk(child, node.value))
    }
    leavesOf.set(node.value, leaves)
    return leaves
  }
  for (const root of roots)
    walk(root, null)
  return { nodes, parentOf, leavesOf }
}

/** 输入集合规范化成叶真值：集合里出现的值代表它与它的整棵子树都勾中。 */
function leafTruth(index: CascadeIndex, checkedValues: Iterable<string>): Set<string> {
  const leaves = new Set<string>()
  for (const value of checkedValues) {
    for (const leaf of index.leavesOf.get(value) ?? [])
      leaves.add(leaf)
  }
  return leaves
}

function stateFromLeaves(index: CascadeIndex, leaves: ReadonlySet<string>): CascadeState {
  const checked = new Set<string>()
  const indeterminate = new Set<string>()
  for (const [value] of index.nodes) {
    const own = index.leavesOf.get(value)!
    if (own.length === 0)
      continue
    let hit = 0
    for (const leaf of own) {
      if (leaves.has(leaf))
        hit++
    }
    if (hit === own.length)
      checked.add(value)
    else if (hit > 0)
      indeterminate.add(value)
  }
  return { checked, indeterminate }
}

/**
 * 由任意形态的勾选集（最小式、全量式或叶集）算出完整勾选态。
 * 分支勾中当且仅当其全部有效叶勾中；有勾有不勾即半选。
 */
export function cascadeState(roots: readonly CascadeNodeLike[], checkedValues: Iterable<string>): CascadeState {
  const index = buildIndex(roots)
  return stateFromLeaves(index, leafTruth(index, checkedValues))
}

/**
 * 级联翻转一个节点：向下传导到整棵子树的有效叶（禁用子树不动），向上由聚合自然得出。
 * next 显式给定即设定，不给按当前态翻转。返回完整勾选态（checked 为全量式）。
 */
export function cascadeToggle(
  roots: readonly CascadeNodeLike[],
  checkedValues: Iterable<string>,
  value: string,
  next?: boolean,
): CascadeState {
  const index = buildIndex(roots)
  const leaves = leafTruth(index, checkedValues)
  const own = index.leavesOf.get(value)
  if (!own)
    return stateFromLeaves(index, leaves)

  const target = next ?? !own.every(leaf => leaves.has(leaf))

  // 收集要动的叶：从被点节点往下走，禁用子树整棵冻结
  const movable: string[] = []
  const collect = (node: CascadeNodeLike): void => {
    // 被点的节点自己禁用时也不动——禁用即冻结，入口一致
    if (node.disabled)
      return
    const kids = node.children ?? []
    if (kids.length === 0) {
      movable.push(node.value)
      return
    }
    for (const child of kids)
      collect(child)
  }
  const origin = index.nodes.get(value)
  if (origin)
    collect(origin)

  for (const leaf of movable) {
    if (target)
      leaves.add(leaf)
    else leaves.delete(leaf)
  }
  return stateFromLeaves(index, leaves)
}

/**
 * 回显收敛：把完整勾选态按策略折叠成对外的值列表（文档序）。
 * all = 全部勾中节点；parent = 勾中且父未勾中的最高整枝；child = 勾中的叶。
 */
export function collapseChecked(
  roots: readonly CascadeNodeLike[],
  checkedValues: Iterable<string>,
  strategy: CascadeStrategy,
): string[] {
  const index = buildIndex(roots)
  const { checked } = stateFromLeaves(index, leafTruth(index, checkedValues))
  const out: string[] = []
  for (const [value] of index.nodes) {
    if (!checked.has(value))
      continue
    if (strategy === 'all') {
      out.push(value)
      continue
    }
    const parent = index.parentOf.get(value)
    const parentChecked = parent != null && checked.has(parent)
    if (strategy === 'parent' && !parentChecked)
      out.push(value)
    if (strategy === 'child' && index.leavesOf.get(value)!.length === 1 && index.leavesOf.get(value)![0] === value)
      out.push(value)
  }
  return out
}
