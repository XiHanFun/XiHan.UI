// Vue 内建的布尔属性表里没有 inert，原样透传会写成 inert="true"，
// 而 WC 侧走 toggleAttribute 得到空串。行为一致但 DOM 不一样，parity 会红。
import { describe, expect, it } from 'vitest'
import { vueNormalize } from '../src/runtime/normalize-props'

describe('布尔属性归一化', () => {
  it('inert 为真时落成空串', () => {
    expect((vueNormalize.element({ inert: true }) as Record<string, unknown>).inert).toBe('')
  })

  it('inert 缺席时原样留空，不凭空造出属性', () => {
    expect((vueNormalize.element({ inert: undefined }) as Record<string, unknown>).inert).toBeUndefined()
  })

  it('不动其余属性的取值', () => {
    const out = vueNormalize.element({ hidden: true, 'data-state': 'closed' }) as Record<string, unknown>
    expect(out.hidden).toBe(true)
    expect(out['data-state']).toBe('closed')
  })
})
