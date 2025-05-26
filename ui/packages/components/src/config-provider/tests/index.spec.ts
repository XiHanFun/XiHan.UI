import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ConfigProvider from '../src/ConfigProvider'

describe('ConfigProvider', () => {
  it('should render correctly', () => {
    const wrapper = mount(ConfigProvider)
    expect(wrapper.find('.xh-config-provider').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(ConfigProvider)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
