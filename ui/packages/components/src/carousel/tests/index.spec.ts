import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Carousel from '../src/Carousel'

describe('Carousel', () => {
  it('should render correctly', () => {
    const wrapper = mount(Carousel)
    expect(wrapper.find('.xh-carousel').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Carousel)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
