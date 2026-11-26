// @vitest-environment jsdom
// 元素属性转换器：库内元素与作者自写的元素共用一份口径，没写这个 attribute 一律为 undefined。
import { describe, expect, it } from 'vitest'
import { NUMBER_CONVERTER, NUMBER_LIST_CONVERTER, STRING_CONVERTER, STRING_LIST_CONVERTER } from '../src/authoring'
import { XhBackgroundElement } from '../src/backgrounds'
import * as defined from '../src/define'
import { XhReactiveElement } from '../src/reactive/element'

defined.defineXhElements()

type ElementClass = typeof XhReactiveElement & { elementProperties: Map<string, { converter?: unknown }> }

const exported: unknown[] = [...Object.values(defined), XhBackgroundElement]
const classes = exported.filter((value): value is ElementClass => typeof value === 'function' && value.prototype instanceof XhReactiveElement)

function readerOf(converter: unknown): ((value: string | null) => unknown) | undefined {
  const from = typeof converter === 'function' ? converter : (converter as { fromAttribute?: unknown } | undefined)?.fromAttribute
  return typeof from === 'function' ? from as (value: string | null) => unknown : undefined
}

/** 元素里自己写的、读法落在某一类里的转换器（共享件本身不算）。 */
function localCopies(shared: unknown, alike: (read: (value: string | null) => unknown) => boolean): string[] {
  for (const ctor of classes)
    void (ctor as unknown as { observedAttributes: string[] }).observedAttributes
  return classes.flatMap(ctor => [...ctor.elementProperties].filter(([, options]) => {
    const read = readerOf(options.converter)
    return options.converter !== shared && read !== undefined && alike(read)
  }).map(([name]) => `${ctor.name}.${name}`))
}

const SAMPLES = [null, '', '  ', '0', '7', '12', '-1.5', '16/9', 'abc', 'true', 'false', '{"base":1}', 'a,b'] as const

/** 在全部样本上读出与共享件一模一样的结果，就是一份抄本。 */
function readsLike(shared: { fromAttribute: (value: string | null) => unknown }) {
  return (read: (value: string | null) => unknown): boolean => SAMPLES.every(value => Object.is(read(value), shared.fromAttribute(value)))
}

describe('元素不再各写一份转换器', () => {
  it('原样读字符串的只有共享的 STRING_CONVERTER', () => {
    expect(localCopies(STRING_CONVERTER, readsLike(STRING_CONVERTER))).toEqual([])
  })

  it('按 Number() 读数字的只有共享的 NUMBER_CONVERTER，空串与读不出数时不会各有各的说法', () => {
    const plainNumber = (read: (value: string | null) => unknown): boolean =>
      read('0') === 0 && read('7') === 7 && read('-1.5') === -1.5
      && (['abc', 'mean', '16/9', 'true', '{"base":1}', 'a,b'] as const).every((value) => {
        const out = read(value)
        return out === undefined || Number.isNaN(out)
      })
    expect(localCopies(NUMBER_CONVERTER, plainNumber)).toEqual([])
  })
})

describe('属性转换器', () => {
  it('字符串：写了什么就是什么，空串也是值', () => {
    expect(STRING_CONVERTER.fromAttribute(null)).toBeUndefined()
    expect(STRING_CONVERTER.fromAttribute('')).toBe('')
    expect(STRING_CONVERTER.fromAttribute(' a ')).toBe(' a ')
  })

  it('数字：空串、空白与读不出数的写法都当没写，Infinity 照收', () => {
    expect(NUMBER_CONVERTER.fromAttribute(null)).toBeUndefined()
    expect(NUMBER_CONVERTER.fromAttribute('')).toBeUndefined()
    expect(NUMBER_CONVERTER.fromAttribute('  ')).toBeUndefined()
    expect(NUMBER_CONVERTER.fromAttribute('abc')).toBeUndefined()
    expect(NUMBER_CONVERTER.fromAttribute('Infinity')).toBe(Number.POSITIVE_INFINITY)
    expect(NUMBER_CONVERTER.fromAttribute('0')).toBe(0)
    expect(NUMBER_CONVERTER.fromAttribute('-8.5')).toBe(-8.5)
  })

  it('字符串列表：逐项去空白、丢空项；空串是空列表，值集合据此写得出「受控且一项不选」', () => {
    expect(STRING_LIST_CONVERTER.fromAttribute(null)).toBeUndefined()
    expect(STRING_LIST_CONVERTER.fromAttribute('')).toEqual([])
    expect(STRING_LIST_CONVERTER.fromAttribute(' a , ,b,')).toEqual(['a', 'b'])
  })

  it('数字列表：逐项读数，空项不读成 0；一个数都读不出当没写', () => {
    expect(NUMBER_LIST_CONVERTER.fromAttribute(null)).toBeUndefined()
    expect(NUMBER_LIST_CONVERTER.fromAttribute('')).toBeUndefined()
    expect(NUMBER_LIST_CONVERTER.fromAttribute('x,y')).toBeUndefined()
    expect(NUMBER_LIST_CONVERTER.fromAttribute('30,,70')).toEqual([30, 70])
    expect(NUMBER_LIST_CONVERTER.fromAttribute(' 1 , 2.5 ')).toEqual([1, 2.5])
  })
})
