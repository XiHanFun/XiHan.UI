import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Collapse from '../src/Collapse'

describe('Collapse', () => {
  it('should render correctly', () => {
    const wrapper = mount(Collapse)
    expect(wrapper.find('.xh-collapse').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Collapse)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
