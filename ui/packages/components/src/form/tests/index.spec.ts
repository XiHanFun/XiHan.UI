import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Form from '../src/Form'

describe('Form', () => {
  it('should render correctly', () => {
    const wrapper = mount(Form)
    expect(wrapper.find('.xh-form').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Form)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
