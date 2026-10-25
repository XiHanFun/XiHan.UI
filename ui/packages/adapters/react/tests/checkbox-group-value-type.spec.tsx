// @vitest-environment jsdom
// 复选组的值类型泛型：按 value / collection 推断 V，数字、对象值不写断言即可受控；onValueChange 交出原值。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { XhCheckboxGroupRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

describe('xhCheckboxGroupRoot 的值类型泛型', () => {
  it('按 value 与 collection 推断值类型；itemValues 也是那个类型', () => {
    const typed = (): ReactNode => {
      const [days, setDays] = useState<number[]>([])
      return (
        <>
          <XhCheckboxGroupRoot value={days} itemValues={[1, 2, 3]} collection={[{ value: 1 }]} onValueChange={({ value }) => setDays(value)} />
          {/* @ts-expect-error itemValues 与值不是一个类型 */}
          <XhCheckboxGroupRoot value={days} itemValues={['a']} />
        </>
      )
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：点选交出数字数组', async () => {
    const onValueChange = vi.fn()
    root = createRoot(document.body.appendChild(document.createElement('div')))
    await act(async () => {
      root!.render(<XhCheckboxGroupRoot collection={[{ value: 1, label: '周一' }, { value: 2, label: '周二' }]} defaultValue={[1]} onValueChange={onValueChange} />)
    })
    const item = (key: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="checkbox-group"][data-part="item"][data-value="${key}"]`)!
    expect(item('1').getAttribute('data-state')).toBe('checked')
    await act(async () => item('2').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [1, 2] })
  })
})
