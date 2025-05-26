import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Select from '../src/Select'

describe('Select', () => {
  it('should render correctly', () => {
    const wrapper = mount(Select)
    expect(wrapper.find('.xh-select').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Select)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
