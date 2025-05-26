import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tour from '../src/Tour'

describe('Tour', () => {
  it('should render correctly', () => {
    const wrapper = mount(Tour)
    expect(wrapper.find('.xh-tour').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Tour)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
