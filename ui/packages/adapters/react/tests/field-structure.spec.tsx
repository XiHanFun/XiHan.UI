// @vitest-environment jsdom
// 不给 children 时照 fieldStructure 铺：control 原样放在标题之后，标题、说明、错误文案是字符串时作文字、是节点时由部件装着。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhFieldRoot, XhTextFieldRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(node: React.ReactNode): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  return host.firstElementChild as HTMLElement
}

function childrenOf(el: Element): string[] {
  return Array.from(el.children).map(node => node.getAttribute('data-part') ?? node.localName)
}

describe('field 的标准结构', () => {
  it('control 的库内控件放在标题之后，不包部件；字段把标签与说明接到控件的输入框上', async () => {
    const field = await render(<XhFieldRoot label="申请人" description="填写全名" control={<XhTextFieldRoot />} />)
    expect(childrenOf(field)).toEqual(['label', 'root', 'description'])
    const input = field.querySelector<HTMLElement>('[data-scope="text-field"][data-part="input"]')!
    expect(input.getAttribute('aria-labelledby')).toContain(field.querySelector('[data-scope="field"][data-part="label"]')!.id)
    expect(input.getAttribute('aria-describedby')).toContain(field.querySelector('[data-scope="field"][data-part="description"]')!.id)
  })

  it('错误文案给了才铺；给节点时由错误文案部件装着', async () => {
    const field = await render(<XhFieldRoot label="邮箱" errorText={<b>格式不对</b>} invalid />)
    expect(childrenOf(field)).toEqual(['label', 'error-text'])
    expect(field.querySelector('[data-part="error-text"] > b')!.textContent).toBe('格式不对')
  })
})
