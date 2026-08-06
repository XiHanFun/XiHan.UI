// @vitest-environment jsdom
import type { SkeletonProps } from '../src/skeleton'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectSkeleton, skeletonAnatomy, skeletonMeta } from '../src/skeleton'

type Props = Record<string, unknown>

function api(props: SkeletonProps = {}) {
  return connectSkeleton(props, normalizeProps)
}

describe('connectSkeleton', () => {
  it('root 带身份标记，加载态报忙', () => {
    const root = api().getRootProps() as Props
    expect(root['data-scope']).toBe('skeleton')
    expect(root['data-part']).toBe('root')
    expect(root['aria-busy']).toBe('true')
    expect(root['data-state']).toBe('loading')
  })

  it('容器不写 aria-hidden：写了会把自己的 aria-busy 一起摘出无障碍树', () => {
    // 这条是骨架屏无障碍的要害：装饰藏在骨架条那层，忙态留在容器这层，两层不能合并
    expect((api().getRootProps() as Props)['aria-hidden']).toBeUndefined()
    expect((api({ loading: false }).getRootProps() as Props)['aria-hidden']).toBeUndefined()
  })

  it('骨架条是纯装饰，加载期间逐根退出无障碍树', () => {
    const bone = api().getBoneProps() as Props
    expect(bone['data-scope']).toBe('skeleton')
    expect(bone['data-part']).toBe('bone')
    expect(bone['aria-hidden']).toBe('true')
  })

  it('loading 缺省为真', () => {
    expect(api().loading).toBe(true)
    expect((api().getRootProps() as Props).hidden).toBeUndefined()
  })

  it('loading 为假：忙态与隐藏都不再输出，整块骨架收起', () => {
    const a = api({ loading: false })
    expect(a.loading).toBe(false)
    const root = a.getRootProps() as Props
    // 内容已就位，再说"忙"就是假消息
    expect(root['aria-busy']).toBeUndefined()
    expect(root['data-state']).toBe('loaded')
    // 节点留在 DOM 里，只加 hidden
    expect(root.hidden).toBe(true)
    // 没有需要藏起来的装饰了
    expect((a.getBoneProps() as Props)['aria-hidden']).toBeUndefined()
  })

  it('形状缺省为 text，容器上的 variant 是每根骨架条的默认值', () => {
    expect((api().getBoneProps() as Props)['data-variant']).toBe('text')
    expect((api({ variant: 'rect' }).getBoneProps() as Props)['data-variant']).toBe('rect')
  })

  it('骨架条自报的形状盖过容器给的默认值', () => {
    const a = api({ variant: 'text' })
    expect((a.getBoneProps({ variant: 'circle' }) as Props)['data-variant']).toBe('circle')
    // 自报缺席才落回容器的默认值
    expect((a.getBoneProps({}) as Props)['data-variant']).toBe('text')
    expect((a.getBoneProps({ variant: undefined }) as Props)['data-variant']).toBe('text')
  })

  it('meta 的必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(skeletonAnatomy.parts)
    expect(skeletonMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
