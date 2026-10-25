// @vitest-environment jsdom
// 组合框的值类型泛型：按 value / collection 推断 V，数字、对象值不写断言即可受控；
// onValueChange 与自定义过滤拿到原值，条目的 data-value 是它的键。类型断言由 typecheck 判。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { XhComboboxRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

const q = (selector: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="combobox"]${selector}`)!

describe('xhComboboxRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；filter 拿到的条目是那个类型', () => {
    const typed = (): ReactNode => {
      const [nums, setNums] = useState<number[]>([])
      return (
        <>
          <XhComboboxRoot
            value={nums}
            collection={[{ value: 1, label: '一' }]}
            filter={(node) => {
              expectTypeOf(node.value).toEqualTypeOf<number>()
              return true
            }}
            onValueChange={({ value }) => setNums(value)}
          />
          {/* @ts-expect-error 值是数字，collection 却给了字符串 */}
          <XhComboboxRoot value={nums} collection={[{ value: 'a' }]} />
        </>
      )
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：展开后点选，onValueChange 交出数字', async () => {
    const onValueChange = vi.fn()
    root = createRoot(document.body.appendChild(document.createElement('div')))
    await act(async () => {
      root!.render(<XhComboboxRoot collection={[{ value: 1, label: '一' }, { value: 2, label: '二' }]} onValueChange={onValueChange} />)
    })
    await act(async () => q('[data-part="trigger"]').click())
    expect([...document.querySelectorAll('[data-scope="combobox"][data-part="item"]')].map(item => item.getAttribute('data-value'))).toEqual(['1', '2'])
    await act(async () => q('[data-part="item"][data-value="2"]').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [2] })
  })
})
