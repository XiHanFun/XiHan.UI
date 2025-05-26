import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Alert from '../src/Alert'

describe('Alert', () => {
  it('should render correctly', () => {
    const wrapper = mount(Alert)
    expect(wrapper.find('.xh-alert').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Alert)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
