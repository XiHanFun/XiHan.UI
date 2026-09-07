// @vitest-environment jsdom
//
// 分隔符自动铺开这条路，共享一致性套件咬不到：套件的 fixture 把 split 部件一个不落地手写在树里，
// 自动铺那一支一次都走不到。铺错了套件照样全绿——分隔符会插在整段的两头，
// 或者在被丢掉的子节点两侧连着铺出两条。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhFlex, XhFlexSplit } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

/** root 上的子元素序列：分隔符记 'split'，其余记标签名。 */
function marks(): string[] {
  const el = host!.querySelector('[data-scope="flex"][data-part="root"]')!
  return [...el.children].map(node =>
    (node.getAttribute('data-part') === 'split' ? 'split' : node.tagName.toLowerCase()),
  )
}

const rule = <i />

describe('flex 分隔符自动铺开', () => {
  it('不给 split 时子项原样交出去，中间什么都不插', () => {
    mount(
      <XhFlex>
        <s>甲</s>
        <s>乙</s>
        <s>丙</s>
      </XhFlex>,
    )
    expect(marks()).toEqual(['s', 's', 's'])
  })

  it('给了 split 时，每两个子项之间铺一个分隔符部件，首尾不铺', () => {
    mount(
      <XhFlex split={rule}>
        <s>甲</s>
        <s>乙</s>
        <s>丙</s>
      </XhFlex>,
    )
    expect(marks()).toEqual(['s', 'split', 's', 'split', 's'])
  })

  it('只有一个子项时不铺：没有「两个子项之间」这回事', () => {
    mount(<XhFlex split={rule}><s>甲</s></XhFlex>)
    expect(marks()).toEqual(['s'])
  })

  it('map 产出的数组被摊平：分隔符铺进每一道缝，而不是整段的两头', () => {
    mount(
      <XhFlex split={rule}>
        {['甲', '乙', '丙'].map(text => <s key={text}>{text}</s>)}
      </XhFlex>,
    )
    expect(marks()).toEqual(['s', 'split', 's', 'split', 's'])
  })

  it('条件渲染落空留下的 false 不算子项，不会铺出两个挨在一起的分隔符', () => {
    mount(
      <XhFlex split={rule}>
        <s>甲</s>
        {false}
        <s>乙</s>
      </XhFlex>,
    )
    expect(marks()).toEqual(['s', 'split', 's'])
  })

  it('只有空白的文本不算子项：它一个像素都不画', () => {
    mount(
      <XhFlex split={rule}>
        <s>甲</s>
        {'   '}
        <s>乙</s>
      </XhFlex>,
    )
    expect(marks()).toEqual(['s', 'split', 's'])
  })
})

describe('flex 分隔符部件', () => {
  it('分隔符是 span 角色节点，恒带 aria-hidden，内容原样落在里面', () => {
    mount(
      <XhFlex split={<i>·</i>}>
        <s>甲</s>
        <s>乙</s>
      </XhFlex>,
    )
    const split = host!.querySelector('[data-scope="flex"][data-part="split"]')!
    expect(split.tagName.toLowerCase()).toBe('span')
    expect(split.getAttribute('aria-hidden')).toBe('true')
    expect(split.innerHTML).toBe('<i>·</i>')
  })

  it('手写分隔符部件与自动铺开产出同一种结构：结构一致才谈得上换写法', () => {
    mount(
      <XhFlex split={rule}>
        <s>甲</s>
        <s>乙</s>
      </XhFlex>,
    )
    const automatic = marks()
    act(() => root!.render(
      <XhFlex>
        <s>甲</s>
        <XhFlexSplit><i /></XhFlexSplit>
        <s>乙</s>
      </XhFlex>,
    ))
    expect(marks()).toEqual(automatic)
  })
})
