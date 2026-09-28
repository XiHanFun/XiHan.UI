// @vitest-environment jsdom
// 头部摆在列表之外：根常写成 dl，dl 的子节点只能是成对的 dt / dd。
// Vue 侧因此另开一个 header 插槽——写在默认插槽里的东西全都渲进 dl。
import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhDescriptionsExtra,
  XhDescriptionsHeader,
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsTitle,
  XhDescriptionsValue,
} from '../src'

function mount(withHeader: boolean) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(XhDescriptionsRoot, { size: 'sm', class: 'mine' }, {
      ...(withHeader
        ? {
            header: () => [h(XhDescriptionsHeader, null, () => [
              h(XhDescriptionsTitle, { as: 'h3' }, () => '订单信息'),
              h(XhDescriptionsExtra, null, () => h('button', '编辑')),
            ])],
          }
        : {}),
      default: () => [h(XhDescriptionsItem, null, () => [
        h(XhDescriptionsLabel, null, () => '订单号'),
        h(XhDescriptionsValue, null, () => 'XH-0042'),
      ])],
    }),
  })
  app.mount(host)
  return {
    host,
    done: () => {
      app.unmount()
      host.remove()
    },
  }
}

describe('描述列表的头部插槽', () => {
  it('渲成 dl 的前一个兄弟，不落进 dl 里面；标题按 as 换标签', () => {
    const m = mount(true)
    const header = m.host.querySelector<HTMLElement>('[data-scope="descriptions"][data-part="header"]')!
    const list = m.host.querySelector<HTMLElement>('[data-scope="descriptions"][data-part="root"]')!
    expect(header.nextElementSibling).toBe(list)
    expect(list.contains(header)).toBe(false)
    expect(header.getAttribute('data-size')).toBe('sm')
    expect(m.host.querySelector('[data-part="title"]')!.tagName).toBe('H3')
    expect(m.host.querySelector('[data-part="extra"] button')!.textContent).toBe('编辑')
    m.done()
  })

  it('作者写在根上的 class 仍落在 dl 上', () => {
    const m = mount(true)
    expect(m.host.querySelector('[data-part="root"]')!.classList.contains('mine')).toBe(true)
    m.done()
  })

  it('不写头部时根就是那个 dl，结构与以前一样', () => {
    const m = mount(false)
    expect(m.host.firstElementChild!.getAttribute('data-part')).toBe('root')
    expect(m.host.querySelector('[data-part="header"]')).toBeNull()
    m.done()
  })
})
