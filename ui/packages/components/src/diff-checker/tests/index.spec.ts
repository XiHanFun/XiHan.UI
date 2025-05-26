import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DiffChecker from '../src/DiffChecker'

describe('DiffChecker', () => {
  it('should render correctly', () => {
    const wrapper = mount(DiffChecker)
    expect(wrapper.find('.xh-diff-checker').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(DiffChecker)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
