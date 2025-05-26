import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Popconfirm from '../src/Popconfirm'

describe('Popconfirm', () => {
  it('should render correctly', () => {
    const wrapper = mount(Popconfirm)
    expect(wrapper.find('.xh-popconfirm').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Popconfirm)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
