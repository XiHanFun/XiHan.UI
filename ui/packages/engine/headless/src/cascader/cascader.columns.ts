import type { NavIntent, StepOptions } from '@xihan-ui/core'
import type { CascaderColumn, CascaderLevel, CascaderNode, CascaderNodeMeta } from './cascader.types'
import { stepIndex } from '@xihan-ui/core'

// 级联的纯算法层：不碰 DOM、不认识状态机（connect 在 render 期求值，此时 DOM 尚不存在）。

/** children 是非空数组才算分支；空数组与缺省都是叶子。 */
function isBranch(node: CascaderNode): boolean {
  return Array.isArray(node.children) && node.children.length > 0
}

function toMeta(node: CascaderNode, level: number, parentPath: readonly string[]): CascaderNodeMeta {
  return {
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    branch: isBranch(node),
    level,
    path: [...parentPath, node.value],
  }
}

/**
 * 展开路径 → 当下并排开着的列。
 *
 * 从根列起逐段往右走：走到 activePath[L] 指的那个节点，它是分支就再开一列装它的子节点。
 * 三种情况就地收尾，右边一列都不再开：
 * - 这一段在本列里找不到；
 * - 它是叶子；
 * - 它出现在自己的祖先链上（再下潜会无限递归）。
 */
export function cascaderBuildColumns(
  collection: readonly CascaderNode[],
  activePath: readonly string[],
): CascaderColumn[] {
  const columns: CascaderColumn[] = []
  const parentPath: string[] = []
  const ancestors = new Set<string>()
  let nodes: readonly CascaderNode[] = collection
  let level = 0

  for (;;) {
    columns.push({
      level,
      parentPath: [...parentPath],
      items: nodes.map(node => toMeta(node, level, parentPath)),
    })

    const next = activePath[level]
    if (next === undefined)
      return columns
    const node = nodes.find(item => item.value === next)
    if (!node || !isBranch(node) || ancestors.has(next))
      return columns

    ancestors.add(next)
    parentPath.push(next)
    nodes = node.children!
    level += 1
  }
}

/**
 * 按深度摊开的静态列：第 L 层的全部节点，与展开路径无关。
 *
 * 标记用这一份（条目常挂不卸载），当下该露面的列由 cascaderBuildColumns 给出。
 */
export function cascaderBuildLevels(collection: readonly CascaderNode[]): CascaderLevel[] {
  const levels: CascaderNodeMeta[][] = []

  const walk = (nodes: readonly CascaderNode[], level: number, parentPath: readonly string[], ancestors: ReadonlySet<string>): void => {
    for (const node of nodes) {
      // 桶就地开，空 collection 摊出零层而不是一层空的
      if (!levels[level])
        levels[level] = []
      const bucket = levels[level]!
      const meta = toMeta(node, level, parentPath)
      bucket.push(meta)
      // 环路防护按祖先链判定，同一个值出现在两条不相干分支上不算环
      if (!meta.branch || ancestors.has(node.value))
        continue
      walk(node.children!, level + 1, meta.path, new Set([...ancestors, node.value]))
    }
  }

  walk(collection, 0, [], new Set())
  return levels.map((items, level) => ({ level, items }))
}

/**
 * 全树索引：值 → 元信息，不问它此刻可不可见。
 *
 * value 重复时以先出现的为准。
 */
export function cascaderIndexNodes(collection: readonly CascaderNode[]): Map<string, CascaderNodeMeta> {
  const out = new Map<string, CascaderNodeMeta>()
  for (const level of cascaderBuildLevels(collection)) {
    for (const meta of level.items) {
      if (!out.has(meta.value))
        out.set(meta.value, meta)
    }
  }
  return out
}

/**
 * 沿路径逐段下潜，取末段的元信息；中途断了返回 null。
 *
 * 认整条路径，value 写重时结果与按值索引不同。
 */
export function cascaderNodeAt(
  collection: readonly CascaderNode[],
  path: readonly string[],
): CascaderNodeMeta | null {
  let nodes: readonly CascaderNode[] | undefined = collection
  let meta: CascaderNodeMeta | null = null
  for (let i = 0; i < path.length; i++) {
    // nodes 在循环里被 node.children 重新赋值，不显式标注会绕成自引用推断
    const node: CascaderNode | undefined = nodes?.find(item => item.value === path[i])
    if (!node)
      return null
    meta = toMeta(node, i, path.slice(0, i))
    nodes = node.children
  }
  return meta
}

/**
 * 在第 level 列选中了 value：保留它左边那几段，把第 level 段换成 value，
 * 第 level+1 段起的一切全部丢掉。
 *
 * level 越界时钳到当前长度按追加处理，不会在路径中间留下空洞。
 */
export function cascaderTruncatePath(path: readonly string[], level: number, value: string): string[] {
  const at = Math.max(0, Math.min(level, path.length))
  return [...path.slice(0, at), value]
}

/** 父路径：去掉末段。根层条目的父路径是空数组。 */
export function cascaderParentPath(path: readonly string[]): string[] {
  return path.slice(0, -1)
}

/** 路径按段比。每次归一化都造新数组，引用比不成立。 */
export function cascaderSamePath(
  a: readonly string[] | null | undefined,
  b: readonly string[] | null | undefined,
): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/** 路径的比较键。用 JSON 编码而非拼分隔符，分隔符可能出现在 value 里导致撞键。 */
export function cascaderPathKey(path: readonly string[]): string {
  return JSON.stringify(path)
}

/** 整条路径逐段的显示名；走不通的段原样退回它的 value。 */
export function cascaderPathLabels(
  collection: readonly CascaderNode[],
  path: readonly string[],
): string[] {
  const out: string[] = []
  let nodes: readonly CascaderNode[] | undefined = collection
  for (const value of path) {
    // nodes 在循环里被 node.children 重新赋值，不显式标注会绕成自引用推断
    const node: CascaderNode | undefined = nodes?.find(item => item.value === value)
    out.push(node?.label ?? value)
    nodes = node?.children
  }
  return out
}

/** 整条路径的显示文字：逐段取名字，用分隔符连起来。 */
export function cascaderPathText(
  collection: readonly CascaderNode[],
  path: readonly string[],
  separator: string,
): string {
  return cascaderPathLabels(collection, path).join(separator)
}

/**
 * 在一列之内按意图走一步，禁用条目跳过；无处可去时返回 null。
 *
 * 顺序与禁用取 collection 不取 DOM；焦点落到哪个元素由连接层按值现查。
 */
export function cascaderStepColumn(
  items: readonly CascaderNodeMeta[],
  from: string | null,
  intent: NavIntent,
  options: StepOptions = {},
): CascaderNodeMeta | null {
  const { loop } = options
  const index = from == null ? -1 : items.findIndex(item => item.value === from)
  const next = stepIndex(items.length, index, intent, {
    loop,
    skip: options.skip ?? (i => items[i]!.disabled),
  })
  return next < 0 ? null : items[next]!
}
