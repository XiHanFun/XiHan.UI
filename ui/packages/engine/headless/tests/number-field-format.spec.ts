import type { NumberFieldSchema, NumberFieldValueChangeDetails } from '../src/number-field'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectNumberField, numberFieldMachine, numberFieldStructure } from '../src/number-field'
import { encodeWithPrecision, formatNumberFieldValue, resolveNumberFieldPrecision, roundToPrecision } from '../src/number-field/number-field.format'

type Props = NumberFieldSchema['props']

function makeField(initial: Props = {}) {
  const changes: NumberFieldValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onValueChange: d => changes.push(d) })
  const service = createService(numberFieldMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    changes,
    api: () => connectNumberField(service, normalizeProps),
    input: () => connectNumberField(service, normalizeProps).getInputProps() as Record<string, unknown>,
    hidden: () => connectNumberField(service, normalizeProps).getHiddenInputProps() as Record<string, unknown>,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    type: (text: string) => service.send({ type: 'VALUE.SET', value: text }),
    focus: () => service.send({ type: 'INPUT.FOCUS' }),
    blur: () => service.send({ type: 'INPUT.BLUR' }),
  }
}

describe('number-field 提交位数换算', () => {
  it('precision 归一：没给即不取整；给了就取整并夹进 [0, 20]', () => {
    expect(resolveNumberFieldPrecision(undefined)).toBeUndefined()
    expect(resolveNumberFieldPrecision(2)).toBe(2)
    expect(resolveNumberFieldPrecision(2.7)).toBe(2)
    expect(resolveNumberFieldPrecision(-1)).toBe(0)
    expect(resolveNumberFieldPrecision(99)).toBe(20)
  })

  it('按十进制四舍五入：1.005 进到 1.01，正好一半时远离零', () => {
    // toFixed 在二进制里读到的是 1.00499…，会写成 1.00
    expect((1.005).toFixed(2)).toBe('1.00')
    expect(roundToPrecision(1.005, 2)).toBe(1.01)
    expect(roundToPrecision(2.5, 0)).toBe(3)
    expect(roundToPrecision(-2.5, 0)).toBe(-3)
    expect(roundToPrecision(0.000001, 2)).toBe(0)
    expect(roundToPrecision(1e21, 2)).toBe(1e21)
    expect(roundToPrecision(Number.NaN, 2)).toBeNaN()
  })

  it('按提交位数写出：补齐尾零，舍成零的负数不带负号', () => {
    expect(encodeWithPrecision(12.5, 2)).toBe('12.50')
    expect(encodeWithPrecision(3, 2)).toBe('3.00')
    expect(encodeWithPrecision(1.005, 2)).toBe('1.01')
    expect(encodeWithPrecision(-0.001, 2)).toBe('0.00')
    expect(encodeWithPrecision(7.6, 0)).toBe('8')
  })
})

describe('number-field precision', () => {
  it('非受控初值按位数写一遍；读不出数的原样留下', () => {
    expect(makeField({ defaultValue: '3', precision: 2 }).api().value).toBe('3.00')
    expect(makeField({ defaultValue: 'abc', precision: 2 }).api().value).toBe('abc')
    // 受控值按原样显示
    expect(makeField({ value: '3', precision: 2 }).api().value).toBe('3')
  })

  it('输入途中不打断，失焦时四舍五入并补齐', () => {
    const f = makeField({ precision: 2 })
    f.focus()
    f.type('1234.567')
    expect(f.api().value).toBe('1234.567')
    f.blur()
    expect(f.api().value).toBe('1234.57')
    expect(f.changes.at(-1)).toEqual({ value: '1234.57', valueAsNumber: 1234.57 })
  })

  it('步进写回的值按位数补齐；step 的小数位比 precision 少时照常一步一格', () => {
    const f = makeField({ defaultValue: '1', precision: 2, step: 0.5 })
    f.api().increment()
    expect(f.api().value).toBe('1.50')
    f.api().increment()
    expect(f.api().value).toBe('2.00')
  })

  it('取端点也按位数写回', () => {
    const f = makeField({ defaultValue: '1', min: 0, max: 10, precision: 1 })
    f.service.send({ type: 'VALUE.TO_MAX' })
    expect(f.api().value).toBe('10.0')
  })

  it('与 format 同在时先取整再交给 format', () => {
    const f = makeField({
      precision: 1,
      parse: text => Number(text.replace(/,/g, '')),
      format: value => value.toLocaleString('en-US'),
    })
    f.type('1234.56')
    f.blur()
    expect(f.api().value).toBe('1,234.6')
  })

  it('失焦夹回区间后再按位数写回', () => {
    const f = makeField({ max: 100, precision: 2 })
    f.type('250')
    f.blur()
    expect(f.api().value).toBe('100.00')
  })
})

