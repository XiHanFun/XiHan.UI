import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Pagination from '../src/Pagination'

describe('Pagination', () => {
  it('should render correctly', () => {
    const wrapper = mount(Pagination)
    expect(wrapper.find('.xh-pagination').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Pagination)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
