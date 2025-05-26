import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Segmented from '../src/Segmented'

describe('Segmented', () => {
  it('should render correctly', () => {
    const wrapper = mount(Segmented)
    expect(wrapper.find('.xh-segmented').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Segmented)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
