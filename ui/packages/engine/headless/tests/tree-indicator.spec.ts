// @vitest-environment jsdom
// 选中对号：与树选择同一种读法，单选、多选与级联都只在行尾画对号。
// 叶子与分支行共用同一个 item-indicator，勾选态与半选态落在标记自身上，皮肤据此显形、换横杠。
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
    props: () => ({ collection, multiple: true, cascade: true, defaultExpandedValue: ['src'], ...props }),
    runtime,
  })
  runtime.start()
  return () => connectTree(service, normalizeProps)
}

describe('行尾对号', () => {
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

  it('标记落家族的 indicator 槽，对读屏隐藏：勾选态由所在的 treeitem 报', () => {
    const api = tree()
    const leaf = api().getItemIndicatorProps({ value: 'a.ts' }) as Record<string, unknown>
    expect(leaf['data-xh-collection-slot']).toBe('indicator')
    expect(leaf['aria-hidden']).toBe(true)
  })
})
