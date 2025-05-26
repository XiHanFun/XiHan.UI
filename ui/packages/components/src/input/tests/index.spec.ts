import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Input from '../src/Input'

describe('Input', () => {
  it('should render correctly', () => {
    const wrapper = mount(Input)
    expect(wrapper.find('.xh-input').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Input)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
