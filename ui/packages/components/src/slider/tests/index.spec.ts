import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Slider from '../src/Slider'

describe('Slider', () => {
  it('should render correctly', () => {
    const wrapper = mount(Slider)
    expect(wrapper.find('.xh-slider').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Slider)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
