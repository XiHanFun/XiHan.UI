import type { Cleanup } from '@xihan-ui/core'
import type { MenuSelectDetails } from './menu.types'

/**
 * 一层菜单在逻辑树中的行为端口。DOM 结构可以经 Portal 分离，父子关系仍由本节点维护。
 *
 * 适配器只负责提供节点 getter、关闭命令与组件生命周期；悬停区域汇总和选择收链只在这里实现。
 */
export interface MenuTreeNode {
  /** 登记一个直属子菜单。返回的释放函数幂等。 */
  registerChild: (child: MenuTreeNode) => Cleanup
  /** 当前展开后代经 Portal 搬离本层 content 的全部 positioner。 */
  getHoverBranches: () => readonly HTMLElement[]
  /** 本层菜单完成叶项选择后调用；选择会沿逻辑父链汇到唯一根。 */
  select: (details: MenuSelectDetails) => void
}

export interface MenuTreeNodeOptions {
  /** 本层被定位的 positioner；节点晚于控制器建立，因此必须是 getter。 */
  getPositioner: () => HTMLElement | null
  /** 本层此刻是否展开；关闭的子树不进入祖先悬停区域。 */
  isOpen: () => boolean
  /** 收起本层。叶层由自身机器先收起，本命令只用于收到后代选择的祖先。 */
  close: () => void
  /**
   * 当前没有父节点时能否作为根接收选择。
   * Menu 的 submenu 属性可以动态变化，因此使用 getter 而非创建期常量。
   */
  isRoot: () => boolean
  /** 根选择出口。Menu/ContextMenu 原样上报，Menubar 在这里补所属菜单值。 */
  onRootSelect?: (details: MenuSelectDetails) => void
}

interface MenuTreeState {
  readonly options: MenuTreeNodeOptions
  readonly children: Set<MenuTreeNode>
  parent: MenuTreeNode | null
}

const states = new WeakMap<MenuTreeNode, MenuTreeState>()

function stateOf(node: MenuTreeNode): MenuTreeState {
  const state = states.get(node)
  if (!state)
    throw new TypeError('[xh] Menu 逻辑树只能登记 createMenuTreeNode 创建的节点')
  return state
}

function assertCanAttach(parent: MenuTreeNode, child: MenuTreeNode): void {
  const childState = stateOf(child)
  if (childState.parent === parent)
    throw new Error('[xh] 同一 Menu 子节点不能重复登记')
  if (childState.parent)
    throw new Error('[xh] 同一 Menu 子节点不能同时属于多个父节点')

  for (let cursor: MenuTreeNode | null = parent; cursor; cursor = stateOf(cursor).parent) {
    if (cursor === child)
      throw new Error('[xh] Menu 逻辑树不能形成环')
  }
}

/** 后代已经先收起；沿父链逐层关闭，抵达根时只上报一次并最后关闭根。 */
function acceptDescendantSelection(node: MenuTreeNode, details: MenuSelectDetails): void {
  const state = stateOf(node)
  if (state.parent) {
    state.options.close()
    acceptDescendantSelection(state.parent, details)
    return
  }
  if (!state.options.isRoot())
    throw new Error('[xh] Menu 子树选择时缺少逻辑根')
  state.options.onRootSelect?.(details)
  state.options.close()
}

/** 建立一层框架无关的菜单逻辑树节点。 */
export function createMenuTreeNode(options: MenuTreeNodeOptions): MenuTreeNode {
  const node: MenuTreeNode = {
    registerChild(child) {
      const state = stateOf(node)
      assertCanAttach(node, child)
      const childState = stateOf(child)
      state.children.add(child)
      childState.parent = node

      let active = true
      return () => {
        if (!active)
          return
        active = false
        if (childState.parent !== node)
          return
        childState.parent = null
        state.children.delete(child)
      }
    },
    getHoverBranches() {
      const branches: HTMLElement[] = []
      const seen = new Set<HTMLElement>()
      for (const child of stateOf(node).children) {
        const childState = stateOf(child)
        if (!childState.options.isOpen())
          continue
        const positioner = childState.options.getPositioner()
        if (positioner && !seen.has(positioner)) {
          seen.add(positioner)
          branches.push(positioner)
        }
        for (const branch of child.getHoverBranches()) {
          if (seen.has(branch))
            continue
          seen.add(branch)
          branches.push(branch)
        }
      }
      return Object.freeze(branches)
    },
    select(details) {
      const state = stateOf(node)
      if (state.parent) {
        acceptDescendantSelection(state.parent, details)
        return
      }
      if (!state.options.isRoot())
        throw new Error('[xh] Menu 子树选择时缺少逻辑根')
      // 根菜单自己的机器已经完成关闭；这里只发唯一一次选择通知。
      state.options.onRootSelect?.(details)
    },
  }
  states.set(node, { options, children: new Set(), parent: null })
  return Object.freeze(node)
}
