// @vitest-environment jsdom
// 默认全部展开与全部展开 / 收起：树与树选择共用一套判据（shared/expand-all），这里把两侧的接线一并核掉。
import type { TreeNode, TreeSchema } from '../src/tree'
import type { TreeSelectNode, TreeSelectSchema } from '../src/tree-select'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { expandableBranches } from '../src/shared/expand-all'
import { connectTree, treeMachine } from '../src/tree'
import { connectTreeSelect, treeSelectMachine } from '../src/tree-select'

const runtimes: { stop: () => void }[] = []

function mountTree(initial: Partial<TreeSchema['props']>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<TreeSchema['props']>>(initial)
  const service = createService(treeMachine, { props: () => props.get(), runtime })
  runtime.start()
  runtimes.push(runtime)
  return {
    api: () => connectTree(service, normalizeProps),
    setProps: (next: Partial<TreeSchema['props']>) => props.set({ ...props.get(), ...next }),
  }
}

function mountTreeSelect(initial: Partial<TreeSelectSchema['props']>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<TreeSelectSchema['props']>>(initial)
  const service = createService(treeSelectMachine, { props: () => props.get(), runtime })
  runtime.start()
  runtimes.push(runtime)
  return {
    api: () => connectTreeSelect(service, normalizeProps),
    setProps: (next: Partial<TreeSelectSchema['props']>) => props.set({ ...props.get(), ...next }),
  }
}

/** flush 在 vanilla 运行时是一枚微任务，请求兑现再走几枚。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0))
    runtime.stop()
})

/** src 套着 utils，docs 是「暂时没有子项的目录」（空数组也算分支），remote 是还没取过的懒分支。 */
const COLLECTION: TreeNode[] = [
  {
    value: 'src',
    children: [
      { value: 'index' },
      { value: 'utils', children: [{ value: 'dom' }] },
    ],
  },
  { value: 'docs', children: [] },
  { value: 'remote', hasChildren: true },
  { value: 'license' },
]

describe('expandableBranches 全部展开要展开哪些分支', () => {
  it('写了 children 的分支逐层都算，空数组也算；叶子不算', () => {
    expect(expandableBranches(COLLECTION)).toEqual(['src', 'utils', 'docs'])
  })

  it('还没取回子项的懒分支不算；取回之后连同里面的分支一起算', () => {
    const loaded = { remote: [{ value: 'remote-a', children: [{ value: 'remote-a-1' }] }] }
    expect(expandableBranches(COLLECTION, loaded)).toEqual(['src', 'utils', 'docs', 'remote', 'remote-a'])
  })

  it('自引用的畸形数据不会无限递归：祖先链上的值不再下潜', () => {
    const loop: TreeNode = { value: 'a', children: [] }
    loop.children!.push(loop)
    expect(expandableBranches([loop])).toEqual(['a'])
  })
})

describe('tree 的 defaultExpandAll', () => {
  it('挂上即展开全部已有子项的分支，不发变更通知，也不去取懒分支', async () => {
    const onExpandedValueChange = vi.fn()
    const loadChildren = vi.fn(async () => [])
    const h = mountTree({ collection: COLLECTION, defaultExpandAll: true, onExpandedValueChange, loadChildren })
    await tick()

    expect(h.api().expandedValue).toEqual(['src', 'utils', 'docs'])
    expect(h.api().visibleNodes.map(node => node.value)).toEqual(['src', 'index', 'utils', 'dom', 'docs', 'remote', 'license'])
    expect(onExpandedValueChange).not.toHaveBeenCalled()
    expect(loadChildren).not.toHaveBeenCalled()
  })

  it('同时给了 defaultExpandedValue 时以它为准', () => {
    const h = mountTree({ collection: COLLECTION, defaultExpandAll: true, defaultExpandedValue: ['docs'] })
    expect(h.api().expandedValue).toEqual(['docs'])
  })

  it('受控时无效：展开集合只听 expandedValue', () => {
    const h = mountTree({ collection: COLLECTION, defaultExpandAll: true, expandedValue: [] })
    expect(h.api().expandedValue).toEqual([])
  })

  it('数据晚到：挂载时还是空的，第一份非空的 collection 到了才展开，并发一次变更通知', async () => {
    const onExpandedValueChange = vi.fn()
    const h = mountTree({ collection: [], defaultExpandAll: true, onExpandedValueChange })
    expect(h.api().expandedValue).toEqual([])

    h.setProps({ collection: COLLECTION })
    await tick()
    expect(h.api().expandedValue).toEqual(['src', 'utils', 'docs'])
    expect(onExpandedValueChange).toHaveBeenCalledTimes(1)
    expect(onExpandedValueChange).toHaveBeenCalledWith({ value: ['src', 'utils', 'docs'] })
  })

  it('只认第一份非空的数据：之后换数据不再跟着展开，作者收起的也不会被再展开', async () => {
    const h = mountTree({ collection: [], defaultExpandAll: true })
    h.setProps({ collection: COLLECTION })
    await tick()
    h.api().collapseAll()
    expect(h.api().expandedValue).toEqual([])

    h.setProps({ collection: [{ value: 'next', children: [{ value: 'next-1' }] }] })
    await tick()
    expect(h.api().expandedValue).toEqual([])
  })

  it('挂载时已有数据：之后换数据不再跟着展开', async () => {
    const h = mountTree({ collection: [{ value: 'only' }], defaultExpandAll: true })
    h.setProps({ collection: COLLECTION })
    await tick()
    expect(h.api().expandedValue).toEqual([])
  })

  it('等数据的这段时间里展开集合已被写过，数据到了不再替作者决定', async () => {
    const h = mountTree({ collection: [], defaultExpandAll: true })
    h.api().setExpandedValue(['docs'])
    h.setProps({ collection: COLLECTION })
    await tick()
    expect(h.api().expandedValue).toEqual(['docs'])
  })
})

