// @vitest-environment jsdom
// 徽标说的是「有事情发生了」：计数、上限截断、0 值收起、小红点都归它算，
// 不该由每个宿主各拼一遍——上限口径散在各处迟早不一致。
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
import { connectBadge } from '../src/badge'

const api = (props: Record<string, unknown>) => connectBadge(props, normalizeProps)
const rootOf = (props: Record<string, unknown>) => api(props).getRootProps() as Record<string, unknown>

describe('计数与截断', () => {
  it('给了 count 就自己出数字', () => {
    expect(api({ count: 5 }).text).toBe('5')
  })

  it('超过上限写成「上限+」，默认上限 99', () => {
    expect(api({ count: 100 }).text).toBe('99+')
    expect(api({ count: 99 }).text).toBe('99')
  })

  it('上限可以自己定', () => {
    expect(api({ count: 20, max: 9 }).text).toBe('9+')
  })

  it('不给 count 就不出文字，交给插槽', () => {
    expect(api({}).text).toBe('')
  })
})

describe('0 值收起', () => {
  it('没有未读就整枚收起', () => {
    expect(api({ count: 0 }).visible).toBe(false)
    expect(rootOf({ count: 0 }).hidden).toBe(true)
  })

  it('显式要求显示 0 时照常出现', () => {
    expect(api({ count: 0, showZero: true }).visible).toBe(true)
    expect(rootOf({ count: 0, showZero: true }).hidden).toBeUndefined()
  })

  it('不给 count 的徽标不受这条影响', () => {
    expect(api({}).visible).toBe(true)
  })
})

describe('小红点', () => {
  it('只表示「有」，不出数字', () => {
    expect(api({ dot: true, count: 5 }).text).toBe('')
    expect(rootOf({ dot: true })['data-dot']).toBe('')
  })

  it('计数为 0 时红点同样收起——没有新的就不该有点', () => {
    expect(api({ dot: true, count: 0 }).visible).toBe(false)
  })
})

describe('读屏', () => {
  it('给了整句就用整句，并报成状态', () => {
    const root = rootOf({ count: 3, label: '3 条未读' })
    expect(root['aria-label']).toBe('3 条未读')
    expect(root.role).toBe('status')
  })

  it('没给就不硬造 role：光念数字也好过念错角色', () => {
    expect(rootOf({ count: 3 }).role).toBeUndefined()
  })
})
