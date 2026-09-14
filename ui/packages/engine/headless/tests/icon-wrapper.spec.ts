import type { IconWrapperProps } from '../src/icon-wrapper'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectIconWrapper, iconWrapperAnatomy } from '../src/icon-wrapper'

function root(props: IconWrapperProps = {}): Record<string, unknown> {
  return connectIconWrapper(props, normalizeProps).getRootProps() as Record<string, unknown>
}

describe('connectIconWrapper', () => {
  it('缺省只带身份：三轴不写就不落属性，也不替作者决定 role 与 aria-hidden', () => {
    const props = root()
    expect(props).toMatchObject(iconWrapperAnatomy.build().root.attrs)
    expect(props['data-variant']).toBeUndefined()
    expect(props['data-tone']).toBeUndefined()
    expect(props['data-size']).toBeUndefined()
    expect(props.role).toBeUndefined()
    expect(props['aria-hidden']).toBeUndefined()
  })

  it('形态、语气、尺寸三轴逐个落到根上', () => {
    expect(root({ variant: 'subtle', tone: 'warning', size: 'lg' })).toMatchObject({
      'data-variant': 'subtle',
      'data-tone': 'warning',
      'data-size': 'lg',
    })
  })
})
