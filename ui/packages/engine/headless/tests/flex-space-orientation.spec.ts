// 两个布局原语的排布方向与全库其余 connect 说同一句话：prop 叫 orientation，
// 属性落 data-orientation，取值 horizontal / vertical。除此之外不发第二个方向属性。
import { describe, expect, it } from 'vitest'
import { connectFlex } from '../src/flex'
import { connectSpace } from '../src/space'

/** 只取属性表，不经适配器。 */
const normalize = { element: (p: Record<string, unknown>) => p } as never

function flexRoot(props: Parameters<typeof connectFlex>[0]) {
  return connectFlex(props, normalize).getRootProps() as unknown as Record<string, unknown>
}
function spaceRoot(props: Parameters<typeof connectSpace>[0]) {
  return connectSpace(props, normalize).getRootProps() as unknown as Record<string, unknown>
}

describe('布局原语的排布方向', () => {
  it('flex 缺省横排', () => {
    expect(flexRoot({})['data-orientation']).toBe('horizontal')
  })

  it('flex 的 orientation 落到 data-orientation', () => {
    expect(flexRoot({ orientation: 'vertical' })['data-orientation']).toBe('vertical')
  })

  it('flex 不发 data-direction：方向只有 data-orientation 一个出口', () => {
    expect(flexRoot({})).not.toHaveProperty('data-direction')
    expect(flexRoot({ orientation: 'vertical' })).not.toHaveProperty('data-direction')
  })

  it('space 缺省横排', () => {
    expect(spaceRoot({})['data-orientation']).toBe('horizontal')
  })

  it('space 的 orientation 落到 data-orientation', () => {
    expect(spaceRoot({ orientation: 'vertical' })['data-orientation']).toBe('vertical')
  })

  it('space 不发 data-direction', () => {
    expect(spaceRoot({})).not.toHaveProperty('data-direction')
  })

  it('两家都不再收 direction 入参', () => {
    // @ts-expect-error 方向只有 orientation 一个入口
    flexRoot({ direction: 'column' })
    // @ts-expect-error 方向只有 orientation 一个入口
    spaceRoot({ direction: 'vertical' })
    // 两行 @ts-expect-error 是判据本身：别名若被加回来，它们会因「没有错可期待」而报错
  })
})
