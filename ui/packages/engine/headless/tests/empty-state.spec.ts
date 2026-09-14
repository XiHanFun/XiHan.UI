// @vitest-environment jsdom
import type { EmptyStateProps } from '../src/empty-state'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectEmptyState, emptyStateAnatomy, emptyStateMeta } from '../src/empty-state'

type Props = Record<string, unknown>

function api(props: EmptyStateProps = {}) {
  return connectEmptyState(props, normalizeProps)
}

describe('connectEmptyState', () => {
  it('root 缺省是 role=status 活区：筛选后换出来的空态没有焦点变化，只能靠活区播报', () => {
    const root = api().getRootProps() as Props
    expect(root['data-scope']).toBe('empty-state')
    expect(root['data-part']).toBe('root')
    expect(root.role).toBe('status')
    expect(api().live).toBe('polite')
  })

  it('live=off 的静态占位不当活区：root 不写 role', () => {
    const root = api({ live: 'off' }).getRootProps() as Props
    expect(root.role).toBeUndefined()
    expect(api({ live: 'off' }).live).toBe('off')
  })

  it('size 只落到 data-size，不给就不写，免得皮肤把缺省档当成显式档', () => {
    expect((api().getRootProps() as Props)['data-size']).toBeUndefined()
    expect((api({ size: 'lg' }).getRootProps() as Props)['data-size']).toBe('lg')
  })

  it('图标是装饰：内容标题里已经写过，念一遍只会重复', () => {
    expect((api().getIndicatorProps() as Props)['aria-hidden']).toBe(true)
  })

  it('标题、说明、操作只带身份标记：活区会把整段读完，补 role 或标题层级都是多余的', () => {
    expect(api().getTitleProps()).toEqual({ 'data-scope': 'empty-state', 'data-part': 'title' })
    expect(api().getDescriptionProps()).toEqual({ 'data-scope': 'empty-state', 'data-part': 'description' })
    expect(api().getActionProps()).toEqual({ 'data-scope': 'empty-state', 'data-part': 'action' })
  })

  it('meta 的必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(emptyStateAnatomy.parts)
    expect(emptyStateMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
