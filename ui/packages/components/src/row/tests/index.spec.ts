import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Row from '../src/Row'

describe('Row', () => {
  it('should render correctly', () => {
    const wrapper = mount(Row)
    expect(wrapper.find('.xh-row').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Row)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
