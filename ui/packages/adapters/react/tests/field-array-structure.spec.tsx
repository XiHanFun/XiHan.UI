// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { XhFieldArrayRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

function mount(node: ReactNode): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
  return host
}

function parts(el: Element, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="field-array"][data-part="${name}"]`)]
}

describe('fieldArray 不给 children：照标准结构铺，逐行内容由渲染函数给', () => {
  it('列表排布：renderItemContent 拿到这一行，内容落在这一行的内容格里；换序后跟着行走', () => {
    const el = mount(
      <XhFieldArrayRoot
        defaultValue={['甲', '乙']}
        movable
        renderItemContent={item => <input defaultValue={String(item.value)} data-row={item.key} />}
      />,
    )
    expect(parts(el, 'item-content').map(content => content.querySelector('input')?.value)).toEqual(['甲', '乙'])
    const firstKey = parts(el, 'item-content')[0]!.querySelector('input')!.dataset.row

    act(() => parts(el, 'move-down-trigger')[0]!.click())
    expect(parts(el, 'item-content').map(content => content.querySelector('input')?.value)).toEqual(['乙', '甲'])
    expect(parts(el, 'item-content')[1]!.querySelector('input')!.dataset.row).toBe(firstKey)
  })

  it('没给 renderItemContent 时内容格空着；新增钮的文字取 translations.addTrigger', () => {
    const el = mount(<XhFieldArrayRoot defaultValue={['甲']} translations={{ addTrigger: '加一行' }} />)
    expect(parts(el, 'item-content')[0]!.childElementCount).toBe(0)
    expect(parts(el, 'add-trigger')[0]!.textContent).toBe('加一行')
  })

  it('表格排布：renderItemCell 拿到所在的行与列，每列一格', () => {
    const el = mount(
      <XhFieldArrayRoot
        layout="table"
        columns={[{ id: 'name', label: '名称' }, { id: 'amount', label: '金额' }]}
        defaultValue={[{ name: '差旅', amount: 120 }]}
        renderItemCell={(item, column) => <span>{String((item.value as Record<string, unknown>)[column.id])}</span>}
      />,
    )
    expect(parts(el, 'item-cell').map(cell => cell.textContent)).toEqual(['差旅', '120'])
    expect(parts(el, 'column-header').map(header => header.textContent)).toEqual(['名称', '金额'])
  })
})
