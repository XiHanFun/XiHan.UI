import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Space from '../src/Space'

describe('Space', () => {
  it('should render correctly', () => {
    const wrapper = mount(Space)
    expect(wrapper.find('.xh-space').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Space)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
