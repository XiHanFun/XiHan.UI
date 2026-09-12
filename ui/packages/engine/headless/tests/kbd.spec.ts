import type { KbdProps } from '../src/kbd'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectKbd } from '../src/kbd'

function api(props: KbdProps) {
  return connectKbd(props, normalizeProps)
}

describe('connectKbd', () => {
  it('单枚 Mod 按平台格式化，符号仍有可读名称', () => {
    const mac = api({ value: 'Mod', platform: 'mac' })
    expect(mac.label).toBe('⌘')
    expect(mac.segment).toMatchObject({ key: 'Meta', modifier: true })
    expect(mac.getRootProps()).toMatchObject({
      'data-scope': 'kbd',
      'data-part': 'root',
      'data-platform': 'mac',
      'data-modifier': '',
      'aria-label': 'Command',
    })
  })

  it('尺寸、禁用和真实按下事实独立投影', () => {
    const current = api({ value: 'S', size: 'lg', disabled: true, pressed: true })
    expect(current.getRootProps()).toMatchObject({
      'data-size': 'lg',
      'data-disabled': '',
      'data-pressed': '',
    })
  })

  it('空 value 明确报错，不渲染无名称空壳', () => {
    expect(() => connectKbd({ value: '' }, normalizeProps)).toThrow(/非空字符串/)
  })

  it('读屏键名由 Headless 翻译入口覆盖', () => {
    expect(api({
      value: 'Mod',
      platform: 'other',
      translations: { keyName: key => key === 'Control' ? '控制键' : key },
    }).getRootProps()).toMatchObject({ 'aria-label': '控制键' })
  })

  it('翻译不能把可读键名抹空', () => {
    expect(() => api({ value: 'S', translations: { keyName: () => '' } })).toThrow(/不能为空/)
  })
})