describe('number-field formatOptions', () => {
  const currency: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }

  it('失焦时按格式显示，编辑时换回原值；值始终是原值', () => {
    const f = makeField({ defaultValue: '1234.5', formatOptions: currency, locale: 'en-US' })
    expect(f.api().value).toBe('1234.5')
    expect(f.api().displayValue).toBe('$1,234.50')
    expect(f.input().value).toBe('$1,234.50')
    f.focus()
    expect(f.api().displayValue).toBe('1234.5')
    expect(f.input().value).toBe('1234.5')
    f.type('99')
    expect(f.input().value).toBe('99')
    f.blur()
    expect(f.input().value).toBe('$99.00')
    expect(f.api().value).toBe('99')
    expect(f.changes.at(-1)).toEqual({ value: '99', valueAsNumber: 99 })
  })

  it('读屏念格式化后的文字：aria-valuetext 是格式化串，aria-valuenow 仍是数', () => {
    const f = makeField({ defaultValue: '0.25', formatOptions: { style: 'percent' }, locale: 'en-US' })
    expect(f.input()['aria-valuetext']).toBe('25%')
    expect(f.input()['aria-valuenow']).toBe(0.25)
  })

  it('空值与读不出数的值原样显示，不带 aria-valuetext', () => {
    const empty = makeField({ formatOptions: currency, locale: 'en-US' })
    expect(empty.input().value).toBe('')
    expect(empty.input()['aria-valuetext']).toBeUndefined()
    const bad = makeField({ defaultValue: 'abc', formatOptions: currency, locale: 'en-US' })
    expect(bad.input().value).toBe('abc')
  })

  it('locale 决定小数点与分组符', () => {
    const f = makeField({ defaultValue: '1234.5', formatOptions: { minimumFractionDigits: 1 }, locale: 'de-DE' })
    expect(f.input().value).toBe('1.234,5')
  })

  it('precision 在选项没写小数位时决定显示的位数；选项写了就以选项为准', () => {
    expect(formatNumberFieldValue(1.5, 'en-US', {}, 3)).toBe('1.500')
    expect(formatNumberFieldValue(1.5, 'en-US', { maximumFractionDigits: 0 }, 3)).toBe('2')
    const f = makeField({ defaultValue: '2', precision: 2, formatOptions: {}, locale: 'en-US' })
    expect(f.api().value).toBe('2.00')
    expect(f.input().value).toBe('2.00')
  })

  it('步进照原值走，失焦状态下显示随之重新格式化', () => {
    const f = makeField({ defaultValue: '999', formatOptions: {}, locale: 'en-US' })
    f.api().increment()
    expect(f.api().value).toBe('1000')
    expect(f.input().value).toBe('1,000')
  })

  it('禁用时按失焦显示格式化文字', () => {
    const f = makeField({ defaultValue: '1000', formatOptions: {}, locale: 'en-US' })
    f.focus()
    expect(f.input().value).toBe('1000')
    f.setProps({ disabled: true })
    expect(f.input().value).toBe('1,000')
  })

  it('选项不合法时当场报错，不悄悄退回原值', () => {
    const f = makeField({ defaultValue: '1', formatOptions: { style: 'currency' }, locale: 'en-US' })
    expect(() => f.api()).toThrow(TypeError)
  })
})

describe('number-field 表单出口', () => {
  it('给了 formatOptions：name 挪到 hidden-input，提交原值', () => {
    const f = makeField({ name: 'price', defaultValue: '1234.5', formatOptions: { style: 'currency', currency: 'USD' }, locale: 'en-US' })
    expect(f.input().name).toBeUndefined()
    expect(f.hidden()).toMatchObject({ type: 'hidden', name: 'price', value: '1234.5' })
  })

  it('没给 formatOptions：提交照旧走输入框，hidden-input 不带 name', () => {
    const f = makeField({ name: 'qty', defaultValue: '3' })
    expect(f.input().name).toBe('qty')
    expect(f.hidden().name).toBeUndefined()
  })

  it('禁用时 hidden-input 也禁用，不提交', () => {
    const f = makeField({ name: 'price', defaultValue: '1', formatOptions: {}, disabled: true })
    expect(f.hidden().disabled).toBe(true)
  })

  it('标准结构：给了 hiddenInput 才在盒后铺表单出口', () => {
    const parts = (nodes: ReturnType<typeof numberFieldStructure>): string[] => nodes.map(node => node.part)
    expect(parts(numberFieldStructure({}))).toEqual(['control'])
    expect(parts(numberFieldStructure({ hiddenInput: true }))).toEqual(['control', 'hidden-input'])
  })
})
