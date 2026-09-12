// @vitest-environment jsdom
//
// 每页条数控制器在 React 侧同样是库里的 select：一个组件铺完挂载点与被搬走的浮层两截。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhPaginationPageSizeSelect, XhPaginationRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(props: Record<string, unknown> = {}): void {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(
    <XhPaginationRoot count={196} defaultPageSize={20} pageSizeOptions={[10, 20, 50]} {...props}>
      <XhPaginationPageSizeSelect />
    </XhPaginationRoot>,
  ))
}

function selectPart(part: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="select"][data-part="${part}"]`)!
}

function options(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
}

describe('每页条数控制器（React 适配器）', () => {
  it('挂载点里装的是库里的下拉，不再是原生 select', () => {
    mount()
    const mountNode = document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="page-size-select"]')!
    expect(mountNode.tagName).toBe('DIV')
    expect(document.querySelector('select')).toBeNull()
    expect(mountNode.querySelector('[data-scope="select"][data-part="root"]')).not.toBeNull()
  })

  it('档位与档位文字都从连接层来', () => {
    mount({ translations: { pageSizeOption: (size: number) => `${size} 条 / 页` } })
    expect(options().map(el => el.getAttribute('data-value'))).toEqual(['10', '20', '50'])
    expect(selectPart('value-text').textContent).toBe('20 条 / 页')
  })

  it('可及名仍是 pageSizeSelect 那句', () => {
    mount({ translations: { pageSizeSelect: '每页条数' } })
    expect(selectPart('trigger').getAttribute('aria-label')).toBe('每页条数')
    expect(selectPart('trigger').hasAttribute('aria-labelledby')).toBe(false)
  })

  it('挑一档即换档，页码跟着换算', () => {
    const onPageSizeChange = vi.fn()
    mount({ defaultPageSize: 10, defaultPage: 5, onPageSizeChange })

    act(() => {
      selectPart('trigger').click()
    })
    act(() => {
      options().find(el => el.getAttribute('data-value') === '50')!.click()
    })

    expect(onPageSizeChange).toHaveBeenCalledWith({ pageSize: 50, page: 1 })
    expect(selectPart('value-text').textContent).toBe('50 / page')
  })
})
