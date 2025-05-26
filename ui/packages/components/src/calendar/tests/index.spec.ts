import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Calendar from '../src/Calendar'

describe('Calendar', () => {
  it('should render correctly', () => {
    const wrapper = mount(Calendar)
    expect(wrapper.find('.xh-calendar').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Calendar)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
