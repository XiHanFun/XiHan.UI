// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhBreadcrumbRoot } from '../src'

const COLLECTION = [
  { value: 'home', label: '首页', href: '#/' },
  { value: 'components', label: '组件', href: '#/components' },
  { value: 'breadcrumb', label: '面包屑', current: true },
]

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  root = null
  host = null
})

describe('breadcrumb collection', () => {
  it('默认铺开层级并由皮肤绘制空分隔符', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

    await act(async () => root!.render(<XhBreadcrumbRoot collection={COLLECTION} />))

    const separators = [...host.querySelectorAll<HTMLElement>('[data-scope="breadcrumb"][data-part="separator"]')]
    expect(separators).toHaveLength(2)
    expect(separators.every(separator => separator.textContent === '')).toBe(true)
    expect(separators.every(separator => separator.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(host.querySelector('[data-part="link"][aria-current="page"]')?.textContent).toBe('面包屑')
  })
})
