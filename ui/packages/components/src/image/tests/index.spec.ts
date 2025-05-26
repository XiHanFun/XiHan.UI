import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Image from '../src/Image'

describe('Image', () => {
  it('should render correctly', () => {
    const wrapper = mount(Image)
    expect(wrapper.find('.xh-image').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Image)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
