import type { ContainerMaxWidth } from '../src/container'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectContainer, containerAnatomy, containerKeyboard, containerMeta } from '../src/container'

function connect(props: Parameters<typeof connectContainer>[0] = {}) {
  return connectContainer(props, normalizeProps)
}

function root(props: Parameters<typeof connectContainer>[0] = {}): Record<string, unknown> {
  return connect(props).getRootProps() as Record<string, unknown>
}

describe('connectContainer', () => {
  it('缺省档是 lg，缺省档也写出 data-max-width：皮肤不靠属性缺席认缺省', () => {
    expect(connect().maxWidth).toBe('lg')
    expect(root()).toMatchObject({
      'data-scope': 'container',
      'data-part': 'root',
      'data-max-width': 'lg',
    })
  })

  it.each<ContainerMaxWidth>(['sm', 'md', 'lg', 'xl', 'full'])('档位 %s 原样落到根上，api 读回同一个值', (maxWidth) => {
    const api = connect({ maxWidth })
    expect(api.maxWidth).toBe(maxWidth)
    expect(api.getRootProps()).toMatchObject({ 'data-max-width': maxWidth })
  })

  it('显式传 undefined 与不传一样回到 lg', () => {
    expect(root({ maxWidth: undefined })['data-max-width']).toBe('lg')
  })

  it('根上不写 role、tabindex 与 ARIA：版心只是排版用的盒子', () => {
    const props = root({ maxWidth: 'md' })
    expect(props.role).toBeUndefined()
    expect(props.tabIndex).toBeUndefined()
    expect(props.tabindex).toBeUndefined()
    expect(Object.keys(props).filter(key => key.startsWith('aria-'))).toEqual([])
  })

  it('解剖只有 root，必需部件就是它；键盘表为空', () => {
    expect(containerAnatomy.parts).toEqual(['root'])
    expect(containerMeta.requiredParts).toEqual(['root'])
    expect(containerKeyboard.rows).toEqual([])
  })
})
