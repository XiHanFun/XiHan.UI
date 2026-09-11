// @vitest-environment jsdom
import type { ReactElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhTextFieldInput, XhTextFieldRoot } from '../src'

let host: HTMLElement
let root: ReturnType<typeof createRoot> | null

function tree(value: string, autoSize: boolean | { minRows?: number, maxRows?: number }): ReactElement {
  return (
    <XhTextFieldRoot value={value} autoSize={autoSize}>
      <XhTextFieldInput as="textarea" style={{ blockSize: '19px', overflowY: 'scroll' }} />
    </XhTextFieldRoot>
  )
}

async function render(node: ReactElement): Promise<void> {
  await act(async () => root!.render(node))
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    lineHeight: '10px',
    fontSize: '10px',
    paddingBlockStart: '0px',
    paddingBlockEnd: '0px',
    borderBlockStartWidth: '0px',
    borderBlockEndWidth: '0px',
  } as CSSStyleDeclaration)
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
    return this.value.length * 10
  })
})

afterEach(async () => {
  if (root)
    await act(async () => root!.unmount())
  host.remove()
  vi.restoreAllMocks()
  delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
})

describe('react TextField textarea autoSize', () => {
  it('程序值与配置变化会重量，关闭和卸载都归还作者内联样式', async () => {
    await render(tree('aa', { maxRows: 10 }))
    const textarea = host.querySelector('textarea')!
    expect(textarea.style.blockSize).toBe('20px')

    await render(tree('abcdefgh', { maxRows: 10 }))
    expect(textarea.style.blockSize).toBe('80px')

    await render(tree('abcdefgh', { maxRows: 3 }))
    expect(textarea.style.blockSize).toBe('30px')

    await render(tree('abcdefgh', false))
    expect(textarea.style.blockSize).toBe('19px')
    expect(textarea.style.overflowY).toBe('scroll')

    await render(tree('abcd', true))
    expect(textarea.style.blockSize).toBe('40px')
    await act(async () => root!.unmount())
    root = null
    expect(textarea.style.blockSize).toBe('19px')
    expect(textarea.style.overflowY).toBe('scroll')
  })
})
