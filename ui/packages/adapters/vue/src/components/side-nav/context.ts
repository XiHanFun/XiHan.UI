import type { InjectionKey } from 'vue'
import type { SideNavContext } from './use-side-nav'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SideNavContext> = Symbol.for('xh-side-nav')

export function provideSideNav(ctx: SideNavContext): void {
  provide(KEY, ctx)
}

export function useSideNavContext(): SideNavContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] SideNav 部件必须用在 XhSideNavRoot 内')
  return ctx
}

/** 分支上下文：子部件从中取所属分支的 value，不必逐个再声明。 */
const NODE_KEY: InjectionKey<{ value: string }> = Symbol.for('xh-side-nav-node')

export function provideSideNavNode(node: { value: string }): void {
  provide(NODE_KEY, node)
}

export function useSideNavNodeContext(): { value: string } {
  const node = inject(NODE_KEY, null)
  if (!node)
    throw new Error('[xh] SideNav 分支部件必须用在 XhSideNavBranch 内')
  return node
}
