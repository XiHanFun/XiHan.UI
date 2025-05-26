import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TreeSelect from '../src/TreeSelect'

describe('TreeSelect', () => {
  it('should render correctly', () => {
    const wrapper = mount(TreeSelect)
    expect(wrapper.find('.xh-tree-select').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(TreeSelect)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
