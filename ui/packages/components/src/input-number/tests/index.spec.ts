import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import InputNumber from '../src/InputNumber'

describe('InputNumber', () => {
  it('should render correctly', () => {
    const wrapper = mount(InputNumber)
    expect(wrapper.find('.xh-input-number').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(InputNumber)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
