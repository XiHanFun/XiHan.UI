// @vitest-environment jsdom
// 头部摆在列表之外：根常写成 dl，dl 的子节点只能是成对的 dt / dd。React 侧经 header 传入。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhDescriptionsExtra,
  XhDescriptionsHeader,
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsTitle,
  XhDescriptionsValue,
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

describe('描述列表的头部', () => {
  it('渲成 dl 的前一个兄弟，不落进 dl 里面；标题缺省 div，写了 as 就换标签', () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    act(() => root!.render(
      <XhDescriptionsRoot
        size="sm"
        header={(
          <XhDescriptionsHeader>
            <XhDescriptionsTitle as="h3">订单信息</XhDescriptionsTitle>
            <XhDescriptionsExtra><button type="button">编辑</button></XhDescriptionsExtra>
          </XhDescriptionsHeader>
        )}
      >
        <XhDescriptionsItem>
          <XhDescriptionsLabel>订单号</XhDescriptionsLabel>
          <XhDescriptionsValue>XH-0042</XhDescriptionsValue>
        </XhDescriptionsItem>
      </XhDescriptionsRoot>,
    ))
    const header = host.querySelector<HTMLElement>('[data-scope="descriptions"][data-part="header"]')!
    const list = host.querySelector<HTMLElement>('[data-scope="descriptions"][data-part="root"]')!
    expect(header.nextElementSibling).toBe(list)
    expect(list.contains(header)).toBe(false)
    expect(header.getAttribute('data-size')).toBe('sm')
    expect(host.querySelector('[data-part="title"]')!.tagName).toBe('H3')
    expect(host.querySelector('[data-part="extra"] button')!.textContent).toBe('编辑')
  })
})
