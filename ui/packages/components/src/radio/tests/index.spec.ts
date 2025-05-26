import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Radio from '../src/Radio'

describe('Radio', () => {
  it('should render correctly', () => {
    const wrapper = mount(Radio)
    expect(wrapper.find('.xh-radio').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Radio)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
