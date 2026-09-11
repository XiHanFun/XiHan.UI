import type { Cleanup } from '@xihan-ui/core'
import { useCallback, useMemo } from 'react'

export type MenuHoverBranch = () => HTMLElement | null

/** Portal 化的子菜单把自己的 positioner 显式登记给全部逻辑祖先。 */
export interface MenuHoverBranchParent {
  registerHoverBranch: (branch: MenuHoverBranch) => Cleanup
}

export interface MenuHoverBranches extends MenuHoverBranchParent {
  getHoverBranches: () => readonly HTMLElement[]
}

const ownerBranches = new WeakMap<object, MenuHoverBranches>()

export function registerMenuHoverOwner(owner: object, branches: MenuHoverBranches): void {
  ownerBranches.set(owner, branches)
}

export function menuHoverParentOf(owner: object): MenuHoverBranchParent {
  const branches = ownerBranches.get(owner)
  if (!branches)
    throw new Error('[xh] Menu 悬停树缺少所属父级')
  return branches
}

export function useMenuHoverBranches(parent?: MenuHoverBranchParent): MenuHoverBranches {
  const branches = useMemo(() => new Set<MenuHoverBranch>(), [])
  const registerInParent = parent?.registerHoverBranch
  const registerHoverBranch = useCallback((branch: MenuHoverBranch): Cleanup => {
    if (branches.has(branch))
      throw new Error('[xh] 同一 Menu 悬停分支不能重复登记')
    branches.add(branch)
    let releaseParent: Cleanup | undefined
    try {
      releaseParent = registerInParent?.(branch)
    }
    catch (error) {
      branches.delete(branch)
      throw error
    }
    let active = true
    return () => {
      if (!active)
        return
      active = false
      branches.delete(branch)
      releaseParent?.()
    }
  }, [branches, registerInParent])
  const getHoverBranches = useCallback((): readonly HTMLElement[] => {
    const nodes: HTMLElement[] = []
    for (const read of branches) {
      const node = read()
      if (node)
        nodes.push(node)
    }
    return Object.freeze(nodes)
  }, [branches])
  return { registerHoverBranch, getHoverBranches }
}
