import type { ButtonGroupProps } from '../src/button-group'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { buttonGroupAnatomy, connectButtonGroup } from '../src/button-group'

function root(props: ButtonGroupProps = {}): Record<string, unknown> {
  return connectButtonGroup(props, normalizeProps).getRootProps() as Record<string, unknown>
}

describe('connectButtonGroup 缺省', () => {
  it('横排、不禁用、自动插分隔线；variant 缺省显式落 subtle，tone / size 不写就不落属性', () => {
    const api = connectButtonGroup({}, normalizeProps)
    expect(api.orientation).toBe('horizontal')
    expect(api.disabled).toBe(false)
    expect(api.separators).toBe(true)
    // 组缺省中性淡底：只有 Button 单独一枚缺省品牌实心
    expect(api.variant).toBe('subtle')
    expect(api.tone).toBeUndefined()
    expect(api.size).toBeUndefined()

    const props = root()
    expect(props).toMatchObject({ 'role': 'group', 'data-orientation': 'horizontal', 'data-variant': 'subtle' })
    expect(props['data-tone']).toBeUndefined()
    expect(props['data-size']).toBeUndefined()
    expect(props['data-disabled']).toBeUndefined()
    expect(props['data-full-width']).toBeUndefined()
    // role=group 不收 aria-orientation，排布只走 data-orientation
    expect(props['aria-orientation']).toBeUndefined()
  })

  it('根带 anatomy 的 scope 与 part', () => {
    const parts = buttonGroupAnatomy.build()
    expect(root()).toMatchObject(parts.root.attrs)
  })
})

describe('connectButtonGroup 三轴与状态', () => {
  it('三轴落在根上，并经 api 暴露给适配器下发到每一段', () => {
    expect(root({ variant: 'outline', tone: 'danger', size: 'sm' })).toMatchObject({
      'data-variant': 'outline',
      'data-tone': 'danger',
      'data-size': 'sm',
    })
    const api = connectButtonGroup({ variant: 'outline', tone: 'danger', size: 'sm' }, normalizeProps)
    expect(api.variant).toBe('outline')
    expect(api.tone).toBe('danger')
    expect(api.size).toBe('sm')
  })

  it('竖排、禁用与撑满行宽各落一个状态位', () => {
    const api = connectButtonGroup({ orientation: 'vertical', disabled: true, fullWidth: true }, normalizeProps)
    expect(api.orientation).toBe('vertical')
    expect(api.disabled).toBe(true)
    expect(root({ orientation: 'vertical', disabled: true, fullWidth: true })).toMatchObject({
      'data-orientation': 'vertical',
      'data-disabled': '',
      'data-full-width': '',
    })
  })

  it('separators=false 关掉自动分隔线，只影响 api 不落 DOM', () => {
    const api = connectButtonGroup({ separators: false }, normalizeProps)
    expect(api.separators).toBe(false)
    expect(root({ separators: false })['data-separators']).toBeUndefined()
  })
})
