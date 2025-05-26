import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Progress from '../src/Progress'

describe('Progress', () => {
  it('should render correctly', () => {
    const wrapper = mount(Progress)
    expect(wrapper.find('.xh-progress').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Progress)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
