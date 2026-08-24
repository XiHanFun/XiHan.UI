// 排布方向的词汇：两个布局原语与全库其余 23 份 connect 说同一句话。
//
// flex 此前发 data-direction='row|column'、space 发 data-orientation='horizontal|vertical'，
// 而两边的 prop 都叫 direction——同一件事三种叫法。现在属性统一到 data-orientation，
// data-direction 再发一个大版本给还在读它的使用者。
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
  it('flex 缺省横排，两套词汇同时发', () => {
    const root = flexRoot({})
    expect(root['data-orientation']).toBe('horizontal')
    expect(root['data-direction']).toBe('row')
  })

  it('flex 的 orientation 说了算', () => {
    const root = flexRoot({ orientation: 'vertical' })
    expect(root['data-orientation']).toBe('vertical')
    expect(root['data-direction']).toBe('column')
  })

  it('flex 只写旧的 direction 时照旧生效', () => {
    const root = flexRoot({ direction: 'column' })
    expect(root['data-orientation']).toBe('vertical')
    expect(root['data-direction']).toBe('column')
  })

  it('flex 两个都写时以 orientation 为准', () => {
    const root = flexRoot({ orientation: 'horizontal', direction: 'column' })
    expect(root['data-orientation']).toBe('horizontal')
    expect(root['data-direction']).toBe('row')
  })

  it('space 缺省横排', () => {
    expect(spaceRoot({})['data-orientation']).toBe('horizontal')
  })

  it('space 的 orientation 说了算，旧的 direction 仍然认', () => {
    expect(spaceRoot({ orientation: 'vertical' })['data-orientation']).toBe('vertical')
    expect(spaceRoot({ direction: 'vertical' })['data-orientation']).toBe('vertical')
    expect(spaceRoot({ orientation: 'horizontal', direction: 'vertical' })['data-orientation']).toBe('horizontal')
  })
})
