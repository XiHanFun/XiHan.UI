// 全局配置的组件级缺省：实例没给才填、优先于应用级 size、布尔开关按「没写过」判、不收值与回调、嵌套按组件逐键合并。
import { describe, expect, it } from 'vitest'
import { componentDefault, fillXhConfigDefaults, mergeXhConfig } from '../src/config/config-merge'

describe('fillXhConfigDefaults 的组件级缺省', () => {
  it('实例没给才填，给了的以实例为准；没声明的键不平白多出来', () => {
    const config = { defaults: { 'text-field': { variant: 'subtle', tone: 'danger' } } }
    expect(fillXhConfigDefaults('text-field', { variant: undefined, tone: 'brand' }, config)).toEqual({ variant: 'subtle', tone: 'brand' })
    expect(fillXhConfigDefaults('text-field', { size: undefined }, config)).toEqual({ size: undefined })
  })

  it('只认自己那一桶', () => {
    const config = { defaults: { button: { tone: 'neutral' } } }
    const props = { tone: undefined }
    expect(fillXhConfigDefaults('text-field', props, config)).toBe(props)
  })

  it('组件级的 size 压过应用级的 size', () => {
    const config = { size: 'lg' as const, defaults: { 'text-field': { size: 'sm' } } }
    expect(fillXhConfigDefaults('text-field', { size: undefined }, config)).toEqual({ size: 'sm' })
    expect(fillXhConfigDefaults('select', { size: undefined }, config)).toEqual({ size: 'lg' })
  })

  it('值为 false 的布尔开关：适配器说作者没写过才算没给', () => {
    const config = { defaults: { 'text-field': { clearable: true } } }
    expect(fillXhConfigDefaults('text-field', { clearable: false }, config)).toEqual({ clearable: false })
    expect(fillXhConfigDefaults('text-field', { clearable: false }, config, () => false)).toEqual({ clearable: true })
    expect(fillXhConfigDefaults('text-field', { clearable: false }, config, key => key === 'clearable')).toEqual({ clearable: false })
  })

  it('不收值、初值、回调与文案', () => {
    const onValueChange = (): void => {}
    const config = { defaults: { 'text-field': { value: 'x', defaultValue: 'y', onValueChange, translations: {} } } }
    const props = { value: undefined, defaultValue: undefined, onValueChange: undefined, translations: undefined }
    expect(fillXhConfigDefaults('text-field', props, config)).toBe(props)
    expect(componentDefault('text-field', 'value', config)).toBeUndefined()
    expect(componentDefault('text-field', 'onValueChange', config)).toBeUndefined()
  })
})

describe('mergeXhConfig 的组件级缺省', () => {
  it('嵌套注入按组件逐键合并，内层胜出', () => {
    const outer = { defaults: { 'button': { tone: 'neutral', variant: 'outline' }, 'text-field': { clearable: true } } }
    const inner = { defaults: { button: { tone: 'danger' } } }
    expect(mergeXhConfig(outer, inner).defaults).toEqual({
      'button': { tone: 'danger', variant: 'outline' },
      'text-field': { clearable: true },
    })
  })
})
