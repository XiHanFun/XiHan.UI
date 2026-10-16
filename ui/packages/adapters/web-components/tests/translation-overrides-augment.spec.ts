// 文档给出的写法：对 @xihan-ui/web-components 做声明合并，把自定义元素的文案桶补进 XhTranslationOverrides。
// 合并之后，setXhConfig / mergeXhConfig / <xh-config> 收到的 translations 都认得这个桶，写错键会被类型检查拦下。
import type { XhTranslationOverrides } from '@xihan-ui/web-components'
import { describe, expectTypeOf, it } from 'vitest'
import { mergeXhConfig } from '../src/config'

declare module '@xihan-ui/web-components' {
  interface XhTranslationOverrides {
    'xh-step-list'?: { empty?: string }
  }
}

describe('xhTranslationOverrides 声明合并', () => {
  it('补进来的文案桶出现在 XhTranslationOverrides 上，库内组件的桶照旧在', () => {
    expectTypeOf<XhTranslationOverrides>().toHaveProperty('xh-step-list')
    expectTypeOf<NonNullable<XhTranslationOverrides['xh-step-list']>>().toEqualTypeOf<{ empty?: string }>()
    expectTypeOf<XhTranslationOverrides>().toHaveProperty('dialog')
  })

  it('mergeXhConfig 收下补进来的桶，写错键或写错值类型被类型检查拦下', () => {
    mergeXhConfig({}, { translations: { 'xh-step-list': { empty: '暂无步骤' } } })
    // @ts-expect-error 桶里没有这个键
    mergeXhConfig({}, { translations: { 'xh-step-list': { missing: '…' } } })
    // @ts-expect-error 值类型不对
    mergeXhConfig({}, { translations: { 'xh-step-list': { empty: 1 } } })
  })
})
