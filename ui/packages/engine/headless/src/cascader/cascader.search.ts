// 搜索候选的纯运算：把树摊平成整条路径，按连缀文本过滤。不碰 DOM、不看状态机。
import type { CascaderNode } from './cascader.types'

export interface CascaderSearchCandidate {
  path: string[]
  /** 整条路径逐段的显示名。 */
  labels: string[]
  /** 路径上任何一段禁用即整条禁用。 */
  disabled: boolean
}

/** 摊平成候选：叶子恒在；changeOnSelect 打开时分支路径也算一条（它本身就能落值）。 */
export function cascaderSearchCandidates(
  collection: readonly CascaderNode[],
  changeOnSelect: boolean,
): CascaderSearchCandidate[] {
  const out: CascaderSearchCandidate[] = []
  const walk = (nodes: readonly CascaderNode[], path: string[], labels: string[], disabled: boolean): void => {
    for (const node of nodes) {
      const nextPath = [...path, node.value]
      const nextLabels = [...labels, node.label ?? node.value]
      const nextDisabled = disabled || !!node.disabled
      if (node.children?.length) {
        if (changeOnSelect)
          out.push({ path: nextPath, labels: nextLabels, disabled: nextDisabled })
        walk(node.children, nextPath, nextLabels, nextDisabled)
      }
      else {
        out.push({ path: nextPath, labels: nextLabels, disabled: nextDisabled })
      }
    }
  }
  walk(collection, [], [], false)
  return out
}

/** 大小写不敏感的连缀包含过滤；空串给全量。 */
export function cascaderFilterCandidates(
  candidates: readonly CascaderSearchCandidate[],
  query: string,
): CascaderSearchCandidate[] {
  const q = query.trim().toLowerCase()
  if (!q)
    return [...candidates]
  return candidates.filter(candidate => candidate.labels.join('/').toLowerCase().includes(q))
}

/** 候选高亮的最小形状：这两个助手只看禁用与否。 */
interface CascaderSearchSelectable {
  disabled: boolean
}

/**
 * 把存下来的高亮下标落到一条可选候选上：先夹进候选区间，
 * 落在禁用候选上就往后顺延（绕回头部再找），整批都禁用给 -1。
 */
export function cascaderResolveSearchHighlight(
  results: readonly CascaderSearchSelectable[],
  stored: number,
): number {
  if (results.length === 0)
    return -1
  const start = Math.min(Math.max(stored, 0), results.length - 1)
  for (let step = 0; step < results.length; step++) {
    const at = (start + step) % results.length
    if (!results[at]!.disabled)
      return at
  }
  return -1
}

/**
 * 候选列表里走一步：禁用候选跳过，越界时 loop 开就绕、关就停在原地（返回 -1）。
 * from 传 -1 配 delta=1 即「从头找首个可选」，传 length 配 delta=-1 即「从尾找末个可选」。
 */
export function cascaderStepSearch(
  results: readonly CascaderSearchSelectable[],
  from: number,
  delta: 1 | -1,
  loop: boolean,
): number {
  const size = results.length
  if (size === 0)
    return -1
  for (let step = 1; step <= size; step++) {
    let at = from + delta * step
    if (at < 0 || at >= size) {
      if (!loop)
        return -1
      at = ((at % size) + size) % size
    }
    if (!results[at]!.disabled)
      return at
  }
  return -1
}
