import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tabs from '../src/Tabs'

describe('Tabs', () => {
  it('should render correctly', () => {
    const wrapper = mount(Tabs)
    expect(wrapper.find('.xh-tabs').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Tabs)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
