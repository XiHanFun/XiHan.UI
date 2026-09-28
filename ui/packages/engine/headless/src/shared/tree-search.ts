/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 树形集合的检索裁剪：按检索词把树裁成只剩命中的那几枝。TreeSelect 与 SideNav 共用这一份，
// 不碰 DOM、不看状态机；检索词逐字做子串比对，不拼进正则。

/** 能参与检索的树节点：身份、显示文本与子节点三样。 */
export interface SearchableTreeNode<N> {
  value: string
  label?: string
  children?: readonly N[]
}

/** 匹配规则：节点与 trim 过、非空的检索词，返回是否命中。 */
export type TreeSearchMatch<N> = (node: N, query: string) => boolean

/** 缺省匹配规则：标签（缺省退回值）大小写不敏感包含。 */
export function matchTreeNodeLabel(node: { value: string, label?: string }, query: string): boolean {
  return (node.label ?? node.value).toLowerCase().includes(query.toLowerCase())
}

export interface TreeSearchView<N> {
  /** 裁剪后的树：命中的节点连同整棵子树留下；没命中但有子孙命中的分支只留命中的那几枝。 */
  nodes: N[]
  /** 因子孙命中而留下的分支：搜索视图里缺省展开它们，命中的节点一眼就看得到。 */
  expanded: string[]
}

/**
 * 按检索词裁剪树。query 传入前已 trim 且非空。
 * 命中的节点整枝留下（它的子节点多半也是要找的东西）；没命中的分支若有子孙命中，只留命中的那几枝并展开；
 * 一枝都不剩的节点整个去掉。没有 children 数组的节点只按自己判定。
 */
export function filterTreeNodes<N extends SearchableTreeNode<N>>(
  nodes: readonly N[],
  query: string,
  match: TreeSearchMatch<N>,
): TreeSearchView<N> {
  const expanded: string[] = []
  const walk = (list: readonly N[]): N[] => {
    const out: N[] = []
    for (const node of list) {
      if (match(node, query)) {
        out.push(node)
        continue
      }
      const children = node.children ? walk(node.children) : []
      if (children.length > 0) {
        // 换掉的只有 children，其余字段原样带着：节点的类型不变
        out.push({ ...node, children } as N)
        expanded.push(node.value)
      }
    }
    return out
  }
  return { nodes: walk(nodes), expanded }
}

/** 检索词 trim 后非空时给出裁剪后的树，否则为 null（不在搜索视图里）。 */
export function resolveTreeSearch<N extends SearchableTreeNode<N>>(
  nodes: readonly N[],
  inputValue: string,
  match: TreeSearchMatch<N>,
): TreeSearchView<N> | null {
  const query = inputValue.trim()
  if (query === '')
    return null
  return filterTreeNodes(nodes, query, match)
}
