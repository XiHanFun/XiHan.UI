import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Anchor from '../src/Anchor'

describe('Anchor', () => {
  it('should render correctly', () => {
    const wrapper = mount(Anchor)
    expect(wrapper.find('.xh-anchor').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Anchor)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
