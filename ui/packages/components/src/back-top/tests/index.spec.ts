import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import BackTop from '../src/BackTop'

describe('BackTop', () => {
  it('should render correctly', () => {
    const wrapper = mount(BackTop)
    expect(wrapper.find('.xh-back-top').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(BackTop)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
