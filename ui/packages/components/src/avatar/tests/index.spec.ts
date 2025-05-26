import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Avatar from '../src/Avatar'

describe('Avatar', () => {
  it('should render correctly', () => {
    const wrapper = mount(Avatar)
    expect(wrapper.find('.xh-avatar').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Avatar)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
