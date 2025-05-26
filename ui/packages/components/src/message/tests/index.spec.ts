import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Message from '../src/Message'

describe('Message', () => {
  it('should render correctly', () => {
    const wrapper = mount(Message)
    expect(wrapper.find('.xh-message').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Message)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
