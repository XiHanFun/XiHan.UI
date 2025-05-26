import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Skeleton from '../src/Skeleton'

describe('Skeleton', () => {
  it('should render correctly', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.find('.xh-skeleton').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
