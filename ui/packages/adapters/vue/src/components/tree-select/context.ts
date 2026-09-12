import type { TreeSelectNodeProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { TreeSelectContext } from './use-tree-select'
import { inject, provide } from 'vue'

/** 节点自报的值，供 item / branch 的子部件复用同一份声明；层级、禁用与标签回 collection 里查。 */
export interface TreeSelectNodeContext {
  node: ComputedRef<TreeSelectNodeProps>
}

export interface TreeSelectContentContext {
  authoredEmptyCount: Ref<number>
  authoredLoadingCount: Ref<number>
  registerEmpty: () => () => void
  registerLoading: () => () => void
}

const KEY: InjectionKey<TreeSelectContext> = Symbol.for('xh-tree-select')
const NODE_KEY: InjectionKey<TreeSelectNodeContext> = Symbol.for('xh-tree-select-node')
const CONTENT_KEY: InjectionKey<TreeSelectContentContext> = Symbol.for('xh-tree-select-content')

export function provideTreeSelect(ctx: TreeSelectContext): void {
  provide(KEY, ctx)
}

export function useTreeSelectContext(): TreeSelectContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TreeSelect 部件必须用在 XhTreeSelectRoot 内')
  return ctx
}

export function provideTreeSelectNode(ctx: TreeSelectNodeContext): void {
  provide(NODE_KEY, ctx)
}

export function useTreeSelectNodeContext(): TreeSelectNodeContext {
  const ctx = inject(NODE_KEY, null)
  if (!ctx)
    throw new Error('[xh] TreeSelect 节点子部件必须用在 XhTreeSelectItem 或 XhTreeSelectBranch 内')
  return ctx
}

export function provideTreeSelectContent(ctx: TreeSelectContentContext): void {
  provide(CONTENT_KEY, ctx)
}

export function useTreeSelectContentContext(): TreeSelectContentContext {
  const ctx = inject(CONTENT_KEY, null)
  if (!ctx)
    throw new Error('[xh] TreeSelect Empty / Loading 必须用在 XhTreeSelectContent 内')
  return ctx
}
