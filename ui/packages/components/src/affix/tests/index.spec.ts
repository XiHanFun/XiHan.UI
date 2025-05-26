import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Affix from '../src/Affix'

describe('Affix', () => {
  it('should render correctly', () => {
    const wrapper = mount(Affix)
    expect(wrapper.find('.xh-affix').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Affix)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
