import type { InputGroupProps } from '../src/input-group'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectInputGroup, inputGroupAnatomy } from '../src/input-group'

const parts = inputGroupAnatomy.build()

function api(props: InputGroupProps = {}) {
  return connectInputGroup(props, normalizeProps)
}

describe('connectInputGroup', () => {
  it('根缺省只带身份：不写 role，组里各控件的角色与可及名归它们自己；两轴不写就不落', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject(parts.root.attrs)
    expect(root.role).toBeUndefined()
    expect(root['data-variant']).toBeUndefined()
    expect(root['data-size']).toBeUndefined()
  })

  it('形态与尺寸只落在根上', () => {
    expect(api({ variant: 'secondary', size: 'lg' }).getRootProps()).toMatchObject({
      'data-variant': 'secondary',
      'data-size': 'lg',
    })
  })

  it('前后缀块只拿身份：文本由作者写，观感由皮肤按身份给', () => {
    expect(api().getItemProps()).toEqual(parts.item.attrs)
  })
})
