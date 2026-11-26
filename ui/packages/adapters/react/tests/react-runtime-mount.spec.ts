import { describe, expect, it, vi } from 'vitest'
import { createReactRuntime } from '../src/runtime/create-react-runtime'

describe('react 运行时的挂载钩子', () => {
  it('挂载途中登记的钩子立即跑，且只跑一次', () => {
    const runtime = createReactRuntime()
    const order: string[] = []
    const inner = vi.fn(() => order.push('inner'))
    runtime.onMount(() => {
      order.push('outer')
      runtime.onMount(inner)
    })
    runtime.onMount(() => order.push('sibling'))
    runtime.mount()
    expect(inner).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['outer', 'inner', 'sibling'])
  })
})

describe('react 运行时的 cell：内容一样的另一份', () => {
  it('非受控时照样落下新引用并通知订阅者，盯引用的 tracker 才看得到；不报告变化', () => {
    const runtime = createReactRuntime()
    const onChange = vi.fn()
    const value = runtime.cell<string[]>(() => ({
      defaultValue: [],
      isEqual: (a, b) => !!b && a.length === b.length && a.every((v, i) => v === b[i]),
      onChange,
    }))
    const notified = vi.fn()
    runtime.subscribe(notified)
    const next: string[] = []
    value.set(next)
    expect(value.get()).toBe(next)
    expect(notified).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
  })
})
