// @vitest-environment jsdom
// 开关组的值类型泛型：按 value / collection 推断 V，按 multiple 推断形状——写了 multiple 是数组，没写是一个值或 null。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { XhToggleGroupRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

describe('xhToggleGroupRoot 的值类型泛型', () => {
  it('multiple 决定形状：多选是数组，单选是一个值或 null；单选绑数组即报错', () => {
    const typed = (): ReactNode => {
      const [levels, setLevels] = useState<number[]>([])
      const [level, setLevel] = useState<number | null>(null)
      return (
        <>
          <XhToggleGroupRoot multiple value={levels} collection={[{ value: 1 }]} onValueChange={({ value }) => setLevels(value)} />
          <XhToggleGroupRoot value={level} collection={[{ value: 1 }]} onValueChange={({ value }) => setLevel(value)} />
          {/* @ts-expect-error 没写 multiple 是单选，值不能是数组 */}
          <XhToggleGroupRoot value={levels} />
        </>
      )
    }
    expectTypeOf(typed).toBeFunction()
  })

  it('数字值：单选点选交出数字', async () => {
    const onValueChange = vi.fn()
    root = createRoot(document.body.appendChild(document.createElement('div')))
    await act(async () => {
      root!.render(<XhToggleGroupRoot collection={[{ value: 1, label: '一' }, { value: 2, label: '二' }]} onValueChange={onValueChange} />)
    })
    const item = (key: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="toggle-group"][data-part="item"][data-value="${key}"]`)!
    await act(async () => item('2').click())
    expect(onValueChange).toHaveBeenLastCalledWith({ value: 2 })
  })
})
