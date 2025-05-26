import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Switch from '../src/Switch'

describe('Switch', () => {
  it('should render correctly', () => {
    const wrapper = mount(Switch)
    expect(wrapper.find('.xh-switch').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Switch)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
