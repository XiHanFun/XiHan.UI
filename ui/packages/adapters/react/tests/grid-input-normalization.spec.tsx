import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { XhGridItem, XhGridRoot } from '../src'

describe('grid 输入归一接线', () => {
  it('把 JSON 断点声明交给 Headless 后落成逐档属性', () => {
    const view = render(
      <XhGridRoot cols={'{"base":"2","md":"6"}'}>
        <XhGridItem span={'{"base":"1","lg":"4"}'}>内容</XhGridItem>
      </XhGridRoot>,
    )
    const root = view.container.querySelector<HTMLElement>('[data-part="root"]')!
    const item = view.container.querySelector<HTMLElement>('[data-part="item"]')!
    expect(root.dataset.cols).toBe('2')
    expect(root.dataset.colsMd).toBe('6')
    expect(item.dataset.span).toBe('1')
    expect(item.dataset.spanLg).toBe('4')
  })
})
