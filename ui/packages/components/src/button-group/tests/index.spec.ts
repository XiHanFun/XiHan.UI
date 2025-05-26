import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ButtonGroup from '../src/ButtonGroup'

describe('ButtonGroup', () => {
  it('should render correctly', () => {
    const wrapper = mount(ButtonGroup)
    expect(wrapper.find('.xh-button-group').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(ButtonGroup)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
