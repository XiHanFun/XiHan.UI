import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Cascader from '../src/Cascader'

describe('Cascader', () => {
  it('should render correctly', () => {
    const wrapper = mount(Cascader)
    expect(wrapper.find('.xh-cascader').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Cascader)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
