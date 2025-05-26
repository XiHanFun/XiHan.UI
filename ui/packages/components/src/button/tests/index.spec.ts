import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Button from '../src/Button'

describe('Button', () => {
  it('should render correctly', () => {
    const wrapper = mount(Button)
    expect(wrapper.find('.xh-button').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Button)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
