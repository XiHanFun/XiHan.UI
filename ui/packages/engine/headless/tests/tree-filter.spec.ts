// @vitest-environment jsdom
// 树的关键词过滤：裁剪算法与树选择、侧边导航共用（shared/tree-search），这里核树这一侧的接线——
// 搜索视图的可见行、它自己那份展开集合、视图之外的节点收起、层级按视图重算、拖动让位。
import type { TreeNode, TreeSchema } from '../src/tree'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTree, treeMachine } from '../src/tree'

type Props = TreeSchema['props']
type Dict = Record<string, unknown>

const runtimes: { stop: () => void }[] = []

function mount(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>(initial)
  const service = createService(treeMachine, { props: () => props.get(), runtime })
  runtime.start()
  runtimes.push(runtime)
  return {
    api: () => connectTree(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0))
    runtime.stop()
})

const COLLECTION: TreeNode[] = [
  {
    value: 'src',
    label: 'Source',
    children: [
      { value: 'index', label: 'Index' },
      { value: 'utils', label: 'Utils', children: [{ value: 'dom', label: 'Dom' }, { value: 'math', label: 'Math' }] },
    ],
  },
  { value: 'docs', label: 'Docs', children: [{ value: 'guide', label: 'Guide' }] },
  { value: 'license', label: 'License' },
]

const rows = (h: ReturnType<typeof mount>): string[] => h.api().visibleNodes.map(node => node.value)

describe('tree 的 filterText', () => {
  it('按检索词裁树：命中的节点留下，祖先保留并自动展开；作者的展开集合一个不动', async () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ collection: COLLECTION, defaultExpandedValue: ['docs'], onExpandedValueChange })
    expect(h.api().searching).toBe(false)
    expect(rows(h)).toEqual(['src', 'docs', 'guide', 'license'])

    h.setProps({ filterText: 'math' })
    await tick()
    expect(h.api().searching).toBe(true)
    expect(rows(h)).toEqual(['src', 'utils', 'math'])
    expect(h.api().isExpanded('src')).toBe(true)
    expect(h.api().expandedValue).toEqual(['docs'])
    expect(onExpandedValueChange).not.toHaveBeenCalled()

    // 清空检索词：回到原来的展开态
    h.setProps({ filterText: '' })
    await tick()
    expect(h.api().searching).toBe(false)
    expect(rows(h)).toEqual(['src', 'docs', 'guide', 'license'])
  })

  it('命中的分支整枝留下，但不替作者展开它；只有空白的检索词不算搜索', async () => {
    const h = mount({ collection: COLLECTION, filterText: 'utils' })
    expect(rows(h)).toEqual(['src', 'utils'])
    h.api().expand('utils')
    expect(rows(h)).toEqual(['src', 'utils', 'dom', 'math'])

    h.setProps({ filterText: '   ' })
    await tick()
    expect(h.api().searching).toBe(false)
  })

  it('挂载时就带着检索词：首帧即是搜索视图', () => {
    const h = mount({ collection: COLLECTION, filterText: 'guide' })
    expect(rows(h)).toEqual(['docs', 'guide'])
  })

  it('搜索视图里的展开收起只改它自己的展开集合，不发变更通知；换检索词后重置', async () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ collection: COLLECTION, filterText: 'math', onExpandedValueChange })
    h.api().collapse('utils')
    expect(rows(h)).toEqual(['src', 'utils'])
    expect(h.api().expandedValue).toEqual([])
    expect(onExpandedValueChange).not.toHaveBeenCalled()

    h.setProps({ filterText: 'dom' })
    await tick()
    expect(rows(h)).toEqual(['src', 'utils', 'dom'])
  })

  it('自定义匹配规则 filter', () => {
    const h = mount({ collection: COLLECTION, filterText: 'x', filter: node => node.value === 'license' })
    expect(rows(h)).toEqual(['license'])
  })

  it('没有命中：整树判空，空态让出来', () => {
    const h = mount({ collection: COLLECTION, filterText: 'zzz' })
    expect(rows(h)).toEqual([])
    expect((h.api().getEmptyProps() as Dict).hidden).toBeUndefined()
  })

  it('手写的整棵树：视图之外的节点由连接层收起，视图里的不动；层级按视图重算', () => {
    const h = mount({ collection: COLLECTION, filterText: 'math' })
    const api = h.api()
    expect((api.getItemProps({ value: 'index' }) as Dict).hidden).toBe(true)
    expect((api.getBranchProps({ value: 'docs' }) as Dict).hidden).toBe(true)
    expect((api.getItemProps({ value: 'math' }) as Dict).hidden).toBeUndefined()
    expect((api.getBranchProps({ value: 'src' }) as Dict).hidden).toBeUndefined()
    // src 在视图里是唯一的根：同级只剩它一个
    expect((api.getBranchProps({ value: 'src' }) as Dict)['aria-setsize']).toBe(1)
    // math 在视图里是 utils 下唯一留下的一项
    expect((api.getItemProps({ value: 'math' }) as Dict)['aria-posinset']).toBe(1)
    expect((api.getItemProps({ value: 'math' }) as Dict)['aria-setsize']).toBe(1)

    // 不搜索时不碰 hidden
    expect((mount({ collection: COLLECTION }).api().getItemProps({ value: 'index' }) as Dict).hidden).toBeUndefined()
  })

  it('搜索时节点不可拖：裁剪后的位次不是数据里的位次', () => {
    const searching = mount({ collection: COLLECTION, nodeReorderable: true, filterText: 'math' }).api()
    expect((searching.getItemProps({ value: 'math' }) as Dict)['data-draggable']).toBeUndefined()
    const plain = mount({ collection: COLLECTION, nodeReorderable: true, defaultExpandedValue: ['src', 'utils'] }).api()
    expect((plain.getItemProps({ value: 'math' }) as Dict)['data-draggable']).toBe('')
  })
})
