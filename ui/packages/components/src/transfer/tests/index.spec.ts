import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Transfer from '../src/Transfer'

describe('Transfer', () => {
  it('should render correctly', () => {
    const wrapper = mount(Transfer)
    expect(wrapper.find('.xh-transfer').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Transfer)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
