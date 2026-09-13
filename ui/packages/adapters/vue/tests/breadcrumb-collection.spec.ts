/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 breadcrumb collection 相关行为。

// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { XhBreadcrumbRoot } from '../src'

const COLLECTION = [
  { value: 'home', label: '首页', href: '#/' },
  { value: 'components', label: '组件', href: '#/components' },
  { value: 'breadcrumb', label: '面包屑', current: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

describe('breadcrumb collection', () => {
  it('默认铺开层级并由皮肤绘制空分隔符', () => {
    const wrapper = mount(XhBreadcrumbRoot, {
      props: { collection: COLLECTION },
      attachTo: document.body,
    })

    const separators = [...wrapper.element.querySelectorAll<HTMLElement>('[data-scope="breadcrumb"][data-part="separator"]')]
    expect(separators).toHaveLength(2)
    expect(separators.every(separator => separator.textContent === '')).toBe(true)
    expect(separators.every(separator => separator.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(wrapper.element.querySelector('[data-part="link"][aria-current="page"]')?.textContent).toBe('面包屑')
    wrapper.unmount()
  })
})
