// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
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
})
