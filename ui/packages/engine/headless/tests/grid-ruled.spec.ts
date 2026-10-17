// grid 的格线：ruled 落成根上的 data-split，不写或写 false 都不落。
import { describe, expect, it } from 'vitest'
import { connectGrid } from '../src/grid'

const normalize = { element: (p: Record<string, unknown>) => p } as never

function root(props: Parameters<typeof connectGrid>[0]): Record<string, unknown> {
  return connectGrid(props, normalize).getRootProps() as unknown as Record<string, unknown>
}

describe('grid 格线', () => {
  it('ruled 时根上写 data-split', () => {
    expect(root({ ruled: true })['data-split']).toBe('')
  })

  it('不写或写 false 时不落', () => {
    expect(root({})['data-split']).toBeUndefined()
    expect(root({ ruled: false })['data-split']).toBeUndefined()
  })

  it('与间距档位各落各的：画格线时间距由皮肤归零，connect 照样写出作者给的档位', () => {
    expect(root({ ruled: true, gap: 'md' })).toMatchObject({ 'data-split': '', 'data-gap': 'md' })
  })
})
