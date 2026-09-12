import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectSeparator } from '../src/separator'

function root(props: Parameters<typeof connectSeparator>[0] = {}): Record<string, unknown> {
  return connectSeparator(props, normalizeProps).getRootProps() as Record<string, unknown>
}

describe('connectSeparator', () => {
  it('语义水平分隔使用 ARIA 默认朝向，不输出多余属性', () => {
    expect(root()).toMatchObject({
      'role': 'separator',
      'data-orientation': 'horizontal',
    })
    expect(root()['aria-orientation']).toBeUndefined()
    expect(root()['aria-hidden']).toBeUndefined()
  })

  it('语义垂直分隔显式输出 aria-orientation', () => {
    expect(root({ orientation: 'vertical' })).toMatchObject({
      'role': 'separator',
      'aria-orientation': 'vertical',
      'data-orientation': 'vertical',
    })
  })

  it('decorative 会隐藏整段无障碍子树并移除语义朝向', () => {
    const props = root({ decorative: true, orientation: 'vertical' })
    expect(props).toMatchObject({
      'role': 'none',
      'aria-hidden': true,
      'data-orientation': 'vertical',
    })
    expect(props['aria-orientation']).toBeUndefined()
  })
})
