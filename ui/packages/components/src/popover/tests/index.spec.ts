import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Popover from '../src/Popover'

describe('Popover', () => {
  it('should render correctly', () => {
    const wrapper = mount(Popover)
    expect(wrapper.find('.xh-popover').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Popover)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
