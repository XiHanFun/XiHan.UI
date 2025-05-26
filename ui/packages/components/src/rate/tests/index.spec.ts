import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Rate from '../src/Rate'

describe('Rate', () => {
  it('should render correctly', () => {
    const wrapper = mount(Rate)
    expect(wrapper.find('.xh-rate').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Rate)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
