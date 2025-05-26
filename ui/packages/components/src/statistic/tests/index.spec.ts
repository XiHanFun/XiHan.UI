import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Statistic from '../src/Statistic'

describe('Statistic', () => {
  it('should render correctly', () => {
    const wrapper = mount(Statistic)
    expect(wrapper.find('.xh-statistic').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Statistic)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
