// @vitest-environment jsdom
// 勾选把手：把「勾这一项」与「点这一行」分成两个可点区域。
// 点行的语义（单选替换、分支展开）归 item / branch-control，把手只管勾选。
import type { TreeSchema } from '../src/tree'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTree, treeMachine } from '../src/tree'

const collection = [
  { value: 'src', label: 'src', children: [{ value: 'a.ts', label: 'a.ts' }, { value: 'b.ts', label: 'b.ts' }] },
]

function tree(props: Partial<TreeSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const onSelectionChange = vi.fn()
  const service = createService(treeMachine, {
    props: () => ({ collection, selectionMode: 'multiple', cascade: true, defaultExpandedValue: ['src'], onSelectionChange, ...props }),
    runtime,
  })
  runtime.start()
  return { service, onSelectionChange, api: () => connectTree(service, normalizeProps) }
}

function clickOn(props: Record<string, unknown>): { stopped: boolean } {
  let stopped = false
  ;(props.onClick as (e: unknown) => void)({
    stopPropagation: () => { stopped = true },
    currentTarget: document.createElement('span'),
  })
  return { stopped }
}

describe('勾选把手', () => {
  it('点把手落选中', () => {
    const { onSelectionChange, api } = tree()
    clickOn(api().getItemCheckboxProps({ value: 'a.ts' }) as Record<string, unknown>)
    expect(onSelectionChange).toHaveBeenCalled()
  })

  it('掐断冒泡：把手长在条目里，不掐会再跑一遍点行', () => {
    const { api } = tree()
    expect(clickOn(api().getItemCheckboxProps({ value: 'a.ts' }) as Record<string, unknown>).stopped).toBe(true)
    expect(clickOn(api().getBranchCheckboxProps({ value: 'src' }) as Record<string, unknown>).stopped).toBe(true)
  })

  it('禁用时点不动', () => {
    const { onSelectionChange, api } = tree({ disabled: true })
    clickOn(api().getItemCheckboxProps({ value: 'a.ts' }) as Record<string, unknown>)
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('勾选态与半选态都落到把手上——半选此前发了却没人画', () => {
    const { api } = tree({ defaultSelection: ['a.ts'] })
    const leaf = api().getItemCheckboxProps({ value: 'a.ts' }) as Record<string, unknown>
    const branch = api().getBranchCheckboxProps({ value: 'src' }) as Record<string, unknown>
    expect(leaf['data-selected']).toBe('')
    // 子树只勾了一半，分支报半选
    expect(branch['data-indeterminate']).toBe('')
    expect(branch['data-selected']).toBeUndefined()
  })

  it('把手不抢 Tab 位，也不向读屏重复一遍勾选态', () => {
    const { api } = tree()
    const leaf = api().getItemCheckboxProps({ value: 'a.ts' }) as Record<string, unknown>
    expect(leaf.tabindex).toBe(-1)
    expect(leaf['aria-hidden']).toBe(true)
  })
})
