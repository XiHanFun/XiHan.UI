import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Col from '../src/Col'

describe('Col', () => {
  it('should render correctly', () => {
    const wrapper = mount(Col)
    expect(wrapper.find('.xh-col').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Col)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
