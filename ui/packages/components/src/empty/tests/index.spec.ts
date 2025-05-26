import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Empty from '../src/Empty'

describe('Empty', () => {
  it('should render correctly', () => {
    const wrapper = mount(Empty)
    expect(wrapper.find('.xh-empty').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Empty)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
