// ValueFormatter：注入格式化器的共用类型，formatValue 本身就满足它，宿主直接传。
import type { FormatOptions, FormatSpec, ValueFormatter } from '../src'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { formatValue } from '../src'

describe('valueFormatter', () => {
  it('formatValue 满足 ValueFormatter，经它调用与直接调用结果相同', () => {
    expectTypeOf(formatValue).toExtend<ValueFormatter>()
    const formatter: ValueFormatter = formatValue
    expect(formatter(1234.5, { kind: 'number', decimals: 2, grouping: true }, { locale: 'de-DE' }))
      .toBe(formatValue(1234.5, { kind: 'number', decimals: 2, grouping: true }, { locale: 'de-DE' }))
  })

  it('签名就是 (值, 格式说明, 选项) => 文本', () => {
    expectTypeOf<ValueFormatter>().parameters.toEqualTypeOf<[unknown, FormatSpec, FormatOptions]>()
    expectTypeOf<ValueFormatter>().returns.toEqualTypeOf<string>()
  })
})