describe('tree 的 expandAll / collapseAll', () => {
  it('expandAll 展开全部已有子项的分支，collapseAll 全部收起，各发一次变更通知', () => {
    const onExpandedValueChange = vi.fn()
    const h = mountTree({ collection: COLLECTION, onExpandedValueChange })

    h.api().expandAll()
    expect(h.api().expandedValue).toEqual(['src', 'utils', 'docs'])
    h.api().expandAll()
    expect(onExpandedValueChange).toHaveBeenCalledTimes(1)

    h.api().collapseAll()
    expect(h.api().expandedValue).toEqual([])
    expect(onExpandedValueChange).toHaveBeenCalledTimes(2)
  })

  it('expandAll 不动还没取回子项的懒分支：没展开的不去取，正在取的不被收起', async () => {
    const loadChildren = vi.fn(() => new Promise<TreeNode[]>(() => {}))
    const h = mountTree({ collection: COLLECTION, loadChildren })

    h.api().expandAll()
    await tick()
    expect(loadChildren).not.toHaveBeenCalled()

    h.api().collapseAll()
    h.api().expand('remote')
    await tick()
    expect(loadChildren).toHaveBeenCalledTimes(1)
    h.api().expandAll()
    await tick()
    expect(h.api().expandedValue).toEqual(['remote', 'src', 'utils', 'docs'])
    expect(h.api().branchLoadState('remote')).toEqual({ status: 'loading' })
    expect(loadChildren).toHaveBeenCalledTimes(1)
  })

  it('取回子项的懒分支算进 expandAll', async () => {
    const loadChildren = vi.fn(async () => [{ value: 'remote-a', children: [{ value: 'remote-a-1' }] }])
    const h = mountTree({ collection: COLLECTION, loadChildren })
    h.api().expand('remote')
    await tick()
    expect(h.api().branchLoadState('remote')).toEqual({ status: 'loaded', empty: false })

    h.api().expandAll()
    expect(h.api().expandedValue).toEqual(['remote', 'src', 'utils', 'docs', 'remote-a'])
  })

  it('受控：只发意图，宿主写回才生效', () => {
    const onExpandedValueChange = vi.fn()
    const h = mountTree({ collection: COLLECTION, expandedValue: [], onExpandedValueChange })
    h.api().expandAll()
    expect(h.api().expandedValue).toEqual([])
    expect(onExpandedValueChange).toHaveBeenCalledWith({ value: ['src', 'utils', 'docs'] })
  })
})

describe('tree-select 的全部展开', () => {
  const nodes: TreeSelectNode[] = COLLECTION

  it('defaultExpandAll 挂上即展开全部已有子项的分支，不发变更通知', () => {
    const onExpandedValueChange = vi.fn()
    const h = mountTreeSelect({ collection: nodes, defaultExpandAll: true, onExpandedValueChange })
    expect(h.api().expandedValue).toEqual(['src', 'utils', 'docs'])
    expect(onExpandedValueChange).not.toHaveBeenCalled()
  })

  it('defaultExpandedValue 优先，受控时无效', () => {
    expect(mountTreeSelect({ collection: nodes, defaultExpandAll: true, defaultExpandedValue: ['docs'] }).api().expandedValue).toEqual(['docs'])
    expect(mountTreeSelect({ collection: nodes, defaultExpandAll: true, expandedValue: [] }).api().expandedValue).toEqual([])
  })

  it('数据晚到：第一份非空的 collection 到了才展开，只此一次', async () => {
    const h = mountTreeSelect({ collection: [], defaultExpandAll: true })
    h.setProps({ collection: nodes })
    await tick()
    expect(h.api().expandedValue).toEqual(['src', 'utils', 'docs'])

    h.api().collapseAll()
    h.setProps({ collection: [{ value: 'next', children: [{ value: 'next-1' }] }] })
    await tick()
    expect(h.api().expandedValue).toEqual([])
  })

  it('expandAll / collapseAll 改的是作者的展开集合', () => {
    const h = mountTreeSelect({ collection: nodes })
    h.api().expandAll()
    expect(h.api().expandedValue).toEqual(['src', 'utils', 'docs'])
    h.api().collapseAll()
    expect(h.api().expandedValue).toEqual([])
  })
})
