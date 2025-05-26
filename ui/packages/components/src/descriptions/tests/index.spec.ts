import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Descriptions from '../src/Descriptions'

describe('Descriptions', () => {
  it('should render correctly', () => {
    const wrapper = mount(Descriptions)
    expect(wrapper.find('.xh-descriptions').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Descriptions)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
