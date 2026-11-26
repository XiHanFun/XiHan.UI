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

  it('两轴只落在根上；涨跌落在 trend 部件的 data-trend 上并经 api 透出', () => {
    const a = api({ size: 'lg', tone: 'success', trend: 'up' })
    expect(a.getRootProps()).toMatchObject({ 'data-size': 'lg', 'data-tone': 'success' })
    expect(a.getTrendProps()).toMatchObject({ ...parts.trend.attrs, 'data-trend': 'up' })
    expect(a.trend).toBe('up')
    expect((api().getTrendProps() as Record<string, unknown>)['data-trend']).toBeUndefined()
  })

  it('不给 value 时没有 valueText：数值归作者写进部件', () => {
    expect(api().valueText).toBeUndefined()
    // 数据还没到时宿主写的 null 与没给同义，不铺成「0」
    expect(api({ value: null as unknown as number }).valueText).toBeUndefined()
  })

  it('给了 value 按 locale 格式化：缺省分组打开、至多三位小数，0 也是一个数', () => {
    expect(api({ value: 1234567.891, locale: 'en-US' }).valueText).toBe('1,234,567.891')
    expect(api({ value: 1234567.8912, locale: 'en-US' }).valueText).toBe('1,234,567.891')
    expect(api({ value: 1234567.891, locale: 'de-DE' }).valueText).toBe('1.234.567,891')
    expect(api({ value: 0, locale: 'en-US' }).valueText).toBe('0')
  })

  it('formatOptions 原样交给 Intl.NumberFormat：小数位、货币、百分比、紧凑记数', () => {
    expect(api({ value: 12, locale: 'en-US', formatOptions: { minimumFractionDigits: 2 } }).valueText).toBe('12.00')
    expect(api({ value: 1280.5, locale: 'zh-CN', formatOptions: { style: 'currency', currency: 'CNY' } }).valueText).toBe('¥1,280.50')
    expect(api({ value: 0.256, locale: 'en-US', formatOptions: { style: 'percent', maximumFractionDigits: 1 } }).valueText).toBe('25.6%')
    expect(api({ value: 12480, locale: 'en-US', formatOptions: { notation: 'compact' } }).valueText).toBe('12K')
    expect(api({ value: 12480, locale: 'en-US', formatOptions: { useGrouping: false } }).valueText).toBe('12480')
  })

  it('formatOptions 不合法时当场报错，不悄悄退回缺省写法', () => {
    expect(() => api({ value: 1, locale: 'en-US', formatOptions: { style: 'currency' } })).toThrow(TypeError)
  })

  it('同一组语言与选项结果稳定：缓存的格式化器不串到别的选项上', () => {
    const plain = api({ value: 1000, locale: 'en-US' }).valueText
    const compact = api({ value: 1000, locale: 'en-US', formatOptions: { notation: 'compact' } }).valueText
    expect(plain).toBe('1,000')
    expect(compact).toBe('1K')
    expect(api({ value: 1000, locale: 'en-US' }).valueText).toBe(plain)
  })

  it('标签与数值不互相引用、不生成 id；前后缀是数值的一部分，不对读屏隐藏', () => {
    const a = api()
    expect(a.getLabelProps()).toEqual(parts.label.attrs)
    expect(a.getValueProps()).toEqual(parts.value.attrs)
    expect(a.getPrefixProps()).toEqual(parts.prefix.attrs)
    expect(a.getSuffixProps()).toEqual(parts.suffix.attrs)
  })
})
