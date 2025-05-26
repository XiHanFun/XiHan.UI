import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tooltip from '../src/Tooltip'

describe('Tooltip', () => {
  it('should render correctly', () => {
    const wrapper = mount(Tooltip)
    expect(wrapper.find('.xh-tooltip').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Tooltip)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
