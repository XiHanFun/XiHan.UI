import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Upload from '../src/Upload'

describe('Upload', () => {
  it('should render correctly', () => {
    const wrapper = mount(Upload)
    expect(wrapper.find('.xh-upload').exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const wrapper = mount(Upload)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
