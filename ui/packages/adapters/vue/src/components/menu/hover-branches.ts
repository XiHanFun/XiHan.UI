import type { Cleanup } from '@xihan-ui/core'

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

export function createMenuHoverBranches(parent?: MenuHoverBranchParent): MenuHoverBranches {
  const branches = new Set<MenuHoverBranch>()
  const registerHoverBranch = (branch: MenuHoverBranch): Cleanup => {
    if (branches.has(branch))
      throw new Error('[xh] 同一 Menu 悬停分支不能重复登记')
    branches.add(branch)
    let releaseParent: Cleanup | undefined
    try {
      releaseParent = parent?.registerHoverBranch(branch)
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
  }
  const getHoverBranches = (): readonly HTMLElement[] => {
    const nodes: HTMLElement[] = []
    for (const read of branches) {
      const node = read()
      if (node)
        nodes.push(node)
    }
    return Object.freeze(nodes)
  }
  return { registerHoverBranch, getHoverBranches }
}
