import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Steps from '../src/Steps'

describe('Steps', () => {
  it('should render correctly', () => {
    const wrapper = mount(Steps)
    expect(wrapper.find('.xh-steps').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Steps)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
