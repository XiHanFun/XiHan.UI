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
