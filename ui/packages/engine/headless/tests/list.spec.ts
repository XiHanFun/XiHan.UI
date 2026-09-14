import type { ListProps } from '../src/list'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectList, listAnatomy } from '../src/list'

const parts = listAnatomy.build()

function api(props: ListProps = {}) {
  return connectList(props, normalizeProps)
}

describe('connectList', () => {
  it('根与条目都不写 role：是不是列表由作者选的标签表达；轴与开关不写就不落', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject(parts.root.attrs)
    expect(root.role).toBeUndefined()
    expect(root['data-size']).toBeUndefined()
    expect(root['data-bordered']).toBeUndefined()
    expect(root['data-hoverable']).toBeUndefined()
    expect(root['data-split']).toBeUndefined()
    expect((api().getItemProps() as Record<string, unknown>).role).toBeUndefined()
  })

  it('一个轴与三个开关只落在根上', () => {
    expect(api({ size: 'sm', bordered: true, hoverable: true, split: true }).getRootProps()).toMatchObject({
      'data-size': 'sm',
      'data-bordered': '',
      'data-hoverable': '',
      'data-split': '',
    })
  })

  it('条目六个部件只拿身份，标题不占标题层级', () => {
    const a = api()
    expect(a.getItemProps()).toEqual(parts.item.attrs)
    expect(a.getItemMediaProps()).toEqual(parts['item-media'].attrs)
    expect(a.getItemContentProps()).toEqual(parts['item-content'].attrs)
    expect(a.getItemTitleProps()).toEqual(parts['item-title'].attrs)
    expect(a.getItemDescriptionProps()).toEqual(parts['item-description'].attrs)
    expect(a.getItemActionProps()).toEqual(parts['item-action'].attrs)
  })
})
