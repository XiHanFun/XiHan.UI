import type { StatisticProps } from '../src/statistic'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectStatistic, statisticAnatomy } from '../src/statistic'

const parts = statisticAnatomy.build()

function api(props: StatisticProps = {}) {
  return connectStatistic(props, normalizeProps)
}

describe('connectStatistic', () => {
  it('根缺省只带身份：两轴不写就不落，不写 role', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject(parts.root.attrs)
    expect(root.role).toBeUndefined()
    expect(root['data-size']).toBeUndefined()
    expect(root['data-tone']).toBeUndefined()
    expect(api().trend).toBeUndefined()
  })

  it('两轴只落在根上；涨跌落在 trend 部件的 data-direction 上并经 api 透出', () => {
    const a = api({ size: 'lg', tone: 'success', trend: 'up' })
    expect(a.getRootProps()).toMatchObject({ 'data-size': 'lg', 'data-tone': 'success' })
    expect(a.getTrendProps()).toMatchObject({ ...parts.trend.attrs, 'data-direction': 'up' })
    expect(a.trend).toBe('up')
    expect((api().getTrendProps() as Record<string, unknown>)['data-direction']).toBeUndefined()
  })

  it('标签与数值不互相引用、不生成 id；前后缀是数值的一部分，不对读屏隐藏', () => {
    const a = api()
    expect(a.getLabelProps()).toEqual(parts.label.attrs)
    expect(a.getValueProps()).toEqual(parts.value.attrs)
    expect(a.getPrefixProps()).toEqual(parts.prefix.attrs)
    expect(a.getSuffixProps()).toEqual(parts.suffix.attrs)
  })
})
