import type { NavIntent, StepOptions } from '@xihan-ui/behavior'
import type { CascaderColumn, CascaderLevel, CascaderNode, CascaderNodeMeta } from './cascader.types'
import { stepIndex } from '@xihan-ui/behavior'

// 级联的纯算法：一行 DOM 都不碰，也不认识状态机。
// 「展开路径 → 该显示哪几列、每列有哪些条目」是这个组件的全部核心，它在这里收口，
// 连接层与机器都只调用，不各算各的。Vue 在 render 期求值 connect（那一刻 DOM 还不存在），
// 因此这层必须是纯的。

/** children 是**非空**数组才算分支。空数组与缺省都是叶子——右边开一列空的没有意义。 */
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
 * - 这一段在本列里找不到（数据换了、路径过期）；
 * - 它是叶子（没有子节点可展开）；
 * - 它出现在自己的祖先链上（作者把 value 写重了，再下潜就是无限递归）。
 *
 * 于是「选了靠左的一列就把它右边原有的列全砍掉」不需要另写一套逻辑：
 * 路径一旦被截短，列自然就少了。
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
 * 作者写标记要的是这一份（每层一个 column、层内节点各一个 item），
 * 当下该露面的是哪些则由 cascaderBuildColumns 说了算。两份分开是必需的——
 * 条目常挂不卸载，光有「当下可见的列」写不出一份稳定的标记。
 */
export function cascaderBuildLevels(collection: readonly CascaderNode[]): CascaderLevel[] {
  const levels: CascaderNodeMeta[][] = []

  const walk = (nodes: readonly CascaderNode[], level: number, parentPath: readonly string[], ancestors: ReadonlySet<string>): void => {
    for (const node of nodes) {
      // 桶就地开：空的一层不该凭空多出来（空 collection 摊出的是零层，不是一层空的）
      if (!levels[level])
        levels[level] = []
      const bucket = levels[level]!
      const meta = toMeta(node, level, parentPath)
      bucket.push(meta)
      // 环路防护取「祖先链」而不是「见过的全部值」：同一个值出现在两条不相干的分支里
      // 只是作者写错了 value，而一个节点出现在自己的祖先链上才是真环
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
 * 条目在标记里是常挂的，连接层照样得给收起状态下的条目产出属性，因此索引必须覆盖全树。
 * value 重复时以先出现的为准，保证「按值取元信息」是确定的。
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
 * 与索引不同，这里认的是**整条路径**：value 万一写重了，按路径走到的才是作者真正指的那个。
 */
export function cascaderNodeAt(
  collection: readonly CascaderNode[],
  path: readonly string[],
): CascaderNodeMeta | null {
  let nodes: readonly CascaderNode[] | undefined = collection
  let meta: CascaderNodeMeta | null = null
  for (let i = 0; i < path.length; i++) {
    // 显式标注：nodes 在循环里被 node.children 重新赋值，不标注会绕成自引用推断
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
 * 这是级联唯一的路径写入口——列的增减完全由它决定，也就没有第二处能把列改错。
 * level 越界时按追加一段处理（钳到当前长度），不会在路径中间留下空洞。
 */
export function cascaderTruncatePath(path: readonly string[], level: number, value: string): string[] {
  const at = Math.max(0, Math.min(level, path.length))
  return [...path.slice(0, at), value]
}

/** 父路径：去掉末段。根层条目的父路径是空数组。 */
export function cascaderParentPath(path: readonly string[]): string[] {
  return path.slice(0, -1)
}

/** 路径按段比。数组引用比在这里一律不成立：每次归一化都会造出新数组。 */
export function cascaderSamePath(
  a: readonly string[] | null | undefined,
  b: readonly string[] | null | undefined,
): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * 路径的比较键。选中集合是路径的集合，去重与「是否已选中」都得按内容比。
 * 用 JSON 编码而不是拼分隔符：任何分隔符都可能出现在作者写的 value 里，
 * `['a','b']` 与 `['a-b']` 拼出来会是同一个键，编码之后则撞不到一起。
 */
export function cascaderPathKey(path: readonly string[]): string {
  return JSON.stringify(path)
}

/**
 * 整条路径逐段的显示名。走不通的段原样退回它的 value——
 * 数据换了而选中值还指着旧路径时，回显里至少还留着用户当初选的东西，而不是整条空掉。
 */
export function cascaderPathLabels(
  collection: readonly CascaderNode[],
  path: readonly string[],
): string[] {
  const out: string[] = []
  let nodes: readonly CascaderNode[] | undefined = collection
  for (const value of path) {
    // 显式标注：nodes 在循环里被 node.children 重新赋值，不标注会绕成自引用推断
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
 * 顺序与禁用都取 collection 而不是 DOM：它是唯一事实源，机器在没有 DOM 的环境里
 * （纯逻辑测试、SSR）也得算得出落点。焦点最终落到哪个元素上另由连接层按值现查。
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
