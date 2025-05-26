import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Menu from '../src/Menu'

describe('Menu', () => {
  it('should render correctly', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.xh-menu').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Menu)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
