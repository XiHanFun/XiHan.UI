import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Card from '../src/Card'

describe('Card', () => {
  it('should render correctly', () => {
    const wrapper = mount(Card)
    expect(wrapper.find('.xh-card').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Card)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
