import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Checkbox from '../src/Checkbox'

describe('Checkbox', () => {
  it('should render correctly', () => {
    const wrapper = mount(Checkbox)
    expect(wrapper.find('.xh-checkbox').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Checkbox)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
