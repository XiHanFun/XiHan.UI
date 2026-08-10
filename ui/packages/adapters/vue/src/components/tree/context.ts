import type { TreeNodeProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TreeContext } from './use-tree'
import { inject, provide } from 'vue'

/** 节点自报的值，供 item / branch 的子部件复用同一份声明；层级、禁用与标签回 collection 里查。 */
export interface TreeNodeContext {
  node: ComputedRef<TreeNodeProps>
}

const KEY: InjectionKey<TreeContext> = Symbol('xh-tree')
const NODE_KEY: InjectionKey<TreeNodeContext> = Symbol('xh-tree-node')

export function provideTree(ctx: TreeContext): void {
  provide(KEY, ctx)
}

export function useTreeContext(): TreeContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tree 部件必须用在 XhTreeRoot 内')
  return ctx
}

export function provideTreeNode(ctx: TreeNodeContext): void {
  provide(NODE_KEY, ctx)
}

export function useTreeNodeContext(): TreeNodeContext {
  const ctx = inject(NODE_KEY, null)
  if (!ctx)
    throw new Error('[xh] Tree 节点子部件必须用在 XhTreeItem 或 XhTreeBranch 内')
  return ctx
}
