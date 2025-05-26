import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Tree from '../src/Tree'

describe('Tree', () => {
  it('should render correctly', () => {
    const wrapper = mount(Tree)
    expect(wrapper.find('.xh-tree').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Tree)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
