import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Watermark from '../src/Watermark'

describe('Watermark', () => {
  it('should render correctly', () => {
    const wrapper = mount(Watermark)
    expect(wrapper.find('.xh-watermark').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Watermark)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
