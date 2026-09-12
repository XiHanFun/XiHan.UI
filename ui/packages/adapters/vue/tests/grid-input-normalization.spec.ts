// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhGridItem, XhGridRoot } from '../src'

describe('grid 输入归一接线', () => {
  it('把 JSON 断点声明交给 Headless 后落成逐档属性', () => {
    const view = mount(defineComponent({
      setup: () => () => h(XhGridRoot, { cols: '{"base":"2","md":"6"}' }, () =>
        h(XhGridItem, { span: '{"base":"1","lg":"4"}' }, () => '内容')),
    }))
    const root = view.get('[data-part="root"]')
    const item = view.get('[data-part="item"]')
    expect(root.attributes('data-cols')).toBe('2')
    expect(root.attributes('data-cols-md')).toBe('6')
    expect(item.attributes('data-span')).toBe('1')
    expect(item.attributes('data-span-lg')).toBe('4')
  })
})
