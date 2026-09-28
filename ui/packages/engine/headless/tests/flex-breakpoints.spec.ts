// flex 的逐档书写：单值只落不带档位的属性；断点对象逐档落 data-<轴>-<档>，没写的档不落。
// WC 特性上的 JSON 由 normalizeFlexTier 归一，写坏了当没写。
import { describe, expect, it } from 'vitest'
import { connectFlex, normalizeFlexTier } from '../src/flex'

const normalize = { element: (p: Record<string, unknown>) => p } as never

function flexRoot(props: Parameters<typeof connectFlex>[0]): Record<string, unknown> {
  return connectFlex(props, normalize).getRootProps() as unknown as Record<string, unknown>
}

describe('flex 逐档书写', () => {
  it('单值只落不带档位的属性，逐档属性一个不落', () => {
    const root = flexRoot({ orientation: 'vertical', align: 'end', justify: 'between', gap: 'md' })
    expect(root).toMatchObject({ 'data-orientation': 'vertical', 'data-align': 'end', 'data-justify': 'between', 'data-gap': 'md' })
    for (const axis of ['orientation', 'align', 'justify', 'gap']) {
      for (const tier of ['sm', 'md', 'lg', 'xl'])
        expect(root[`data-${axis}-${tier}`]).toBeUndefined()
    }
  })

  it('断点对象逐档落：base 落不带档位的那个，没写的档不落', () => {
    const root = flexRoot({
      orientation: { base: 'vertical', md: 'horizontal' },
      align: { lg: 'baseline' },
      justify: { sm: 'between', xl: 'evenly' },
      gap: { base: 'xs', lg: 'xl' },
    })
    expect(root).toMatchObject({
      'data-orientation': 'vertical',
      'data-orientation-md': 'horizontal',
      'data-align-lg': 'baseline',
      'data-justify-sm': 'between',
      'data-justify-xl': 'evenly',
      'data-gap': 'xs',
      'data-gap-lg': 'xl',
    })
    expect(root['data-orientation-sm']).toBeUndefined()
    expect(root['data-align']).toBeUndefined()
    expect(root['data-justify']).toBeUndefined()
  })

  it('方向对象不写 base 时基础档仍是横排：读一眼 DOM 就知道窄屏往哪排', () => {
    expect(flexRoot({ orientation: { md: 'vertical' } })).toMatchObject({ 'data-orientation': 'horizontal', 'data-orientation-md': 'vertical' })
  })
})

describe('normalizeFlexTier', () => {
  it('缺席与空串即未声明，单值原样', () => {
    expect(normalizeFlexTier(null)).toBeUndefined()
    expect(normalizeFlexTier('')).toBeUndefined()
    expect(normalizeFlexTier('vertical')).toBe('vertical')
  })

  it('逐档写的 JSON 对象只收五个档位键上的非空字符串', () => {
    expect(normalizeFlexTier('{"base":"vertical","md":"horizontal","huge":"x","lg":3,"xl":""}')).toEqual({ base: 'vertical', md: 'horizontal' })
  })

  it('写坏的 JSON 当没写，不落半截对象；档位上不是字符串的值不收', () => {
    expect(normalizeFlexTier('{"base":')).toBeUndefined()
    expect(normalizeFlexTier(' {"base": "x"')).toBeUndefined()
    expect(normalizeFlexTier('{"base":["vertical"]}')).toEqual({})
  })
})
