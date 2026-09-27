// @vitest-environment jsdom
//
// 导航链接的 asChild：借用作者的路由链接当链接，不再自己渲染 <a>。路由链接自己算出 href、自己拦下点击做
// 客户端跳转，部件属性、按压与聚焦接线要合到它渲出的元素上，且不能用空值盖掉它算出的 href。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhSideNavItem, XhSideNavLink, XhSideNavLinkText, XhSideNavList, XhSideNavRoot } from '../src'

// 条目数据不带 href：地址由路由链接自己算
const COLLECTION = [{ value: 'home', label: '首页' }, { value: 'orders', label: '订单' }]
const navigations: string[] = []

/** 路由链接的替身：按 to 自己算 href，点击时拦下默认跳转并记一笔。 */
const FakeRouterLink = defineComponent({
  name: 'FakeRouterLink',
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('a', {
      href: `/app${props.to}`,
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        navigations.push(props.to)
      },
    }, slots.default?.())
  },
})

afterEach(() => {
  document.body.innerHTML = ''
  navigations.length = 0
})

describe('side-nav link asChild', () => {
  function mountSideNav(asChild: boolean) {
    return mount(XhSideNavRoot, {
      props: { collection: COLLECTION, defaultValue: 'home' },
      attachTo: document.body,
      slots: {
        default: () => h(XhSideNavList, null, () => [
          h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'home', asChild }, () =>
            asChild
              ? h(FakeRouterLink, { to: '/home' }, () => h(XhSideNavLinkText, null, () => '首页'))
              : h(XhSideNavLinkText, null, () => '首页'))),
          h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'orders', asChild }, () =>
            asChild
              ? h(FakeRouterLink, { to: '/orders' }, () => h(XhSideNavLinkText, null, () => '订单'))
              : h(XhSideNavLinkText, null, () => '订单'))),
        ]),
      },
    })
  }

  it('部件属性落到路由链接渲出的 <a> 上，只有一层 <a>，href 仍是路由算出的', () => {
    const wrapper = mountSideNav(true)
    const links = wrapper.findAll('[data-scope="side-nav"][data-part="link"]')
    expect(links).toHaveLength(2)
    expect(wrapper.findAll('a')).toHaveLength(2)
    expect(links[0]!.attributes('href')).toBe('/app/home')
    expect(links[0]!.attributes('aria-current')).toBe('page')
    expect(links[0]!.attributes('data-xh-collection-item')).toBe('')
    expect(links[1]!.attributes('href')).toBe('/app/orders')
    wrapper.unmount()
  })

  it('点击既交给路由跳转，也照常发 value-change', async () => {
    const wrapper = mountSideNav(true)
    await wrapper.findAll('[data-part="link"]')[1]!.trigger('click')
    expect(navigations).toEqual(['/orders'])
    expect(wrapper.emitted('value-change')).toEqual([[{ value: 'orders' }]])
    wrapper.unmount()
  })

  it('不开 asChild 时照常渲染自己的 <a>', () => {
    const wrapper = mountSideNav(false)
    const link = wrapper.find('[data-part="link"]')
    expect(link.element.tagName).toBe('A')
    expect(link.attributes('href')).toBeUndefined()
    wrapper.unmount()
  })

  it('asChild 下子节点不是恰好一个元素时直接报错', () => {
    expect(() => mount(XhSideNavRoot, {
      attachTo: document.body,
      slots: {
        default: () => h(XhSideNavList, null, () => h(XhSideNavItem, null, () =>
          h(XhSideNavLink, { value: 'home', asChild: true }, () => '首页'))),
      },
    })).toThrow(/asChild/)
  })
})
