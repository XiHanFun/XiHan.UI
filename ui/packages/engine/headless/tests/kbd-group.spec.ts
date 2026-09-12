import type { KbdGroupProps } from '../src/kbd-group'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectKbdGroup } from '../src/kbd-group'

function api(props: KbdGroupProps) {
  return connectKbdGroup(props, normalizeProps)
}

describe('connectKbdGroup', () => {
  it('整组只由 root 念一次，视觉键帽与连接符不重复进无障碍树', () => {
    const current = api({ keys: ['Mod', 'S'], platform: 'other' })
    expect(current.getRootProps()).toMatchObject({
      'role': 'img',
      'aria-label': 'Control + S',
      'data-scope': 'kbd-group',
      'data-part': 'root',
    })
    expect(current.getKeyProps({ value: 'Mod' })).toMatchObject({
      'aria-hidden': 'true',
      'data-modifier': '',
    })
    expect(current.getSeparatorProps()).toMatchObject({ 'aria-hidden': 'true' })
  })

  it('mac 连排并收起连接符，其他平台使用加号', () => {
    const mac = api({ keys: ['Mod', 'Shift', 'S'], platform: 'mac' })
    expect(mac.segments.map(segment => segment.label)).toEqual(['⌘', '⇧', 'S'])
    expect(mac.separator).toBe('')
    expect(mac.getSeparatorProps()).toMatchObject({ hidden: true })

    const other = api({ keys: ['Mod', 'S'], platform: 'other' })
    expect(other.separator).toBe('+')
    expect((other.getSeparatorProps() as Record<string, unknown>).hidden).toBeUndefined()
  })

  it('状态事实只写在组根', () => {
    const current = api({ keys: ['S'], size: 'sm', disabled: true, pressed: true })
    expect(current.getRootProps()).toMatchObject({
      'data-size': 'sm',
      'data-disabled': '',
      'data-pressed': '',
    })
  })

  it('空 keys 明确报错，不渲染无名称图像', () => {
    expect(() => connectKbdGroup({ keys: [] }, normalizeProps)).toThrow(/非空/)
  })

  it('逐键和整组翻译都在 Headless 合成', () => {
    const current = api({
      keys: ['Mod', 'S'],
      platform: 'other',
      translations: {
        keyName: key => key === 'Control' ? '控制' : key,
        hotkey: names => names.join('加'),
      },
    })
    expect(current.getRootProps()).toMatchObject({ 'aria-label': '控制加S' })
  })

  it('翻译不能把整组可读名称抹空', () => {
    expect(() => api({ keys: ['S'], translations: { hotkey: () => '' } })).toThrow(/不能为空/)
  })
})
