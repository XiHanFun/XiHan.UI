import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Notification from '../src/Notification'

describe('Notification', () => {
  it('should render correctly', () => {
    const wrapper = mount(Notification)
    expect(wrapper.find('.xh-notification').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Notification)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
