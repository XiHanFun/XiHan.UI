/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 搜索候选的纯运算：把树摊平成整条路径，按连缀文本过滤。不碰 DOM、不看状态机。
import type { CascaderFilter, CascaderNode, CascaderSearchCandidate } from './cascader.types'
import { isCascaderLazyBranch } from './cascader.columns'

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
      else if (isCascaderLazyBranch(node)) {
        // 懒分支还没取回：子项未知，只有它本身能落值时才算一条
        if (changeOnSelect)
          out.push({ path: nextPath, labels: nextLabels, disabled: nextDisabled })
      }
      else {
        out.push({ path: nextPath, labels: nextLabels, disabled: nextDisabled })
      }
    }
  }
  walk(collection, [], [], false)
  return out
}

/** 按 filter 过滤候选，缺省为大小写不敏感的连缀包含；空串给全量，不调用谓词。 */
export function cascaderFilterCandidates(
  candidates: readonly CascaderSearchCandidate[],
  query: string,
  filter?: CascaderFilter,
): CascaderSearchCandidate[] {
  const q = query.trim()
  if (!q)
    return [...candidates]
  if (filter)
    return candidates.filter(candidate => filter(candidate, q))
  const needle = q.toLowerCase()
  return candidates.filter(candidate => candidate.labels.join('/').toLowerCase().includes(needle))
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
