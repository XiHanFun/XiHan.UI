// @vitest-environment jsdom
import type { MenuSelectDetails } from '../src'
import { describe, expect, it, vi } from 'vitest'
import { createMenuTreeNode } from '../src'

interface Harness {
  node: ReturnType<typeof createMenuTreeNode>
  readonly positioner: HTMLElement
  open: boolean
}

function layer(name: string, log: string[], options: {
  root?: boolean
  onRootSelect?: (details: MenuSelectDetails) => void
} = {}): Harness {
  const positioner = document.createElement('div')
  positioner.dataset.layer = name
  let open = true
  const node = createMenuTreeNode({
    getPositioner: () => positioner,
    isOpen: () => open,
    close: () => {
      log.push(`close:${name}`)
      open = false
    },
    isRoot: () => options.root === true,
    onRootSelect: options.onRootSelect,
  })
  return {
    node,
    positioner,
    get open() {
      return open
    },
    set open(value) {
      open = value
    },
  }
}

describe('menu 逻辑树', () => {
  it('只汇总展开子树的 Portal positioner，释放幂等且会从全部祖先退出', () => {
    const log: string[] = []
    const root = layer('root', log, { root: true })
    const middle = layer('middle', log)
    const leaf = layer('leaf', log)
    const releaseMiddle = root.node.registerChild(middle.node)
    const releaseLeaf = middle.node.registerChild(leaf.node)

    expect(root.node.getHoverBranches()).toEqual([middle.positioner, leaf.positioner])
    expect(middle.node.getHoverBranches()).toEqual([leaf.positioner])

    leaf.open = false
    expect(root.node.getHoverBranches()).toEqual([middle.positioner])
    leaf.open = true
    releaseLeaf()
    releaseLeaf()
    expect(root.node.getHoverBranches()).toEqual([middle.positioner])

    releaseMiddle()
    releaseMiddle()
    expect(root.node.getHoverBranches()).toEqual([])
  })

  it('拒绝重复所有权、多父所有权与环', () => {
    const root = layer('root', [], { root: true })
    const middle = layer('middle', [])
    const other = layer('other', [], { root: true })
    const release = root.node.registerChild(middle.node)

    expect(() => root.node.registerChild(middle.node)).toThrow(/重复登记/)
    expect(() => other.node.registerChild(middle.node)).toThrow(/多个父节点/)
    expect(() => middle.node.registerChild(root.node)).toThrow(/形成环/)

    release()
    expect(() => other.node.registerChild(middle.node)).not.toThrow()
  })

  it('三级叶项按叶到根收链，根选择只上报一次', () => {
    const log: string[] = []
    const selected = vi.fn((details: MenuSelectDetails) => log.push(`select:${details.value}`))
    const root = layer('root', log, { root: true, onRootSelect: selected })
    const middle = layer('middle', log)
    const leaf = layer('leaf', log)
    root.node.registerChild(middle.node)
    middle.node.registerChild(leaf.node)

    // Menu 机器在调用 tree.select 前已经先拆掉叶层行为资源。
    log.push('close:leaf')
    leaf.open = false
    leaf.node.select({ value: 'send' })

    expect(log).toEqual(['close:leaf', 'close:middle', 'select:send', 'close:root'])
    expect(selected).toHaveBeenCalledOnce()
    expect(selected).toHaveBeenCalledWith({ value: 'send' })
  })

  it('根菜单直接选择不重复关闭，根出口可映射 ContextMenu 与 Menubar 载荷', () => {
    const menu: MenuSelectDetails[] = []
    const contextMenu: MenuSelectDetails[] = []
    const menubar: Array<{ menu: string, value: string }> = []
    const direct = layer('menu', [], { root: true, onRootSelect: details => menu.push(details) })
    const context = layer('context-menu', [], { root: true, onRootSelect: details => contextMenu.push(details) })
    const bar = layer('menubar', [], {
      root: true,
      onRootSelect: details => menubar.push({ menu: 'file', value: details.value }),
    })

    direct.node.select({ value: 'open' })
    context.node.select({ value: 'copy' })
    const child = layer('submenu', [])
    bar.node.registerChild(child.node)
    child.node.select({ value: 'save' })

    expect(menu).toEqual([{ value: 'open' }])
    expect(contextMenu).toEqual([{ value: 'copy' }])
    expect(menubar).toEqual([{ menu: 'file', value: 'save' }])
  })

  it('未登记的子菜单不会静默吞掉选择', () => {
    const detached = layer('detached', [])
    expect(() => detached.node.select({ value: 'orphan' })).toThrow(/缺少逻辑根/)
  })
})
