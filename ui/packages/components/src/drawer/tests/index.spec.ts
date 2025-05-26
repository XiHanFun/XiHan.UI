import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Drawer from '../src/Drawer'

describe('Drawer', () => {
  it('should render correctly', () => {
    const wrapper = mount(Drawer)
    expect(wrapper.find('.xh-drawer').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Drawer)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
