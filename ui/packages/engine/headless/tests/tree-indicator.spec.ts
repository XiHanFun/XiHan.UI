// @vitest-environment jsdom
// 选中标记：与树选择同一种读法。单选与 extended 在行尾画对号；multiple（含级联）换成行首勾选框，
// 点行是勾上这一项而不是换掉已选的那一项。叶子与分支行共用同一个 item-indicator，勾选态与半选态落在标记自身上。
import type { TreeSchema } from '../src/tree'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTree, treeMachine } from '../src/tree'

const collection = [
  { value: 'src', label: 'src', children: [{ value: 'a.ts', label: 'a.ts' }, { value: 'b.ts', label: 'b.ts' }] },
]

function tree(props: Partial<TreeSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(treeMachine, {
    props: () => ({ collection, selectionMode: 'multiple' as const, cascade: true, defaultExpandedValue: ['src'], ...props }),
    runtime,
  })
  runtime.start()
  return () => connectTree(service, normalizeProps)
}

describe('选中标记', () => {
  it('勾选态与半选态都落到标记上：子树只勾一半，分支行的对号报半选', () => {
    const api = tree({ defaultSelection: ['a.ts'] })
    const leaf = api().getItemIndicatorProps({ value: 'a.ts' }) as Record<string, unknown>
    const branch = api().getItemIndicatorProps({ value: 'src' }) as Record<string, unknown>
    expect(leaf['data-selected']).toBe('')
    expect(branch['data-indeterminate']).toBe('')
    expect(branch['data-selected']).toBeUndefined()
  })

  it('子树全勾则分支行的对号报选中、不再报半选', () => {
    const api = tree({ defaultSelection: ['a.ts', 'b.ts'] })
    const branch = api().getItemIndicatorProps({ value: 'src' }) as Record<string, unknown>
    expect(branch['data-selected']).toBe('')
    expect(branch['data-indeterminate']).toBeUndefined()
  })

  it('multiple 下是行首勾选框：落家族的 check 槽，方框里的勾与半选杠交给勾选标记配方', () => {
    const api = tree({ defaultSelection: ['a.ts'] })
    const leaf = api().getItemIndicatorProps({ value: 'a.ts' }) as Record<string, unknown>
    const other = api().getItemIndicatorProps({ value: 'b.ts' }) as Record<string, unknown>
    const branch = api().getItemIndicatorProps({ value: 'src' }) as Record<string, unknown>
    expect(leaf['data-xh-collection-slot']).toBe('check')
    expect(leaf['data-xh-check-mark-profile']).toBe('box')
    expect(leaf['data-xh-check-mark']).toBe('checked')
    expect(other['data-xh-check-mark']).toBe('unchecked')
    expect(branch['data-xh-check-mark']).toBe('indeterminate')
    // 勾选态由所在的 treeitem 报，方框本身对读屏隐藏
    expect(leaf['aria-hidden']).toBe(true)
  })

  it.each(['single', 'extended'] as const)('%s 下仍是行尾对号：落家族的 indicator 槽，不画勾选框', (selectionMode) => {
    const api = tree({ selectionMode, cascade: false, defaultSelection: ['a.ts'] })
    const leaf = api().getItemIndicatorProps({ value: 'a.ts' }) as Record<string, unknown>
    expect(leaf['data-xh-collection-slot']).toBe('indicator')
    expect(leaf['data-xh-check-mark']).toBeUndefined()
    expect(leaf['data-xh-check-mark-profile']).toBeUndefined()
    expect(leaf['data-selected']).toBe('')
    expect(leaf['aria-hidden']).toBe(true)
  })
})
