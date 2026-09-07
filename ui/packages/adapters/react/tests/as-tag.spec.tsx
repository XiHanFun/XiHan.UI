// @vitest-environment jsdom
//
// 三族排版件的 as 与描述列表的 span，共享一致性套件都咬不到：
// 套件的 fixture 从不写这两个 prop，标签名也不在快照里。
// as 失效时页头的标题进不了文档大纲、富文本换不成 article；
// span 失效时跨列的那一格照旧占一列。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
  XhPageHeaderBackTrigger,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
  XhTypographyHeading,
  XhTypographyProse,
  XhTypographyRoot,
  XhTypographyText,
} from '../src'

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

/** 某个 scope 下某个部件的标签名，按文档序。 */
function tags(scope: string, part: string): string[] {
  return [...host!.querySelectorAll(`[data-scope="${scope}"][data-part="${part}"]`)]
    .map(el => el.tagName.toLowerCase())
}

describe('页头的 as', () => {
  it('缺省：标题是 div、返回位是 button——组件自己不往文档大纲里插标题', () => {
    mount(
      <XhPageHeaderRoot>
        <XhPageHeaderBackTrigger>返回</XhPageHeaderBackTrigger>
        <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
      </XhPageHeaderRoot>,
    )
    expect(tags('page-header', 'title')).toEqual(['div'])
    expect(tags('page-header', 'back-trigger')).toEqual(['button'])
  })

  it('写了 as 就换标签，身份属性照旧落在它身上', () => {
    mount(
      <XhPageHeaderRoot>
        <XhPageHeaderBackTrigger as="a">返回</XhPageHeaderBackTrigger>
        <XhPageHeaderTitle as="h1">订单详情</XhPageHeaderTitle>
      </XhPageHeaderRoot>,
    )
    expect(tags('page-header', 'title')).toEqual(['h1'])
    expect(tags('page-header', 'back-trigger')).toEqual(['a'])
    expect(host!.querySelector('[data-part="back-trigger"]')!.getAttribute('data-scope')).toBe('page-header')
  })
})

describe('版式的 as', () => {
  it('缺省：标题是 p、行内文字是 span、富文本是 div', () => {
    mount(
      <XhTypographyRoot>
        <XhTypographyHeading level={2}>版式约定</XhTypographyHeading>
        <XhTypographyText>一段字</XhTypographyText>
        <XhTypographyProse />
      </XhTypographyRoot>,
    )
    expect(tags('typography', 'heading')).toEqual(['p'])
    expect(tags('typography', 'text')).toEqual(['span'])
    expect(tags('typography', 'prose')).toEqual(['div'])
  })

  it('换标签不改档位：level 仍落成 data-level，形态仍落成 data-variant', () => {
    mount(
      <XhTypographyRoot>
        <XhTypographyHeading as="h2" level={2}>版式约定</XhTypographyHeading>
        <XhTypographyText as="code" variant="code">data-level</XhTypographyText>
        <XhTypographyProse as="article" />
      </XhTypographyRoot>,
    )
    expect(tags('typography', 'heading')).toEqual(['h2'])
    expect(tags('typography', 'text')).toEqual(['code'])
    expect(tags('typography', 'prose')).toEqual(['article'])
    expect(host!.querySelector('[data-part="heading"]')!.getAttribute('data-level')).toBe('2')
    expect(host!.querySelector('[data-part="text"]')!.getAttribute('data-variant')).toBe('code')
  })
})

describe('描述列表的 as 与 span', () => {
  it('缺省：根是 dl、每格是 div、标签是 dt、取值是 dd', () => {
    mount(
      <XhDescriptionsRoot>
        <XhDescriptionsItem>
          <XhDescriptionsLabel>订单号</XhDescriptionsLabel>
          <XhDescriptionsValue>XH-0042</XhDescriptionsValue>
        </XhDescriptionsItem>
      </XhDescriptionsRoot>,
    )
    expect(tags('descriptions', 'root')).toEqual(['dl'])
    expect(tags('descriptions', 'item')).toEqual(['div'])
    expect(tags('descriptions', 'label')).toEqual(['dt'])
    expect(tags('descriptions', 'value')).toEqual(['dd'])
  })

  it('跨列写成网格轨道数，钳在 1 到当前列数之间', () => {
    mount(
      <XhDescriptionsRoot columns={3}>
        <XhDescriptionsItem span={2} />
        <XhDescriptionsItem span={9} />
        <XhDescriptionsItem span={0} />
        <XhDescriptionsItem />
      </XhDescriptionsRoot>,
    )
    const spans = [...host!.querySelectorAll<HTMLElement>('[data-part="item"]')]
      .map(el => el.style.gridColumn)
    expect(spans).toEqual(['span 2', 'span 3', 'span 1', ''])
  })
})
