import type { AvatarGroupProps } from '../src/avatar-group'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { avatarGroupAnatomy, connectAvatarGroup } from '../src/avatar-group'

const parts = avatarGroupAnatomy.build()

function api(props: AvatarGroupProps = {}) {
  return connectAvatarGroup(props, normalizeProps)
}

describe('connectAvatarGroup', () => {
  it('根缺省只带身份：不写 role，尺寸与上限不写就不落', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject(parts.root.attrs)
    expect(root.role).toBeUndefined()
    expect(root['data-size']).toBeUndefined()
    expect(root['data-max']).toBeUndefined()
  })

  it('上限如实落成字符串，尺寸落到根上', () => {
    expect(api({ max: 3, size: 'sm' }).getRootProps()).toMatchObject({ 'data-max': '3', 'data-size': 'sm' })
    expect((api({ max: 0 }).getRootProps() as Record<string, unknown>)['data-max']).toBe('0')
  })

  it('溢出计数只拿身份，内容由作者写', () => {
    expect(api().getOverflowItemProps()).toEqual(parts['overflow-item'].attrs)
  })
})
