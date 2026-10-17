// @vitest-environment jsdom
// 不写 children 时浮层里在空态之后铺在途占位，文字取 translations.loading；手写的在途占位留空时同样填它。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhComboboxContent, XhComboboxControl, XhComboboxInput, XhComboboxLoading, XhComboboxPositioner, XhComboboxRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(node: React.ReactNode): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="combobox"][data-part="${name}"]`)!
}

describe('combobox 的在途占位', () => {
  it('标准结构里铺在空态之后，文字取 translations.loading', async () => {
    await render(<XhComboboxRoot collection={[]} />)
    const positioner = part('positioner')
    expect(Array.from(positioner.children).filter(el => el.getAttribute('data-scope') === 'combobox').map(el => el.getAttribute('data-part'))).toEqual(['content', 'empty', 'loading'])
    expect(part('loading').textContent).toBe('Loading')
  })

  it('手写的在途占位留空时填 translations.loading，写了内容就归作者', async () => {
    await render(
      <XhComboboxRoot collection={[]} defaultOpen>
        <XhComboboxControl><XhComboboxInput /></XhComboboxControl>
        <XhComboboxPositioner>
          <XhComboboxContent />
          <XhComboboxLoading />
        </XhComboboxPositioner>
      </XhComboboxRoot>,
    )
    expect(part('loading').textContent).toBe('Loading')
    act(() => root?.unmount())
    document.body.innerHTML = ''
    await render(
      <XhComboboxRoot collection={[]} defaultOpen>
        <XhComboboxControl><XhComboboxInput /></XhComboboxControl>
        <XhComboboxPositioner>
          <XhComboboxContent />
          <XhComboboxLoading>正在搜索</XhComboboxLoading>
        </XhComboboxPositioner>
      </XhComboboxRoot>,
    )
    expect(part('loading').textContent).toBe('正在搜索')
  })
})
