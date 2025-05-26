import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tag from '../src/Tag'

describe('Tag', () => {
  it('should render correctly', () => {
    const wrapper = mount(Tag)
    expect(wrapper.find('.xh-tag').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Tag)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
