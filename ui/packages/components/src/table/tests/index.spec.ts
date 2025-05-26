import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Table from '../src/Table'

describe('Table', () => {
  it('should render correctly', () => {
    const wrapper = mount(Table)
    expect(wrapper.find('.xh-table').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Table)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
