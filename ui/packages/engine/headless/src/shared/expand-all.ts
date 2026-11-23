/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全部展开：树与树选择共用一套判据。
//
// 「全部」指此刻已有子项的分支——作者写了 children 的，或懒分支已取回子项的。还没取回子项的懒分支不在其列：
// 把它们也算进去，一句全部展开就等于把每个懒分支都请求一遍。
// defaultExpandAll 是非受控的初值，按挂载时的 collection 算；数据晚到（挂载时 collection 还是空的）时，
// 等第一份非空的到了再展开一次，之后不再跟随。

import type { LazyTreeNode } from './lazy-branch'
import { isLazyBranch } from './lazy-branch'

/**
 * 全部展开要展开的分支，按深度优先的出现次序。
 * 环路防护取祖先链：一个节点出现在自己的祖先链上才是真环，不再下潜。
 */
export function expandableBranches<N extends LazyTreeNode>(
  nodes: readonly N[],
  loadedChildren: Readonly<Record<string, N[]>> = {},
): string[] {
  const out: string[] = []
  const walk = (level: readonly N[], ancestors: ReadonlySet<string>): void => {
    for (const node of level) {
      const children = (node.children as N[] | undefined) ?? (isLazyBranch(node) ? loadedChildren[node.value] : undefined)
      if (!children || ancestors.has(node.value))
        continue
      out.push(node.value)
      walk(children, new Set([...ancestors, node.value]))
    }
  }
  walk(nodes, new Set())
  return out
}

/** 与展开初值有关的那几个 prop；树与树选择同名同义。 */
export interface ExpandSeedProps<N extends LazyTreeNode> {
  collection: readonly N[] | undefined
  defaultExpandAll: boolean | undefined
  defaultExpandedValue: string[] | undefined
  expandedValue: string[] | undefined
}

/** 非受控的展开初值：defaultExpandedValue 优先，其次 defaultExpandAll 按此刻的 collection 算，都没有即全收起。 */
export function seedExpandedValue<N extends LazyTreeNode>(props: Omit<ExpandSeedProps<N>, 'expandedValue'>): string[] {
  return props.defaultExpandedValue ?? (props.defaultExpandAll ? expandableBranches(props.collection ?? []) : [])
}

/** 默认全部展开而数据还没到：要等第一份非空的 collection。受控或另给了 defaultExpandedValue 时不等。 */
export function awaitsExpandAll<N extends LazyTreeNode>(props: ExpandSeedProps<N>): boolean {
  return props.defaultExpandAll === true
    && props.defaultExpandedValue === undefined
    && props.expandedValue === undefined
    && (props.collection ?? []).length === 0
}
