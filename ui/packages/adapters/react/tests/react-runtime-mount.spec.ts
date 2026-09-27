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
