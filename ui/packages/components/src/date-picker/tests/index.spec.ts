import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DatePicker from '../src/DatePicker'

describe('DatePicker', () => {
  it('should render correctly', () => {
    const wrapper = mount(DatePicker)
    expect(wrapper.find('.xh-date-picker').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(DatePicker)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
