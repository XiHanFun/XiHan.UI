import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ColorPicker from '../src/ColorPicker'

describe('ColorPicker', () => {
  it('should render correctly', () => {
    const wrapper = mount(ColorPicker)
    expect(wrapper.find('.xh-color-picker').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(ColorPicker)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
