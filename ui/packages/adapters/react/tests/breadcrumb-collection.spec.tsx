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

  it('maxItems 折叠出的省略位是可操作的按钮：按下展开完整路径，焦点落到第一条展开出来的链接', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    const levels = ['首页', '文档', '指南', '组件', '面包屑'].map((label, i) => ({ value: `l${i}`, label, href: `#/${i}`, current: i === 4 }))

    await act(async () => root!.render(<XhBreadcrumbRoot collection={levels} maxItems={3} />))
    const texts = (): string[] => [...host!.querySelectorAll('[data-part="link"]')].map(link => link.textContent ?? '')
    expect(texts()).toEqual(['首页', '组件', '面包屑'])
    const ellipsis = host.querySelector<HTMLElement>('[data-scope="breadcrumb"][data-part="ellipsis"]')!
    expect(ellipsis.hasAttribute('aria-hidden')).toBe(false)
    const trigger = ellipsis.querySelector<HTMLButtonElement>('button[data-part="ellipsis-trigger"]')!
    expect(trigger.getAttribute('aria-label')).toBe('Show full path')

    await act(async () => {
      trigger.focus()
      trigger.click()
    })
    await act(async () => Promise.resolve())
    expect(texts()).toEqual(['首页', '文档', '指南', '组件', '面包屑'])
    expect(host.querySelector('[data-part="ellipsis"]')).toBeNull()
    expect(document.activeElement).toBe(host.querySelectorAll('[data-part="link"]')[1])
  })
})
