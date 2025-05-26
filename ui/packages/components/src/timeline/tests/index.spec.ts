import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Timeline from '../src/Timeline'

describe('Timeline', () => {
  it('should render correctly', () => {
    const wrapper = mount(Timeline)
    expect(wrapper.find('.xh-timeline').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Timeline)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
