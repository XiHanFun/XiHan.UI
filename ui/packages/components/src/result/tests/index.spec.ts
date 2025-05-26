import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Result from '../src/Result'

describe('Result', () => {
  it('should render correctly', () => {
    const wrapper = mount(Result)
    expect(wrapper.find('.xh-result').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Result)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
