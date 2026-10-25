// @vitest-environment jsdom
// 单选组的值类型泛型：按 value / collection 推断 V，值是 V | null；onValueChange 交出原值，隐藏输入提交键。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { XhRadioGroupRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

describe('xhRadioGroupRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型：单选的值是一个数字或 null', () => {
    const typed = (): ReactNode => {
      const [size, setSize] = useState<number | null>(null)
      return (
        <>
          <XhRadioGroupRoot value={size} collection={[{ value: 10 }, { value: 20 }]} onValueChange={({ value }) => setSize(value)} />
          {/* @ts-expect-error 值是数字，collection 却给了字符串 */}
          <XhRadioGroupRoot value={size} collection={[{ value: 'a' }]} />
        </>
      )
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：条目 data-value 是键，点选交出数字，隐藏输入提交键', async () => {
    const onValueChange = vi.fn()
    root = createRoot(document.body.appendChild(document.createElement('div')))
    await act(async () => {
      root!.render(<XhRadioGroupRoot name="size" collection={[{ value: 10, label: '十' }, { value: 20, label: '二十' }]} defaultValue={10} onValueChange={onValueChange} />)
    })
    const item = (key: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="radio-group"][data-part="item"][data-value="${key}"]`)!
    expect(item('10').getAttribute('data-state')).toBe('checked')
    await act(async () => item('20').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: 20 })
    expect([...document.querySelectorAll<HTMLInputElement>('input[name="size"]')].map(input => input.value)).toEqual(['10', '20'])
  })
})
