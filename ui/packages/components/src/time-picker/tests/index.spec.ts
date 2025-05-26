import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TimePicker from '../src/TimePicker'

describe('TimePicker', () => {
  it('should render correctly', () => {
    const wrapper = mount(TimePicker)
    expect(wrapper.find('.xh-time-picker').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(TimePicker)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
