import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Divider from '../src/Divider'

describe('Divider', () => {
  it('should render correctly', () => {
    const wrapper = mount(Divider)
    expect(wrapper.find('.xh-divider').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Divider)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
