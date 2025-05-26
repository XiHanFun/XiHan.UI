import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Dropdown from '../src/Dropdown'

describe('Dropdown', () => {
  it('should render correctly', () => {
    const wrapper = mount(Dropdown)
    expect(wrapper.find('.xh-dropdown').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Dropdown)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
