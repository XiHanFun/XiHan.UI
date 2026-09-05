// @vitest-environment jsdom
import type { VNode } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { Comment, defineComponent, Fragment, h } from 'vue'
import { XhFlex, XhFlexSplit } from '../src/components/flex/flex'

afterEach(() => {
  document.body.innerHTML = ''
})

/** 挂一个 Flex，回它 root 上的子元素序列：分隔符记 'split'，其余记标签名。 */
function marks(children: () => VNode[], split?: () => VNode[]): string[] {
  const slots: Record<string, () => VNode[]> = { default: children }
  if (split)
    slots.split = split
  mount(defineComponent({ setup: () => () => h(XhFlex, null, slots) }), { attachTo: document.body })
  const root = document.querySelector('[data-scope="flex"][data-part="root"]')!
  return Array.from(root.children).map(el => (el.getAttribute('data-part') === 'split' ? 'split' : el.tagName.toLowerCase()))
}

const item = (text: string): VNode => h('s', text)
const rule = (): VNode[] => [h('i')]

describe('flex 分隔符插槽', () => {
  it('没给 split 插槽时子项原样交出去，中间什么都不插', () => {
    expect(marks(() => [item('甲'), item('乙'), item('丙')])).toEqual(['s', 's', 's'])
  })

  it('给了 split 插槽时，每两个子项之间铺一个分隔符部件，首尾不铺', () => {
    expect(marks(() => [item('甲'), item('乙'), item('丙')], rule)).toEqual(['s', 'split', 's', 'split', 's'])
  })

  it('只有一个子项时不铺：没有"两个子项之间"这回事', () => {
    expect(marks(() => [item('甲')], rule)).toEqual(['s'])
  })

  it('v-for 产出的片段被摊平：分隔符铺进每一道缝，而不是整段的两头', () => {
    const list = (): VNode[] => [h(Fragment, [item('甲'), item('乙'), item('丙')])]
    expect(marks(list, rule)).toEqual(['s', 'split', 's', 'split', 's'])
  })

  it('v-if 落空留下的注释节点不算子项，不会铺出两个挨在一起的分隔符', () => {
    const list = (): VNode[] => [item('甲'), h(Comment), item('乙')]
    expect(marks(list, rule)).toEqual(['s', 'split', 's'])
  })
})

describe('flex 分隔符部件', () => {
  it('分隔符是 span 角色节点，恒带 aria-hidden，插槽内容原样落在里面', () => {
    mount(
      defineComponent({
        setup: () => () => h(XhFlex, null, { default: () => [item('甲'), item('乙')], split: () => [h('i', '·')] }),
      }),
      { attachTo: document.body },
    )
    const split = document.querySelector('[data-scope="flex"][data-part="split"]')!
    expect(split.tagName.toLowerCase()).toBe('span')
    expect(split.getAttribute('aria-hidden')).toBe('true')
    expect(split.innerHTML).toBe('<i>·</i>')
  })

  it('手写分隔符部件与 split 插槽铺出同一种结构：结构一致才谈得上换写法', () => {
    const slotted = marks(() => [item('甲'), item('乙')], rule)
    document.body.innerHTML = ''
    mount(
      defineComponent({
        setup: () => () => h(XhFlex, null, {
          default: () => [item('甲'), h(XhFlexSplit, null, () => [h('i')]), item('乙')],
        }),
      }),
      { attachTo: document.body },
    )
    const root = document.querySelector('[data-scope="flex"][data-part="root"]')!
    const handWritten = Array.from(root.children).map(el =>
      (el.getAttribute('data-part') === 'split' ? 'split' : el.tagName.toLowerCase()),
    )
    expect(handWritten).toEqual(slotted)
  })
})
