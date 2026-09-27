// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { XhBreadcrumbRoot } from '../src'

const COLLECTION = [
  { value: 'home', label: '首页', href: '#/' },
  { value: 'components', label: '组件', href: '#/components' },
  { value: 'breadcrumb', label: '面包屑', current: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

describe('breadcrumb collection', () => {
  it('默认铺开层级并由皮肤绘制空分隔符', () => {
    const wrapper = mount(XhBreadcrumbRoot, {
      props: { collection: COLLECTION },
      attachTo: document.body,
    })

    const separators = wrapper.findAll('[data-scope="breadcrumb"][data-part="separator"]').map(item => item.element)
    expect(separators).toHaveLength(2)
    expect(separators.every(separator => separator.textContent === '')).toBe(true)
    expect(separators.every(separator => separator.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(wrapper.find('[data-part="link"][aria-current="page"]').text()).toBe('面包屑')
    wrapper.unmount()
  })

  it('maxItems 折叠出的省略位是可操作的按钮：按下展开完整路径，焦点落到第一条展开出来的链接', async () => {
    const levels = ['首页', '文档', '指南', '组件', '面包屑'].map((label, i) => ({ value: `l${i}`, label, href: `#/${i}`, current: i === 4 }))
    const wrapper = mount(XhBreadcrumbRoot, {
      props: { collection: levels, maxItems: 3 },
      attachTo: document.body,
    })
    expect(wrapper.findAll('[data-part="link"]').map(link => link.text())).toEqual(['首页', '组件', '面包屑'])
    const ellipsis = wrapper.find('[data-scope="breadcrumb"][data-part="ellipsis"]')
    expect(ellipsis.attributes('aria-hidden')).toBeUndefined()
    const trigger = ellipsis.find('button[data-part="ellipsis-trigger"]')
    expect(trigger.attributes('aria-label')).toBe('Show full path')

    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('click')
    await nextTick()
    await Promise.resolve()
    const links = wrapper.findAll('[data-part="link"]')
    expect(links.map(link => link.text())).toEqual(['首页', '文档', '指南', '组件', '面包屑'])
    expect(wrapper.find('[data-part="ellipsis"]').exists()).toBe(false)
    expect(document.activeElement).toBe(links[1]!.element)
    wrapper.unmount()
  })
})
