import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Breadcrumb from '../src/Breadcrumb'

describe('Breadcrumb', () => {
  it('should render correctly', () => {
    const wrapper = mount(Breadcrumb)
    expect(wrapper.find('.xh-breadcrumb').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Breadcrumb)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
